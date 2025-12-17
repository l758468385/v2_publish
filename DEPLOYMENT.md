# VPS 部署说明文档

## 快速部署到 VPS

### 前置要求

1. ✅ VPS 已安装 Docker 和 Docker Compose
2. ✅ VPS 防火墙开放 3000 端口
3. ✅ 拥有 API_KEY 和 SECRET

### 检查 Docker 版本

```bash
# 检查 Docker
docker --version

# 检查 Docker Compose
docker-compose --version
```

如果未安装,请参考 [Docker 官方安装文档](https://docs.docker.com/engine/install/)

---

## 部署步骤

### 第一步: 上传代码到 VPS

#### 方式 A: 使用 Git (推荐)

```bash
# SSH 登录到 VPS
ssh user@your-vps-ip

# 创建工作目录
mkdir -p ~/publish-app
cd ~/publish-app

# 克隆代码
git clone <你的仓库地址> .
```

#### 方式 B: 使用 SCP 上传

在本地 Windows 终端执行:
```powershell
# 上传整个项目
scp -r d:\code\publish\* user@your-vps-ip:~/publish-app/
```

---

### 第二步: 配置环境变量

登录到 VPS 后:

```bash
cd ~/publish-app

# 创建 .env 文件
cat > .env << 'EOF'
API_KEY=你的实际API_KEY
SECRET=你的实际SECRET
PORT=3000
EOF

# 验证 .env 文件
cat .env
```

---

### 第三步: 启动应用

#### 使用 docker-compose (推荐)

```bash
# 构建并启动
docker-compose up -d

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 按 Ctrl+C 退出日志查看
```

#### 或使用 docker 命令

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

# 查看日志
docker logs -f publish-web
```

---

### 第四步: 验证部署

```bash
# 检查容器是否运行
docker ps | grep publish-web

# 检查健康状态
curl http://localhost:3000/health

# 期望输出: {"status":"ok"}
```

在浏览器访问:
```
http://你的VPS_IP:3000
```

---

## 常用管理命令

### 查看日志
```bash
# docker-compose
docker-compose logs -f

# docker
docker logs -f publish-web
```

### 重启服务
```bash
# docker-compose
docker-compose restart

# docker
docker restart publish-web
```

### 停止服务
```bash
# docker-compose
docker-compose down

# docker
docker stop publish-web
docker rm publish-web
```

### 更新代码后重新部署
```bash
# 拉取最新代码 (如果使用 git)
git pull

# 重新构建并启动
docker-compose down
docker-compose up -d --build

# 或使用 docker 命令
docker stop publish-web
docker rm publish-web
docker rmi publish-web
docker build -t publish-web .
docker run -d \
  --name publish-web \
  --env-file .env \
  -p 3000:3000 \
  --restart unless-stopped \
  publish-web
```

---

## 配置 Nginx 反向代理 (可选)

如果你想使用域名访问,可以配置 Nginx:

### 1. 安装 Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx -y

# CentOS/RHEL
sudo yum install nginx -y
```

### 2. 创建 Nginx 配置
```bash
sudo nano /etc/nginx/sites-available/publish
```

添加以下内容:
```nginx
server {
    listen 80;
    server_name publish.yourdomain.com;  # 改为你的域名

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 启用配置并重启 Nginx
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/publish /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置 SSL (推荐)
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d publish.yourdomain.com
```

---

## 防火墙配置

### Ubuntu/Debian (UFW)
```bash
# 开放 3000 端口
sudo ufw allow 3000/tcp

# 如果使用 Nginx 反向代理
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看防火墙状态
sudo ufw status
```

### CentOS/RHEL (Firewalld)
```bash
# 开放 3000 端口
sudo firewall-cmd --permanent --add-port=3000/tcp

# 如果使用 Nginx 反向代理
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重载防火墙
sudo firewall-cmd --reload
```

---

## 故障排查

### 容器无法启动
```bash
# 查看详细日志
docker-compose logs

# 检查 .env 文件是否存在
ls -la .env

# 检查端口是否被占用
sudo netstat -tlnp | grep 3000
```

### 无法访问应用
```bash
# 检查容器状态
docker ps -a

# 检查防火墙
sudo ufw status

# 检查应用日志
docker-compose logs -f
```

### 环境变量未生效
```bash
# 进入容器检查
docker exec -it publish-web sh

# 查看环境变量
env | grep API_KEY
env | grep SECRET

# 退出容器
exit
```

---

## 安全建议

1. ✅ **不要把 .env 文件提交到 Git**
   ```bash
   # 确保 .gitignore 包含 .env
   echo ".env" >> .gitignore
   ```

2. ✅ **定期更新 Docker 镜像**
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```

3. ✅ **使用 HTTPS** (通过 Nginx + SSL)

4. ✅ **限制访问来源** (通过防火墙或 Nginx)

5. ✅ **定期备份数据** (如果有)

---

## 性能优化

### 使用多阶段构建 (已优化)
项目的 Dockerfile 已使用 `--omit=dev` 减小镜像大小

### 资源限制
```yaml
# 在 docker-compose.yml 中添加
services:
  publish-web:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

---

## 备份与恢复

### 备份配置
```bash
# 备份 .env 文件
cp .env .env.backup

# 备份整个项目
tar -czf publish-app-backup-$(date +%Y%m%d).tar.gz ~/publish-app
```

### 恢复
```bash
# 解压备份
tar -xzf publish-app-backup-20250117.tar.gz

# 启动服务
cd publish-app
docker-compose up -d
```

---

## 监控和日志

### 设置日志轮转
```yaml
# 在 docker-compose.yml 中添加
services:
  publish-web:
    # ... 其他配置
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 查看资源使用
```bash
# 查看容器资源使用情况
docker stats publish-web
```

---

## 需要帮助?

- 检查应用日志: `docker-compose logs -f`
- 检查健康状态: `curl http://localhost:3000/health`
- 确保防火墙开放端口
- 确保 .env 文件配置正确
