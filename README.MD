# 模板发布助手(网页端)

提供一个简洁的网页,填写「模板名」和「版本号」即可调用接口完成发布,也支持一次性粘贴多条 `模板名:版本号` 进行批量发布。前后端都在同一个 Node 服务里,方便直接用 Docker 部署到 VPS。

## 功能特性

- ✅ **单条发布**: 输入模板名 + 版本号,点击"开始发布"即可
- ✅ **批量发布**: 在文本框每行粘贴一条 `模板名:版本号`,也兼容空格或竖线分隔
- ✅ **环境切换**: 支持在"测试2"和"测试3"环境之间一键切换,选择会自动保存
- ✅ **结果展示**: 每条请求的成功/失败信息即时显示,页面不存储任何数据

## 环境说明

应用内置了两套环境配置,无需修改代码即可在界面上切换:

- **测试2环境 (sandbox2)**: `https://spa-shop-sandbox2.eshoptechhub.com`
- **测试3环境 (sandbox3)**: `https://spa-shop-sandbox3.eshoptechhub.com`

## 本地运行

1. 安装依赖  
   ```bash
   npm install
   ```

2. 配置环境变量(可写入 `.env`,文件已加入 `.gitignore`):
   ```bash
   API_KEY=你的API_KEY
   SECRET=你的SECRET
   PORT=3000
   ```
   
   > **注意**: 不再需要配置 `AUTH_URL` 和 `PUBLISH_URL`,环境 URL 已内置在应用中,通过界面切换即可。

3. 启动服务  
   ```bash
   npm start
   ```  
   浏览器访问 `http://localhost:3000`

## VPS Docker 部署

### 方式一: 使用 .env 文件(推荐)

1. **在 VPS 上准备工作目录**
   ```bash
   mkdir -p ~/publish-app
   cd ~/publish-app
   ```

2. **上传代码到 VPS**
   
   使用 git:
   ```bash
   git clone <你的仓库地址> .
   ```
   
   或使用 scp 上传:
   ```bash
   # 在本地执行
   scp -r d:\code\publish/* user@your-vps-ip:~/publish-app/
   ```

3. **创建 .env 文件**
   ```bash
   cat > .env << EOF
   API_KEY=你的API_KEY
   SECRET=你的SECRET
   PORT=3000
   EOF
   ```

4. **构建并运行**
   ```bash
   # 构建镜像
   docker build -t publish-web .
   
   # 运行容器
   docker run -d \
     --name publish-web \
     --env-file .env \
     -p 3000:3000 \
     --restart unless-stopped \
     publish-web
   ```

5. **访问应用**
   ```
   http://你的VPS_IP:3000
   ```

### 方式二: 直接传递环境变量

```bash
docker run -d \
  --name publish-web \
  -e API_KEY=你的API_KEY \
  -e SECRET=你的SECRET \
  -e PORT=3000 \
  -p 3000:3000 \
  --restart unless-stopped \
  publish-web
```

### 使用 docker-compose(推荐)

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  publish-web:
    build: .
    container_name: publish-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
```

运行命令:
```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down

# 重启
docker-compose restart
```

### 一键部署脚本 (最简单)

我们提供了一键部署脚本,自动完成所有配置和部署步骤:

```bash
# 上传代码到 VPS 后,执行:
chmod +x deploy.sh
./deploy.sh
```

脚本会自动:
- ✅ 检查 Docker 环境
- ✅ 引导配置 .env 文件
- ✅ 构建 Docker 镜像
- ✅ 启动容器并进行健康检查
- ✅ 显示访问地址和常用命令

## 详细部署文档

查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取:
- 完整的部署步骤说明
- Nginx 反向代理配置
- SSL 证书配置
- 防火墙设置
- 故障排查指南
- 性能优化建议


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
