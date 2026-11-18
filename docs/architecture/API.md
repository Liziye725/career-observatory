# API契约

| 方法 | 路径 | 返回/作用 |
|---|---|---|
| GET | /api/topics | topic slug到中文名称 |
| GET | /api/jobs | 岗位摘要，发布日期降序，未知最后 |
| GET/PUT | /api/jobs/{后台主键} | 单岗读取/幂等更新 |
| GET | /api/reports | 历史报告列表 |
| GET/PUT | /api/reports/{计划日期} | 报告读取/幂等更新 |
| GET | /api/workflow | 研究规则、schedule与API说明 |

字段验证详见 worker/jobs.js、worker/index.js；可运行例子 examples/demo-bundle.json。未知/关闭/冲突招聘状态与研究质量是独立字段。`complete`只作结构门槛（六家）；代码无法证实研究真实性，仍需研究检查。

ID只出现在后端字段与链接参数。API并非隐藏ID的安全边界；“不展示”是阅读体验要求，不是让用户不能在开发者工具看到ID。

生产认证由Sites私有网关负责；本地仅监听127.0.0.1并检查Host/Origin。HTTP错误返回JSON error；写入只接受JSON并限制体积。`GET /api/workflow`无需数据库binding，其他档案接口缺存储返回503。
