# 模板发布助手

提供一个简洁的网页，填写「模板名」和「版本号」即可完成发布，也支持批量发布。

## 功能

- 单条发布：输入模板名 + 版本号
- 批量发布：每行一条 `模板名:版本号`（也支持空格或竖线分隔）
- 环境切换：支持 env2/env3 环境切换

## 本地运行

```bash
npm install
npm start
```

浏览器访问 `http://localhost:33222`

## Docker 部署

首次部署（如有旧容器需先清理）：
```bash
docker stop publish-web; docker rm publish-web
docker-compose up -d --build
```

后续更新：
```bash
docker-compose down && docker-compose up -d --build
```

常用命令：
```bash
docker-compose logs -f   # 查看日志
docker-compose down      # 停止
docker-compose restart   # 重启
```
