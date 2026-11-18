# 分任务交付与当前状态

| Task | 状态 | 范围 |
|---|---|---|
| [TASK-01](TASK-01-REPOSITORY-AND-PROVENANCE.md) | 源码完成；用户已建公开仓库并验证写入权限 | 完整源码、需求来源、instructions/skills、工具文档、私有GitHub交付 |
| [TASK-02](TASK-02-DATABASE-AND-PRESENTATION.md) | 本轮实现并测试 | SQLite/schema/备份/修订历史，UI不展示岗位ID，线上数据展示清理 |
| [TASK-03](TASK-03-HISTORICAL-MIGRATION.md) | 待做 | 私人R2历史数据导出到独立数据库及核验 |
| [TASK-04](TASK-04-AUTONOMOUS-RESEARCH.md) | 接口已实现、实号未接入 | Gmail授权、模型/搜索/PDF工具、完整六公司自动研究 |
| [TASK-05](TASK-05-OPERATIONS.md) | 调度逻辑已实现、生产运行待验证 | 常驻主机、登录、失败告警、自动补跑、成本与权限 |

不因为接口代码存在而把TASK-04/05写成完成。对应测试结果见docs/operations/VALIDATION.md。
