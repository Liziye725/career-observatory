# 发布日期与读者展示

USER U-012/U-014；字段设计ASSISTANT A-008。

- `publishedDate`：岗位发布日；`publishedDatePrecision` exact/estimated/unknown。未知用null，不填今天。
- `publishedDateSourceUrl`：证据链接；`publishedDateEvidence`：人类可读证据，不能把岗位编号写成读者标题。
- `publishedDateObservedAt`：相对日期换算所需观察日；另记录原文和时区说明。
- `firstSeenAt`：本档案首次存储观察时间；不是早于建库的邮件接收日。
- `updatedAt`：档案修改时间；`mail_messages.received_at`：邮件接收时间。

同岗位不同平台、重发和抓取日期不得静默合并成一个“真实”时间。已有可核验日期后续不得被unknown覆盖；重新发布日期须保留旧证据。SQLite revisions保留历史对象。未来仍需解决跨平台相对日期与重发日期的统一策略，不能把estimated视为exact。

页面用“公司 · 岗位 · 发布日期”。后端ID在链接目标允许存在，下载文件名不使用ID。报告来源链接允许包含网站自身编号，但链接的可见文字不得写编号。
