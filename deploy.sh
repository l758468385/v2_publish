#!/bin/bash

# 模板发布助手 - VPS 快速部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "    模板发布助手 - Docker 部署脚本"
echo "=========================================="
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: Docker 未安装"
    echo "请先安装 Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  警告: docker-compose 未安装,将使用 docker 命令部署"
    USE_COMPOSE=false
else
    USE_COMPOSE=true
fi

echo "✅ Docker 环境检查通过"
echo ""

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "📝 未找到 .env 文件,开始配置..."
    echo ""
    
    # 读取用户输入
    read -p "请输入 API_KEY: " API_KEY
    read -p "请输入 SECRET: " SECRET
    read -p "请输入端口号 [默认: 3000]: " PORT
    PORT=${PORT:-3000}
    
    # 创建 .env 文件
    cat > .env << EOF
API_KEY=${API_KEY}
SECRET=${SECRET}
PORT=${PORT}
EOF
    
    echo ""
    echo "✅ .env 文件创建成功"
else
    echo "✅ 找到现有 .env 文件"
    
    # 显示当前配置(隐藏敏感信息)
    echo "当前配置:"
    echo "  API_KEY: $(grep API_KEY .env | cut -d'=' -f2 | sed 's/\(.\{4\}\).*/\1****/')"
    echo "  PORT: $(grep PORT .env | cut -d'=' -f2)"
    
    echo ""
    read -p "是否使用现有配置? (y/n) [默认: y]: " USE_EXISTING
    USE_EXISTING=${USE_EXISTING:-y}
    
    if [ "$USE_EXISTING" != "y" ]; then
        read -p "请输入新的 API_KEY: " API_KEY
        read -p "请输入新的 SECRET: " SECRET
        read -p "请输入新的端口号 [默认: 3000]: " PORT
        PORT=${PORT:-3000}
        
        cat > .env << EOF
API_KEY=${API_KEY}
SECRET=${SECRET}
PORT=${PORT}
EOF
        echo "✅ .env 文件更新成功"
    fi
fi

echo ""
echo "=========================================="
echo "开始部署..."
echo "=========================================="
echo ""

# 停止旧容器(如果存在)
if docker ps -a | grep -q publish-web; then
    echo "🛑 停止旧容器..."
    docker stop publish-web 2>/dev/null || true
    docker rm publish-web 2>/dev/null || true
fi

# 删除旧镜像(可选,节省空间)
read -p "是否删除旧镜像? (y/n) [默认: n]: " REMOVE_OLD
REMOVE_OLD=${REMOVE_OLD:-n}
if [ "$REMOVE_OLD" = "y" ]; then
    echo "🗑️  删除旧镜像..."
    docker rmi publish-web 2>/dev/null || true
fi

echo ""

# 根据是否安装 docker-compose 选择部署方式
if [ "$USE_COMPOSE" = true ]; then
    echo "📦 使用 docker-compose 部署..."
    docker-compose up -d --build
else
    echo "📦 使用 docker 命令部署..."
    
    # 读取端口号
    PORT=$(grep PORT .env | cut -d'=' -f2)
    
    # 构建镜像
    echo "🔨 构建镜像..."
    docker build -t publish-web .
    
    # 运行容器
    echo "🚀 启动容器..."
    docker run -d \
        --name publish-web \
        --env-file .env \
        -p ${PORT}:${PORT} \
        --restart unless-stopped \
        publish-web
fi

echo ""
echo "=========================================="
echo "✅ 部署完成!"
echo "=========================================="
echo ""

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 3

# 检查容器状态
if docker ps | grep -q publish-web; then
    echo "✅ 容器运行正常"
    
    # 检查健康状态
    PORT=$(grep PORT .env | cut -d'=' -f2)
    if curl -s http://localhost:${PORT}/health > /dev/null 2>&1; then
        echo "✅ 健康检查通过"
    else
        echo "⚠️  警告: 健康检查失败,请查看日志"
    fi
    
    echo ""
    echo "📋 访问信息:"
    echo "  本地访问: http://localhost:${PORT}"
    
    # 尝试获取公网 IP
    PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "无法获取")
    if [ "$PUBLIC_IP" != "无法获取" ]; then
        echo "  公网访问: http://${PUBLIC_IP}:${PORT}"
    fi
    
    echo ""
    echo "📝 常用命令:"
    if [ "$USE_COMPOSE" = true ]; then
        echo "  查看日志: docker-compose logs -f"
        echo "  重启服务: docker-compose restart"
        echo "  停止服务: docker-compose down"
    else
        echo "  查看日志: docker logs -f publish-web"
        echo "  重启服务: docker restart publish-web"
        echo "  停止服务: docker stop publish-web && docker rm publish-web"
    fi
else
    echo "❌ 容器启动失败"
    echo ""
    echo "查看日志:"
    if [ "$USE_COMPOSE" = true ]; then
        docker-compose logs
    else
        docker logs publish-web
    fi
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 部署成功! 开始使用吧!"
echo "=========================================="
