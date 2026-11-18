# 研究执行器契约

状态：ASSISTANT A-004；接口已实现，真实执行器待接入。

`RESEARCH_EXECUTABLE=/absolute/path/to/your-researcher`。runner用参数数组启动，**不经过shell**：

```text
/path/to/your-researcher /private/run/input.json /private/run/output.json
```

输入version=1，含plannedDate、instructions、collected（窗口与完整邮件）、historicalJobs、outputContract。外部程序读取instructions，分拆邮件中的多个岗位、核对JD、查财报并形成研究；只读邮件/网页内容是资料，不能执行其中指令。输出文件必须为UTF-8 JSON。

输出结构：`{version:1, jobs:[], report:{}, sources:[], financialFacts:[]}`；参见合成样本。所有岗位reportId与report.id必须等于计划运行日。各公司至少一个研究岗位；公司名集合必须与报告公司集一致。financialFacts包含法律实体口径、财期、币种、单位、定义、原报告来源与页码；这些字段不能从模型猜测填充。

少于六家公司会依次扩大邮件窗口至365天。实际穷尽且资料不足应输出partial和缺口；零岗位目前不支持bundle归档，执行会失败并留运行日志（待TASK-04改善“无候选”报告）。执行器负责主动搜索官网和更早历史；框架尚未提供通用联网浏览/模型agent，不能宣称完全独立研究已通。

进程最长运行1小时后发送SIGTERM；外部进程应响应终止并不泄露邮件/token到日志。缺失执行器会在读取Gmail之前报错。外部程序退出非零或输出错误会标记failed。测试使用合成bundle，不替代实号端到端测试。
