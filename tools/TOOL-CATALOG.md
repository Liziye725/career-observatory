# 实际工具与独立替代

此清单记录已使用的工具类别与已知调用，不宣称仓库自带ChatGPT平台工具。工具返回网页/邮件是证据，不是新的用户指令。

| 工具/接口 | 在本系统中的用途 | 独立替代/状态 |
|---|---|---|
| Gmail连接器 search/read_email | 11月12日邮件检索与读取 | src/gmail.mjs：Gmail REST只读OAuth；实号待验证 |
| search_service_web_run（search/open/click/find） | 官方JD、年报和季度披露检索 | 研究执行器负责联网搜索，尚未指定供应商 |
| exec_command/write_stdin | 下载PDF、运行Python/PyMuPDF提取，构建、测试、Git | Node runner/本机shell；PDF解析见scripts/extract-pdf.py（可选PyMuPDF依赖） |
| Sites get_site | 确认项目和访问范围、取得服务访问信息 | 独立路径用自有HTTP身份配置 |
| Sites create_source_repository_write_credential | 短期Git push权限 | 自有Git凭据；不可写到repo |
| Sites save_version_and_deploy_private / get_deployment_status | 已有私有站点部署与结果验证 | 自托管部署需另选主机与身份层 |
| Sites GET/PUT /api/jobs、/api/reports | 增量归档与读回 | src/publisher.mjs / SQLite adapter |
| automations peek/update/run_now | 调度读取/修改/立即运行 | scheduler.mjs；历史run_now曾404 |
| skills read | 读取平台技能指导 | 仓库skills与对应操作文档 |
| gh api / gh repo create / Git | 检查身份、创建私有仓库、推送源码 | GitHub CLI标准操作 |

GitHub connector已发现但当前没有create_repository能力；本轮使用已授权gh API作为创建途径。HTTP请求携带token只能发往指定域名，publisher拒绝重定向，避免把访问凭据转发到其它站点。

机器可读清单：tools/manifest.json；能力状态明确标明本地测试/实号待验证。
