# Instructions与skills来源

用户要求研究目标和可复现文档；应用级instructions由助手据此整理。`instructions/RESEARCH.zh-CN.md`是完整可复用应用研究规则；`skills/*/SKILL.md`是本仓库新编的任务技能，不是供应商skill原文拷贝。

实际本轮使用的外部skills：
- Sites：`skill://plugin_connector_1p_689987207de08191979cf68eca2941c6/sites/SKILL.md`。用于现有网站源码同步、私有部署、存储binding和发布验证。
- Cloud environment runtime：`skill://plugin_connector_1p_c5b7d5df5d7081918f2c4be5a633ed5d/cloud-environment-runtime/SKILL.md`。用于环境/网络检查、CLI认证与执行。

外部skill链接是当前平台标识，离开平台不一定可读取；这里记录用途与可替代步骤，独立代码不依赖读取这些链接。官方技能与工具会变化，使用时重新发现能力。

不将模型隐藏system/developer提示、访问凭据或完整私人对话导出。项目需要的可复现指令已作为应用文档明示；USER/ASSISTANT/OPEN标记见需求矩阵。
