# 备份、恢复和迁移

`npm run backup` 使用 SQLite VACUUM INTO生成一致性快照，避免只复制主文件而遗漏WAL。备份默认在backups，Git忽略；请自行加密保存至可信持久存储。

恢复步骤：停止服务器和scheduler；备份当前库；用目标备份替换.data/career.sqlite并移走旧wal/shm；先在独立DATA_DIR打开检查，再启动。不要覆盖仍运行的数据库。

R2→SQLite：通过已授权私有Site GET /api/jobs及逐条正文、GET /api/reports及逐条正文导出；组装bundle并导入。示例不包含真实用户数据。导出脚本尚未提供，TASK-03单独处理；不要直接把当前账号token写入源代码。

SQLite→Site：run.mjs读取已审查bundle，publisher先岗位后报告、逐条读回。报告读回成功才能标记verified；失败重试同稳定ID。不能用SQL备份直接替换R2，需要通过契约转换。
