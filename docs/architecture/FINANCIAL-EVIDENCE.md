# 财务证据采集与原始资料

USER U-007要求数据支撑；下面是ASSISTANT实现约定。

原始年报从公司IR/注册机构取得，保存本地未跟踪目录；sources保留URL、抓取日、原始内容hash（可选）与定位。可用`python scripts/extract-pdf.py input.pdf output.txt`提取带PDF页序的文本。扫描版需OCR，当前不包含OCR适配器。PDF物理页序与印刷页码不同，需要在locator注明。

文本提取不能替代对财务表列的核对。年度、币种、单位、持续经营/终止经营、集团/母公司需明确；同页多个年份按表头对应。把财务数字写入financialFacts，并在markdown写推导与原始链接。原始PDF不会随源码提交，源码仓库只包含合成示例。

外部搜索/模型选择仍在TASK-04；有PDF解析工具不代表独立研究已经自动完成。
