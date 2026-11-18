# Gmail接入

现有ChatGPT路径使用连接器search/read；独立框架使用Gmail REST与OAuth refresh token，两者授权不能互相替代。

1. 在自己的Google Cloud项目启用Gmail API，配置OAuth同意屏幕及客户端。
2. 用只读scope `https://www.googleapis.com/auth/gmail.readonly` 完成用户授权，取得refresh token；不要把凭据贴聊天或提交Git。
3. 在本机环境变量或未跟踪.env中设置GMAIL_CLIENT_ID、GMAIL_CLIENT_SECRET、GMAIL_REFRESH_TOKEN。
4. `node --env-file=.env scripts/collect-gmail.mjs 7`，只输出数量，正文写本地数据库。

适配器分页读取，保留纯文本优先/HTML兜底，暂不下载附件。正文链接可能含跟踪参数，研究执行器在持久证据中须清除个人跟踪/退订信息。发件人是范围过滤，不是对邮件内容的信任授权。

刷新失效立即报错，不能伪称读取成功；OAuth测试模式/组织政策可能影响长期token有效性，部署时需实测。此版本没有代用户创建Google Cloud项目或授权，也未实号验证独立适配器。
