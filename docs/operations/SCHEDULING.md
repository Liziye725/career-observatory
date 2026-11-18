# 每周四次与补跑

已知要求：2026-11-12开始、每周四次。当前选择：Europe/Copenhagen，周一二三四16:00。配置来源见ASSISTANT-DECISIONS.md。

独立入口 `node --env-file=.env scripts/scheduler.mjs`，每分钟按IANA时区判断；自动跟随夏令时，不用固定UTC偏移。默认同日8小时补偿窗口，到午夜结束。长期离线跨日不会擅自补所有历史，需要显式补跑。

```bash
node --env-file=.env scripts/run.mjs --date 2026-11-12
# 失败后显式重试；成功/仍运行日期不会重复启动
node --env-file=.env scripts/run.mjs --date 2026-11-12 --retry
```

runs表BEGIN IMMEDIATE预约同日键，避免两个进程并发重复运行。进程崩溃可能留下running：先确认旧进程结束、备份，再由维护人员将该行置failed并写恢复理由，之后--retry；不自动抢占仍运行任务。

常驻机器必须保持在线，有持久磁盘、OAuth及研究执行器。GitHub Actions CI没有schedule；不在不可靠的临时runner上假装SQLite会永久存在。可选常驻自托管runner/systemd属于后续部署任务。

历史：11月12日平台run_now返回404 Action not found，随后会话人工补跑并读回成功。该事件不证明保存的下次自动任务一定会执行。原Sites/ChatGPT调度与独立scheduler二选一，避免双重跑；切换前检查计划日幂等。
