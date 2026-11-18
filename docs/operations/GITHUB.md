# GitHub发布与复现

本次默认创建私有仓库，以免把职业研究配置当作公开作品集。源码不包含真实邮件和当前Site项目标识，仓库中的例子是合成的。仓库私有不等于所有将来的日志都安全，CI不要打印凭据。

```bash
git clone <仓库URL>
cd career-observatory
node --version # 24+
npm test
npm run demo
npm start
```

Sites部署：用自己的Sites项目返回值填写.openai/hosting.json；build后将dist/server/index.js与该manifest打包，推送到Sites所要求的source remote，再保存版本和部署。Sites managed remote与用户GitHub remote不是同一仓库，不能用一个远程的SHA冒充另一个。先读Sites官方skill当期接口，不把本项目的历史调用格式当成永久兼容。

独立部署见SCHEDULING.md和GMAIL.md；模型研究适配器见RESEARCHER-CONTRACT.md。GitHub仓库本身不承载私人动态网站、邮箱凭据或R2数据。

## 本次上传状态（2026-11-13）

GitHub CLI已识别账号，但createRepository返回`Resource not accessible by integration`。未创建远程仓库、未推送GitHub；完整源码已本地提交并提供ZIP。用户创建空的私有仓库后提供URL，再添加remote并push；不要求用户在聊天粘贴token。

## 仓库接入更新（2026-11-18）

用户已创建公开仓库`Liziye725/career-observatory`。GitHub连接器已验证push权限且安装范围为all；创建仓库权限与已有仓库写入权限独立。源码按用户最新要求上传公开仓库，真实邮件和私人研究数据不纳入。
