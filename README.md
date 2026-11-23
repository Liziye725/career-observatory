# 职业观察 · Career Observatory

从 Gmail 招聘推荐到公司财报、岗位价值、成长练习和私人主题档案。

当前版本包含 **现有网站完整源码 + R2 存储实现 + 新增 SQLite 数据库、迁移、运行日志、Gmail 读取适配器和调度框架**。研究本身目前由 ChatGPT 任务/人工会话完成；独立框架通过 `RESEARCH_EXECUTABLE` 接入研究执行器，尚未绑定某个模型或搜索供应商。没有研究执行器时会明确失败，不生成假报告。

## 快速运行（Node.js 24+）

```bash
npm test
npm run demo
npm start
```

本地打开 http://127.0.0.1:8787 。合成样本只有一家虚构公司，状态为试跑，不能视为达到六家公司正式标准。无需 npm install，无第三方运行依赖。首次写入自动执行 SQLite 迁移，数据保存在 `.data/career.sqlite`，不会提交到 Git。

```bash
# 导入已完成的研究（岗位、报告、财务事实与来源）
node scripts/import-bundle.mjs examples/demo-bundle.json
# 带运行日志的人工补跑；日期必须与输入报告日期一致
node scripts/run.mjs --date 2026-01-01 --bundle examples/demo-bundle.json
# 备份，包含WAL已提交数据
npm run backup
```

完整目录见 [文档导航](docs/INDEX.md)。先读 [你的要求](docs/requirements/USER-REQUIREMENTS.md)、[助手实现选择](docs/provenance/ASSISTANT-DECISIONS.md) 和 [当前完成状态](docs/tasks/TASK-INDEX.md)。

## 两条运行路径

| 路径 | 当前能力 | 尚需配置 |
|---|---|---|
| Sites + ChatGPT任务 | 现有线上网站、主题档案、R2、研究提示与服务归档；历史人工补跑已验证 | Sites项目与Gmail连接；平台自动触发可靠性尚需观察 |
| 独立Node服务 | SQLite持久化、API/UI、备份、运行幂等、定时判断、Gmail OAuth适配、研究接口、可选Sites发布 | Gmail OAuth、实际研究执行器、常驻主机；如公开部署还需身份网关 |

源码仓库不自动提供邮箱授权、模型额度或网站托管。GitHub CI构建和测试；新增 Schedule sync 在任务回执提交后校验并汇总运行/问题分类，不会读取邮箱或执行研究。详见 [成本与独立性](docs/operations/COSTS-AND-INDEPENDENCE.md)。

## 读者展示

页面和报告使用公司、岗位名称、发布日期。未知日期明确显示未知。岗位ID只用作数据库主键、API参数及链接目标；下载文件名使用人类可读标题。发布日期、邮件收到日、发现日、研究日互相独立。

## 数据与权限

不附带原始邮件、个人邮件链接、服务token或当前账号的部署标识。`examples/` 全部为合成数据。Worker依赖Sites私有网关；本地服务器只监听回环地址。直接公开未加身份认证的API不在本版本支持范围内。

[GitHub发布与复现](docs/operations/GITHUB.md) · [数据库](database/README.md) · [研究指令](instructions/RESEARCH.zh-CN.md) · [研究技能](skills/README.md) · [工具清单](tools/TOOL-CATALOG.md)

## 分轮研究与每轮GitHub同步

每轮接续私人检查点，优先深化1–2家公司；六家公司的完整综合报告跨轮完成。每轮结束提交不含私人内容的结构化回执，push触发Actions，集中展示执行状态、研究完成度和问题频次。完整报告与失败证据仍在私人站点。详见[分轮规则](instructions/ITERATIVE-RESEARCH.zh-CN.md)与[同步协议](instructions/SCHEDULE-SYNC.zh-CN.md)。

```bash
node scripts/run-receipts.mjs check /tmp/public-receipt.json
node scripts/run-receipts.mjs summary automation/runs .data/schedule-summary.md
```

未写入回执不等于未运行；没有回执时汇总明确为空。Actions不消耗ChatGPT模型额度；GitHub资源额度依账号政策。

## 持久运行与改进账本

私人站点 `/ledger` 集中展示项目、未解决问题、历次尝试、改进与用户反馈，支持Markdown导出。线上沿用R2追加JSON事件；本地独立版存SQLite的objects表。旧事件不覆盖，重试按固定id幂等，跨轮按subject关联。详见[账本协议](instructions/LEDGER.zh-CN.md)。GitHub不保存私人日志。
