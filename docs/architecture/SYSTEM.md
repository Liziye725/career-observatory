# 系统架构

来源：ASSISTANT A-002/A-004/A-010，服务USER U-001至U-015。

```mermaid
flowchart LR
 Gmail[Gmail招聘推送] --> Collector[只读收集器]
 Collector --> Research[研究执行器：JD与官方财报]
 Research --> Bundle[结构化研究bundle]
 Bundle --> Validate[校验与来源检查]
 Validate --> SQLite[SQLite事务与历史版本]
 SQLite --> Local[本地UI与API]
 Bundle --> Publish[可选Site发布与读回]
 Publish --> R2[私有Site R2]
 R2 --> Site[线上主题档案与运行报告]
```

研究执行器是明确的扩展边界：目前不随仓库提供自动模型实现。已验证的生产研究是会话/ChatGPT路径，不是SQLite runner已自动搜完六家公司。

`worker/index.js` 是共享读取/写入API；Sites直接使用R2 binding；本地Node服务器传入SQLite实现的同一BUCKET契约。SQLite是独立运行存储，不是声称线上Site已经换成SQL。

同步到Site非跨对象事务：岗位先写、报告最后写并验证。部分网络失败可能已写入一些岗位；重试同稳定主键收敛，不能称为全站原子发布。SQLite导入bundle在单事务中完成，失败回滚。
