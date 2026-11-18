# 数据库与存储

线上既有实现：Cloudflare R2对象存储，`jobs/{id}.json`与`reports/{date}.json`；不是关系数据库。声明模板hosting.sites.example.json，路由worker/index.js。

本次新增独立实现：Node24内置SQLite，首次openDatabase执行migrations/001_initial.sql，schema_migrations记录版本。数据库文件默认.data/career.sqlite，WAL模式、foreign_keys和busy_timeout启用。SQLite没有内置加密，应使用受保护的磁盘和备份。

| 表 | 作用 |
|---|---|
| objects | 与线上R2兼容的岗位/报告JSON与摘要metadata |
| object_revisions | 更新前对象版本，便于恢复审计 |
| job_index | 后台主键、公司、岗位、主题、发布日期及首次观察 |
| runs | 计划日幂等、执行成功/失败、发布时间状态 |
| run_jobs | 本次运行关联的岗位 |
| sources | 原始证据URL、抓取日、页码定位、可选内容hash |
| financial_facts | 带单位/币种/实体/定义/来源的财务事实 |
| mail_messages | 私有邮件缓存，永不提交Git |

`run.status=succeeded`说明流程结束，不代表report.status=complete。本地成功也不等于已发布，须看publication_status=verified。

bundle导入使用事务；原始对象和job_index一起更新，外键错误整批回滚。来源与事实使用稳定主键upsert，审核级历史事实版本功能尚未实现，旧报告对象仍在revisions中。

新增schema必须新建编号SQL迁移，并升级迁移runner（目前只执行001，尚无通用多版本迁移器）。不得在生产已应用后直接修改001。备份与恢复见../docs/operations/BACKUP-RESTORE.md。
