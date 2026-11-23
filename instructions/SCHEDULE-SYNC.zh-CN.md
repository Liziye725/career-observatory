# Schedule → GitHub Actions 同步协议

来源：USER U-019；公开字段白名单与Actions分工为 ASSISTANT A-011。

研究仍由已有ChatGPT Schedule运行。每轮先保存私人站点内容与复盘，再用已连接GitHub工具向 `Liziye725/career-observatory` 默认分支提交一个回执；push自动触发 `Schedule sync`，校验并生成集中运行/问题频次汇总。Actions不调用模型、不读取Gmail、不重新抓取私人网站，不需要新模型API key或站点令牌。

## 运行前后

1. 读取本协议及 [分轮研究](ITERATIVE-RESEARCH.zh-CN.md)，并读取私人检查点。任务代码：招聘 `career`、AI观察 `ai`、CEO `ceo`、权力账本 `power`、电机课程 `drives`。
2. 确定计划日期（Europe/Copenhagen）及本次尝试次数。第一次为1，实际重新执行才递增；仅重试GitHub同步保持次数和内容不变。读取已有路径避免覆盖旧尝试。
3. 私人归档保存完整复盘/续办，读回验证。网站失败也可提交失败回执。任务被强制终止或额度瞬间耗尽时可能无法执行收尾；下一轮核实运行记录补记，不编造完成时间或“未运行”。
4. 显式构造下列全部字段，不从私人对象做展开或序列化。将JSON放在临时文件，用 `node scripts/run-receipts.mjs check 临时文件` 校验后才提交。没有本地执行环境则仅在能完整核对同一白名单时提交；不能验证则保留私人同步待办。
5. GitHub create_file 写入 `automation/runs/{task}/{plannedDate}-a{attempt}.json`，返回commit后fetch_file逐字段读回。路径存在且内容相同则视为已同步；不同则检查真实尝试次数，不覆盖历史。同一实际执行的信息更正用update_file及最新blob SHA，私人归档记录更正原因。
6. 回报commit链接与Actions链接。只有看到该commit对应workflow成功，才能说Actions通过；仅提交成功则说“回执已提交，Actions待验证”。权限不足或同步失败则私人报告记录待重试，下一轮优先补同步，不重跑研究。

## 唯一允许的公开字段

| 字段 | 规则 |
|---|---|
| version | 数字1 |
| task | career / ai / ceo / power / drives |
| plannedDate | 计划运行日 YYYY-MM-DD |
| startedAt / finishedAt | 真实UTC时间，ISO格式含三位毫秒，如 2026-01-01T01:00:00.000Z |
| attempt | 1–1000整数，实际尝试次数 |
| execution | succeeded / failed / blocked |
| research | partial / complete / no_change |
| archive | verified / failed / not_attempted |
| stage | discovery / evidence / analysis / synthesis / archive |
| completedUnits | 本轮完成研究单元数，0–10000整数 |
| reusedSources | 已复用来源数，0–100000整数；无法测量填null |
| issues | 不重复的枚举数组；无问题填[] |
| nextAction | 单个枚举 |

issues枚举：source_unavailable、auth_required、quota_limited、archive_failed、readback_failed、duplicate_work、insufficient_evidence、history_unavailable、validation_failed、unknown。

nextAction枚举：continue_research、verify_sources、retry_archive、restore_access、wait_for_quota、review_with_user、advance_topic、none。

execution=succeeded必须archive=verified；partial研究可以执行成功。failed/blocked必须有问题分类。不要用complete表示“这次用完了时间”；它必须达到该任务验收标准。

不允许额外字段、自由文本、报告、邮箱地址、私人站点链接、任务/会话标识、错误原文、个人反馈或凭据。代码白名单只能检查格式，真实语义仍须研究任务核验；提交后CI检查不能撤回已经公开的内容，因此必须提交前校验。

## 集中查看与限制

在仓库Actions中打开最新 `Schedule sync` 的Summary，查看全部回执和反复出现的问题；`schedule-summary`下载包保留30天，源回执在Git中持续保存。完整问题、改进、续办和用户反馈写入共享私人账本（参见LEDGER.zh-CN.md），完整研究仍留各原站点；并未复制所有私人站点全文到一个数据库。不会自动发邮件或虚构用户反馈。

GitHub公开状态不等于网站实时数据备份；公开仓库仍遵循不提交真实报告的约定。若未来需要完整历史同步，应另选私有数据目的地。
