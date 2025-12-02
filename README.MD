# 模板发布助手（网页端）

提供一个简洁的网页，填写「模板名」和「版本号」即可调用接口完成发布，也支持一次性粘贴多条 `模板名:版本号` 进行批量发布。前后端都在同一个 Node 服务里，方便直接用 Docker 部署到 VPS。

## 功能
- 单条发布：输入模板名 + 版本号，点击“开始发布”即可。
- 批量发布：在文本框每行粘贴一条 `模板名:版本号`，也兼容空格或竖线分隔。
- 结果展示：每条请求的成功/失败信息即时显示，页面不存储任何数据。

## 本地运行
1. 安装依赖  
   ```bash
   npm install
   ```
2. 配置环境变量（可写入 `.env`，文件已加入 `.gitignore`）：
   ```bash
   API_KEY=你的API_KEY
   SECRET=你的SECRET
   AUTH_URL=https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/auth/generate-signature
   PUBLISH_URL=https://spa-shop-sandbox2.eshoptechhub.com/spa-open-api/versions/publish
   PORT=3000
   ```
3. 启动服务  
   ```bash
   npm start
   ```  
   浏览器访问 `http://localhost:3000`。

## Docker 部署
1. 复制一份 `.env`（内容同上）到当前目录。
2. 构建镜像  
   ```bash
   docker build -t publish-web .
   ```
3. 运行容器  
   ```bash
   docker run -d --name publish-web \
     --env-file .env \
     -p 3000:3000 \
     publish-web
   ```  
   访问 `http://<你的服务器IP>:3000` 即可。

## 目录说明
- `server.js`：Express 后端，暴露 `/api/publish` 接口并托管静态页面。
- `publisher.js`：发布逻辑封装，负责获取签名并调用发布接口。
- `public/index.html`：前端页面，包含输入表单、批量粘贴和结果展示。
- `publish.js`：命令行批量发布脚本，复用了同一套发布逻辑。

## 使用提示
- 批量格式示例：  
  ```
  template-a:v1.0.0
  template-b v2.3.1
  template-c|v1.2.0
  ```
- 页面不会记录你的输入，所有请求直连后端接口；若需要基本健康检查，可访问 `/health`。
