# 用户明确要求（USER）

来源：本对话中可见用户消息的整理，不是完整逐字聊天记录。未见到的历史细节不补写。

| 编号 | 明确要求 | 对应实现/文档 |
|---|---|---|
| U-001 | 从自己的Gmail招聘推送读取，主要Jobindex和LinkedIn | src/gmail.mjs；GMAIL.md |
| U-002 | 公司商业模式、盈利增长、前景、瓶颈 | instructions/RESEARCH.zh-CN.md |
| U-003 | 岗位在公司中的作用、招聘动机和商业价值 | skills/job-analysis/SKILL.md |
| U-004 | 真实级别、硬软实力、JD最看重的点 | 同上 |
| U-005 | 技术栈、新兴技术、多岗位和公司对比 | skills/career-growth/SKILL.md |
| U-006 | mid-senior向更高层积累，训练领导力及CTO/CEO判断，理解业务线/产品/周期 | skills/career-growth/SKILL.md |
| U-007 | 必须上网找财报，以数据支撑分析 | skills/financial-research/SKILL.md |
| U-008 | 至少六家不同公司，数量不足自动放宽时间窗口；不限最近7天发布 | instructions/RESEARCH.zh-CN.md；run.mjs |
| U-009 | 固定链接，能浏览历次运行结果 | client.js；worker/index.js |
| U-010 | 开始日期改为11月12日，并补跑当日 | config/schedule.json；历史运行记录 |
| U-011 | 每周四次；增量进入对应文件夹/topic，每次按岗位性质分类 | config/schedule.json；worker/jobs.js |
| U-012 | 标注岗位发布日期 | worker/jobs.js；PUBLICATION-DATES.md |
| U-013 | 完整代码、instructions、skills、工具说明，最终放GitHub | 本仓库 |
| U-014 | 报告不要提岗位ID，只显示岗位/公司/发布日期；ID在后台数据库 | client.js；src/bundle.mjs；数据库主键 |
| U-015 | 数据库也放进代码，完整系统框架；确定内容先写，不确定可分task；多份对应命名md | database/；docs/tasks/ |
| U-016 | 明确区分用户要求和助手生成部分 | 本表与ASSISTANT-DECISIONS.md |

用户曾询问“全部免费、完全独立能否实现”。这是需要回答和设计的目标，不等于已选定某免费云产品。用户曾报告invalid_state登录错误；本仓库不声称该外部身份问题已修复。
