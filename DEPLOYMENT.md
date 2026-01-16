# 前端部署说明文档

## 项目概述

本前端项目采用 Vue 3 + Vite + Element Plus 技术栈，是一个完整的制造业培训与岗位能力管理系统。项目已完成所有页面开发，支持中英文国际化，并预留了完整的后端对接接口。

## 环境要求

### 开发环境
- **Node.js**: 16.0.0 或更高版本
- **npm**: 8.0.0 或更高版本
- **Git**: 2.0 或更高版本

### 生产环境
- **Web服务器**: Nginx 或 Apache
- **Node.js**: 16.0.0 或更高版本（如使用SSR）

## 项目结构

```
frontend/
├── public/                    # 静态资源
│   ├── logo.png              # 项目Logo
│   └── ...
├── src/                      # 源代码
│   ├── api/                  # API接口
│   │   ├── auth.js          # 认证相关API
│   │   ├── user.js          # 用户管理API
│   │   ├── course.js        # 课程管理API
│   │   ├── exam.js          # 考试管理API
│   │   ├── competency.js    # 能力管理API
│   │   └── reporting.js     # 报表管理API
│   ├── components/          # 公共组件
│   │   └── layout/
│   │       └── MainLayout.vue # 主布局组件
│   ├── locales/             # 国际化语言文件
│   │   ├── zh-CN.js         # 中文语言包
│   │   └── en-US.js         # 英文语言包
│   ├── router/              # 路由配置
│   │   └── index.js         # 路由定义
│   ├── store/               # 状态管理
│   │   ├── auth.js          # 认证状态
│   │   └── app.js           # 应用状态
│   ├── utils/               # 工具函数
│   │   └── auth.js          # 认证工具
│   ├── views/               # 页面组件
│   │   ├── auth/            # 认证页面
│   │   ├── dashboard/       # 仪表盘
│   │   ├── organization/    # 组织管理
│   │   ├── training/        # 培训管理
│   │   ├── examination/     # 考试管理
│   │   ├── competency/      # 能力管理
│   │   ├── reporting/       # 报表管理
│   │   ├── system/          # 系统管理
│   │   └── profile/         # 个人中心
│   ├── App.vue              # 根组件
│   └── main.js              # 入口文件
├── index.html               # HTML模板
├── package.json             # 项目配置
├── vite.config.js           # Vite配置
├── BACKEND_INTEGRATION.md   # 后端对接说明
└── DEPLOYMENT.md           # 部署说明（本文件）
```

## 安装依赖

### 1. 克隆项目
```bash
git clone https://github.com/your-org/tcms-frontend.git
cd tcms-frontend
```

### 2. 安装Node.js依赖
```bash
npm install
```

或使用淘宝镜像加速：
```bash
npm install --registry=https://registry.npmmirror.com
```

## 开发环境启动

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问应用
```
http://localhost:5173
```

### 3. 默认登录信息
```
用户名: admin
密码: admin123
```

### 4. 常用开发命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 代码格式检查
npm run lint

# 代码格式化
npm run format
```

## 生产环境构建

### 1. 构建生产版本
```bash
npm run build
```

### 2. 构建输出
构建完成后，会在项目根目录生成 `dist/` 文件夹，包含所有静态文件：
```
dist/
├── index.html              # 入口HTML文件
├── assets/                 # 静态资源
│   ├── index-xxx.js       # JS文件
│   ├── index-xxx.css      # CSS文件
│   └── ...
└── ...
```

## 部署方式

### 方式一：Nginx部署（推荐）

#### 1. 安装Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# macOS
brew install nginx
```

#### 2. 配置Nginx
创建配置文件 `/etc/nginx/conf.d/tcms.conf`：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /var/www/tcms-frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # API代理（可选）
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/tcms-frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. 复制文件
```bash
# 复制构建文件到Nginx目录
sudo cp -r dist/* /var/www/tcms-frontend/

# 设置权限
sudo chown -R www-data:www-data /var/www/tcms-frontend
```

#### 4. 启动Nginx
```bash
# 检查配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx

# 设置开机启动
sudo systemctl enable nginx
```

### 方式二：Apache部署

#### 1. 安装Apache
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install apache2

# CentOS/RHEL
sudo yum install httpd
```

#### 2. 配置Apache
创建配置文件 `/etc/apache2/sites-available/tcms.conf`：
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /var/www/tcms-frontend/dist
    
    <Directory /var/www/tcms-frontend/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # API代理（可选）
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
    
    # 静态资源缓存
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive on
        ExpiresDefault "access plus 1 year"
    </FilesMatch>
</VirtualHost>
```

#### 3. 启用配置
```bash
# 启用站点
sudo a2ensite tcms.conf

# 启用必要模块
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http

# 重启Apache
sudo systemctl restart apache2
```

### 方式三：Docker部署

#### 1. 创建Dockerfile
```dockerfile
# 构建阶段
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. 创建nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3. 构建并运行
```bash
# 构建镜像
docker build -t tcms-frontend .

# 运行容器
docker run -d -p 80:80 --name tcms-frontend tcms-frontend
```

### 方式四：PM2部署

#### 1. 安装PM2
```bash
npm install -g pm2
```

#### 2. 创建生态配置文件
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [
    {
      name: 'tcms-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
}
```

#### 3. 安装serve
```bash
npm install -g serve
```

#### 4. 部署
```bash
# 构建项目
npm run build

# 启动应用
pm2 start ecosystem.config.js

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

## HTTPS配置（生产环境必须）

### 1. 获取SSL证书
可以使用Let's Encrypt免费证书：
```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

### 2. Nginx HTTPS配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 前端静态文件
    location / {
        root /var/www/tcms-frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }
    
    # API代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 环境变量配置

### 1. 创建环境文件
创建 `.env` 文件：
```bash
# API基础URL
VITE_API_BASE_URL=http://localhost:8000

# 应用名称
VITE_APP_NAME=TCMS培训系统

# 应用版本
VITE_APP_VERSION=1.0.0

# 构建环境
VITE_ENV=production
```

### 2. 环境变量说明
```javascript
// 在代码中使用环境变量
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appName = import.meta.env.VITE_APP_NAME
```

## 性能优化

### 1. 启用Gzip压缩
```nginx
# Nginx配置
gzip on;
gzip_comp_level 6;
gzip_min_length 1000;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/json
    application/javascript
    application/xml+rss
    application/atom+xml
    image/svg+xml;
```

### 2. 配置缓存策略
```nginx
# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    root /var/www/tcms-frontend/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML文件不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### 3. CDN配置（可选）
如果使用CDN，配置如下：
```javascript
// vite.config.js
export default defineConfig({
  base: 'https://cdn.your-domain.com/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          charts: ['echarts']
        }
      }
    }
  }
})
```

## 监控与日志

### 1. 前端监控
建议接入Sentry进行错误监控：
```javascript
// main.js
import * as Sentry from '@sentry/vue'

Sentry.init({
  dsn: 'your-sentry-dsn',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 0.1
})
```

### 2. Nginx访问日志
```nginx
# 配置访问日志
access_log /var/log/nginx/tcms-access.log combined;
error_log /var/log/nginx/tcms-error.log;
```

### 3. PM2日志管理
```bash
# 查看日志
pm2 logs tcms-frontend

# 清空日志
pm2 flush

# 配置日志轮转
pm2 install pm2-logrotate
```

## 备份与恢复

### 1. 配置文件备份
```bash
# 备份Nginx配置
sudo cp /etc/nginx/conf.d/tcms.conf /backup/

# 备份项目文件
tar -czf tcms-frontend-backup.tar.gz /var/www/tcms-frontend/
```

### 2. 自动化备份
创建备份脚本 `backup.sh`：
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backup/tcms-frontend-$DATE.tar.gz /var/www/tcms-frontend/
find /backup -name "tcms-frontend-*.tar.gz" -mtime +7 -delete
```

### 3. 定时任务
```bash
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

## 常见问题

### 1. 路由刷新404
**问题**: 刷新页面出现404错误
**解决**: 配置Web服务器重写到index.html
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 2. API跨域问题
**问题**: 浏览器报CORS错误
**解决**: 后端配置CORS头或使用Nginx代理
```nginx
location /api {
    proxy_pass http://localhost:8000;
    add_header Access-Control-Allow-Origin *;
}
```

### 3. 静态资源加载慢
**问题**: 首屏加载速度慢
**解决**: 
- 启用Gzip压缩
- 配置资源缓存
- 使用CDN加速
- 代码分割优化

### 4. 内存占用高
**问题**: Node.js进程内存占用过高
**解决**:
```bash
# PM2配置内存限制
pm2 start ecosystem.config.js --max-memory-restart 500M
```

## 安全加固

### 1. 防火墙配置
```bash
# 仅允许80和443端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 禁止目录浏览
```nginx
location / {
    root /var/www/tcms-frontend/dist;
    autoindex off;
}
```

### 3. 安全头设置
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### 4. 防止DDoS
```nginx
# 限制请求频率
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## 更新部署

### 1. 滚动更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 复制新文件
cp -r dist/* /var/www/tcms-frontend/

# 5. 重启服务
sudo systemctl reload nginx
```

### 2. 零停机更新（使用PM2）
```bash
# 1. 构建项目
npm run build

# 2. 重启应用
pm2 restart tcms-frontend
```

### 3. Docker更新
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建新镜像
docker build -t tcms-frontend:latest .

# 3. 停止旧容器
docker stop tcms-frontend

# 4. 启动新容器
docker run -d -p 80:80 --name tcms-frontend tcms-frontend:latest

# 5. 清理旧镜像
docker image prune -f
```

## 监控告警

### 1. 服务状态监控
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查端口监听
netstat -tlnp | grep 80

# 检查进程
ps aux | grep nginx
```

### 2. 日志监控
```bash
# 实时监控错误日志
tail -f /var/log/nginx/error.log

# 监控访问日志
tail -f /var/log/nginx/access.log
```

### 3. 性能监控
```bash
# 监控CPU和内存
top -p $(pgrep nginx)

# 监控磁盘空间
df -h
```

## 联系信息

如有部署问题，请联系：
- 技术支持：support@tcms.com
- 项目负责人：TCMS Team
- 文档版本：1.0.0
- 最后更新：2024-01-15

---

**注意**: 本文档详细说明了前端项目的部署步骤和注意事项。请按照文档步骤进行操作，如有问题请参考常见问题部分或联系技术支持。