# 持久运行与改进账本

来源：USER U-020/U-021；追加式JSON和页面交互为ASSISTANT A-012。

账本位于用户既有、仅所有者可访问的职业观察站 `/ledger`。站点身份由已保存任务提供，不把私人地址、凭据或完整日志提交到公开GitHub。所有项目共用该账本，项目代号为career、ai、ceo、power、drives，系统问题用system。

## 每轮固定流程

1. 使用 Sites get_site 获取指定中心站的当前地址和仅对该站有效的服务访问，确认只有所有者可访问。授权只通过隐藏stdin交给HTTP客户端；不保存或打印token。
2. GET `/api/ledger?project={project}`，阅读未解决问题、已记录反馈、批次进度；按需GET `/api/ledger?project={project}&subject={subject}`读取历史，再逐条GET `/api/ledger/events/{id}`取正文。不要每次重读所有项目全部历史。
3. 同一问题/改进/批次沿用subject。新观察产生新event id，重试同一写入必须保留id、内容、observedAt。PUT `/api/ledger/events/{id}`；201表示新增，200表示同内容已存在，409表示冲突，不覆盖，先读回。该接口只追加，不支持删除或覆盖。
4. 至少追加本轮run记录；出现问题/低效则追加problem；试验方法改善则追加improvement；保存批次batch检查点。每完成一个有价值阶段先保存并读回，再推进。
5. 用户反馈保持原意，只将实际收到的话记录为author=user；助手对反馈的执行结果使用author=assistant和相同subject，status=applied，并说明证据。不要虚构用户反馈或把没有回复当作同意。
6. 研究成果仍保存各自原站点并读回；共享账本存问题、续办和链接，不复制所有原始报告。GitHub同步遵循原白名单协议。私人账本失败时，先保存到任务原有私人归档并列为待同步，不宣称已集中。

## 写入字段（全部必填）

| 字段 | 规则 |
|---|---|
| id | 小写字母数字连字符，2–120字符；一次观察的稳定键 |
| project | career / ai / ceo / power / drives / system |
| kind | run / problem / improvement / feedback / batch |
| subject | 同一事项的稳定键，格式同id；跨轮沿用 |
| status | open / blocked / in_progress / resolved / proposed / testing / validated / rejected / recorded / applied / partial / complete / failed |
| author | user / assistant；只按真实来源填写 |
| title / summary / markdown | 非空字符串，上限180 / 1200 / 60000字符；不含凭据 |
| relatedRun | 对应运行subject，未知或无关联为null |
| observedAt | 实际观察时间，UTC ISO含三位毫秒；未知开始时间不要猜测 |
| metrics | 对象；仅允许completedCompanies、targetCompanies、reusedSources、attempts、durationSeconds，非负整数或null |

服务端增加createdAt。题目、摘要、正文可以中文。每条problem正文必须写明尝试、证据、原因（确认/假设）、影响、下一步和重试条件；每条improvement写明原方法、替代方法、实际结果、成本及验证限制。metrics测不到用null，不把处理过的两家公司当作已通过完整验收的两家。

## 读取、讨论和导出

`/ledger`按项目/类型/状态筛选，查看同一事项的历史，在页面填写反馈，保存后读回。`GET /api/ledger/export.md`导出全部历史，也可加project参数。下载内容是私人数据，不得加入公开仓库。

当前实现：线上沿用现有R2，以`ledger/events/{id}.json`持久追加；索引放对象metadata，读取时合并出最新事项状态。条件创建保证同ID并发时不覆盖。独立Node版本通过SQLite `objects`表存同样JSON，以事务和唯一key实现相同语义。两种存储并未自动双向同步；公开GitHub只存实现及脱敏回执。

第一版适合个人账本；列表按项目过滤前仍需扫描索引，数据量大时应迁移到D1/SQLite独立事件表和索引。迁移需要明确回填核验，不在请求处理时偷偷建表。现有SQLite schema没有变化，因此本次不改写历史SQL迁移。
