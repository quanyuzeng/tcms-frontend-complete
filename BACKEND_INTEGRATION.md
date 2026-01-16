# 后端对接说明文档

## 项目概述

本前端项目采用 Vue 3 + Element Plus 技术栈，专为制造业新工厂设计的培训与岗位能力管理系统。项目已完成所有页面开发，并预留了完整的后端对接接口。

## 技术架构

### 前端技术栈
- **Vue 3.3+**: 渐进式JavaScript框架
- **Element Plus**: Vue 3组件库
- **Vue Router 4**: 路由管理
- **Pinia**: 状态管理
- **Axios**: HTTP客户端
- **ECharts**: 数据可视化
- **Vue i18n**: 国际化

### 后端技术栈（推荐）
- **Django 4.2+**: Python Web框架
- **Django REST Framework 3.14+**: REST API框架
- **Django JWT**: JWT认证
- **MySQL 8.0**: 关系型数据库
- **Redis**: 缓存和会话存储
- **Celery**: 异步任务队列

## API接口规范

### 认证API

#### 1. 用户登录
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response:
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": 1,
    "username": "zhangsan",
    "realName": "张三",
    "employeeId": "EMP001",
    "email": "zhangsan@company.com",
    "department": "生产部",
    "position": "操作工",
    "role": "EMPLOYEE",
    "avatar": "url_or_null"
  }
}
```

#### 2. 用户登出
```http
POST /api/auth/logout/
Authorization: Bearer {jwt_token}

Response:
{
  "message": "Logout successful"
}
```

#### 3. 刷新Token
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "jwt_refresh_token"
}

Response:
{
  "access": "new_jwt_access_token"
}
```

### 用户管理API

#### 1. 获取用户列表
```http
GET /api/users/
Authorization: Bearer {jwt_token}
Parameters:
  - page: 页码 (optional)
  - page_size: 每页数量 (optional)
  - realName: 真实姓名过滤 (optional)
  - employeeId: 工号过滤 (optional)
  - department: 部门过滤 (optional)
  - role: 角色过滤 (optional)
  - status: 状态过滤 (optional)

Response:
{
  "count": 100,
  "next": "url_or_null",
  "previous": "url_or_null",
  "results": [
    {
      "id": 1,
      "username": "zhangsan",
      "realName": "张三",
      "employeeId": "EMP001",
      "email": "zhangsan@company.com",
      "phone": "13800138000",
      "department": "生产部",
      "position": "操作工",
      "role": "EMPLOYEE",
      "status": "active",
      "avatar": "url_or_null",
      "lastLogin": "2024-01-15T14:30:00Z"
    }
  ]
}
```

#### 2. 创建用户
```http
POST /api/users/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "username": "lisi",
  "realName": "李四",
  "employeeId": "EMP002",
  "email": "lisi@company.com",
  "phone": "13900139000",
  "department": "质量部",
  "position": "质检员",
  "role": "EMPLOYEE",
  "password": "initial_password"
}

Response:
{
  "id": 2,
  "username": "lisi",
  "realName": "李四",
  "employeeId": "EMP002",
  "email": "lisi@company.com",
  "phone": "13900139000",
  "department": "质量部",
  "position": "质检员",
  "role": "EMPLOYEE",
  "status": "active",
  "createTime": "2024-01-15T10:00:00Z"
}
```

#### 3. 更新用户
```http
PUT /api/users/{id}/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "realName": "李四",
  "email": "lisi@company.com",
  "phone": "13900139000",
  "department": "质量部",
  "position": "质检员",
  "role": "EMPLOYEE"
}
```

#### 4. 删除用户
```http
DELETE /api/users/{id}/
Authorization: Bearer {jwt_token}

Response: 204 No Content
```

#### 5. 重置密码
```http
POST /api/users/{id}/reset-password/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "new_password": "new_password_string"
}
```

### 角色管理API

#### 1. 获取角色列表
```http
GET /api/roles/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "系统管理员",
      "code": "SYSTEM_ADMIN",
      "description": "系统超级管理员",
      "userCount": 2,
      "permissions": ["user.*", "role.*"],
      "status": "enabled",
      "createTime": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### 2. 创建角色
```http
POST /api/roles/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "培训经理",
  "code": "TRAINING_MANAGER",
  "description": "负责培训课程管理",
  "permissions": ["course.*", "exam.view"]
}
```

#### 3. 更新角色权限
```http
PUT /api/roles/{id}/permissions/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "permissions": ["course.*", "exam.*", "report.view"]
}
```

### 培训课程管理API

#### 1. 获取课程列表
```http
GET /api/training/courses/
Authorization: Bearer {jwt_token}
Parameters:
  - page: 页码 (optional)
  - page_size: 每页数量 (optional)
  - name: 课程名称过滤 (optional)
  - category: 分类过滤 (optional)
  - status: 状态过滤 (optional)

Response:
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "name": "设备安全操作规范",
      "code": "SAF-001",
      "type": "offline",
      "duration": 16,
      "credit": 2,
      "instructor": "李师傅",
      "category": "安全培训",
      "status": "published",
      "enrollmentCount": 25,
      "completionCount": 20,
      "createTime": "2024-01-10T10:00:00Z"
    }
  ]
}
```

#### 2. 创建课程
```http
POST /api/training/courses/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "name": "质量管理体系基础",
  "code": "QC-001",
  "type": "online",
  "duration": 8,
  "credit": 1,
  "instructor": "王主管",
  "category": "质量培训",
  "description": "质量管理体系基础知识培训",
  "prerequisites": [],
  "status": "published"
}
```

### 考试管理API

#### 1. 获取考试列表
```http
GET /api/examination/exams/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 30,
  "results": [
    {
      "id": 1,
      "name": "设备安全操作规范考试",
      "type": "formal",
      "totalQuestions": 50,
      "totalScore": 100,
      "passingScore": 60,
      "timeLimit": 3600,
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T10:00:00Z",
      "status": "completed"
    }
  ]
}
```

#### 2. 获取考试成绩
```http
GET /api/examination/exam-results/
Authorization: Bearer {jwt_token}
Parameters:
  - user: 用户ID过滤 (optional)
  - exam: 考试ID过滤 (optional)

Response:
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "realName": "张三",
        "employeeId": "EMP001"
      },
      "exam": {
        "id": 1,
        "name": "设备安全操作规范考试"
      },
      "score": 88,
      "correctCount": 44,
      "wrongCount": 6,
      "duration": 3600,
      "isPassed": true,
      "submitTime": "2024-01-15T09:45:00Z"
    }
  ]
}
```

### 能力管理API

#### 1. 获取能力列表
```http
GET /api/competency/competencies/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "name": "设备操作能力",
      "code": "SKILL-001",
      "level": "master",
      "category": "操作技能",
      "assessmentMethod": ["practical_exam", "interview"],
      "description": "设备安全操作能力",
      "status": "enabled"
    }
  ]
}
```

#### 2. 获取能力评估
```http
GET /api/competency/assessments/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "employee": {
        "id": 1,
        "realName": "张三",
        "employeeId": "EMP001"
      },
      "competency": {
        "id": 1,
        "name": "设备操作能力"
      },
      "assessor": "李经理",
      "scheduledDate": "2024-01-15",
      "actualDate": "2024-01-15",
      "score": 85,
      "level": "master",
      "status": "completed"
    }
  ]
}
```

#### 3. 获取证书列表
```http
GET /api/competency/certificates/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "name": "设备操作安全证书",
      "certificateNo": "CERT-2024-001",
      "certificateType": "safety",
      "employee": {
        "id": 1,
        "realName": "张三",
        "employeeId": "EMP001"
      },
      "issueDate": "2024-01-15",
      "expiryDate": "2027-01-15",
      "verificationCode": "VER123456789",
      "status": "valid"
    }
  ]
}
```

### 报表管理API

#### 1. 获取报表列表
```http
GET /api/reporting/reports/
Authorization: Bearer {jwt_token}

Response:
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "培训完成率统计",
      "type": "training_completion",
      "generateTime": "2024-01-15T10:00:00Z",
      "fileUrl": "/reports/training_completion_20240115.xlsx"
    }
  ]
}
```

#### 2. 生成报表
```http
POST /api/reporting/reports/generate/
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "reportType": "training_statistics",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "exportFormat": "excel"
}
```

### 审计日志API

#### 1. 获取审计日志
```http
GET /api/audit/logs/
Authorization: Bearer {jwt_token}
Parameters:
  - page: 页码 (optional)
  - operator: 操作人过滤 (optional)
  - action: 操作类型过滤 (optional)
  - module: 模块过滤 (optional)
  - startDate: 开始日期 (optional)
  - endDate: 结束日期 (optional)

Response:
{
  "count": 1000,
  "results": [
    {
      "id": 1,
      "operator": "张三",
      "action": "login",
      "module": "user",
      "description": "用户登录系统",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "createTime": "2024-01-15T14:30:00Z",
      "requestParams": {...},
      "responseResult": {...}
    }
  ]
}
```

## 数据交换格式

### 请求格式
所有POST、PUT请求使用JSON格式：
```json
{
  "field1": "value1",
  "field2": "value2",
  "nested": {
    "field3": "value3"
  }
}
```

### 响应格式
统一响应格式：
```json
{
  "code": 200,
  "message": "Success",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "Validation error",
  "errors": {
    "field1": ["Error message 1"],
    "field2": ["Error message 2"]
  }
}
```

## 状态管理

### Pinia状态管理
项目使用Pinia进行状态管理，主要模块：

#### 1. 认证状态 (auth.js)
```javascript
// 存储用户信息、Token等
const authStore = useAuthStore()
authStore.login(credentials)
authStore.logout()
authStore.initializeAuth() // 从本地存储恢复认证状态
```

#### 2. 应用状态 (app.js)
```javascript
// 存储应用级别状态：侧边栏、主题、语言等
const appStore = useAppStore()
appStore.toggleSidebar()
appStore.setTheme('dark')
appStore.setLanguage('en-US')
```

### 本地存储
- **认证信息**: localStorage.getItem('auth')
- **主题设置**: localStorage.getItem('theme')
- **语言设置**: localStorage.getItem('language')

## 权限控制

### 前端路由守卫
```javascript
// router/index.js
router.beforeEach(async (to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // 检查权限
    if (to.meta.requiredRoles && !authStore.hasRoles(to.meta.requiredRoles)) {
      next('/')
      return
    }
  }
  next()
})
```

### 角色权限映射
```javascript
// 角色与权限的对应关系
const rolePermissions = {
  'SYSTEM_ADMIN': ['*'], // 所有权限
  'HR_MANAGER': ['user.*', 'report.*'],
  'TRAINING_MANAGER': ['course.*', 'exam.*'],
  'DEPARTMENT_MANAGER': ['user.view', 'report.view'],
  'INSTRUCTOR': ['course.view', 'course.edit', 'exam.*'],
  'EMPLOYEE': ['course.view', 'exam.view']
}
```

## 文件上传

### 头像上传
```javascript
// 支持格式：JPG, PNG
// 最大大小：2MB
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG && !isPNG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}
```

## 异步处理建议

### 1. 使用async/await
```javascript
const loadData = async () => {
  loading.value = true
  try {
    const response = await userAPI.getUsers(params)
    tableData.value = response.data.results
    pagination.total = response.data.count
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}
```

### 2. 错误处理
```javascript
// API统一错误处理
request.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token过期，跳转到登录
          router.push('/login')
          break
        case 403:
          ElMessage.error('权限不足')
          break
        case 404:
          ElMessage.error('资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error('请求失败')
      }
    }
    return Promise.reject(error)
  }
)
```

## 性能优化建议

### 1. 分页加载
所有列表页面已实现分页功能，后端需支持：
- page: 当前页码
- page_size: 每页数量
- 返回count总记录数

### 2. 搜索过滤
支持前端搜索参数，后端实现过滤功能：
- 名称、状态、时间范围等过滤条件
- 使用数据库索引优化查询性能

### 3. 数据缓存
建议后端实现：
- Redis缓存常用数据
- CDN缓存静态资源
- 数据库查询优化

## 部署说明

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173
```

### 生产环境
```bash
# 构建生产版本
npm run build

# 构建输出目录
dist/
```

### Docker部署
```dockerfile
# Dockerfile
FROM node:16-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 安全建议

### 1. HTTPS配置
生产环境必须使用HTTPS，配置SSL证书

### 2. CORS配置
```javascript
// 后端CORS配置
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://admin.your-domain.com"
]
```

### 3. 输入验证
- 前端表单验证已实现
- 后端必须再次验证所有输入
- 防止SQL注入和XSS攻击

### 4. 敏感信息保护
- 密码必须加密存储（推荐bcrypt）
- JWT Token设置合理过期时间
- 敏感接口记录审计日志

## 监控与日志

### 前端监控
- 已实现全局错误处理
- 建议接入Sentry等错误监控平台

### 后端监控
- 记录API响应时间
- 监控数据库慢查询
- 记录用户操作日志（已实现审计日志页面）

## 数据库设计建议

### 用户表 (users)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    position VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 角色表 (roles)
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSON,
    status ENUM('enabled', 'disabled') DEFAULT 'enabled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 审计日志表 (audit_logs)
```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    operator VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_params JSON,
    response_result JSON,
    status ENUM('success', 'failed') NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_operator (operator),
    INDEX idx_action (action),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
);
```

## 测试建议

### 1. 单元测试
- 测试API接口返回格式
- 测试权限控制逻辑
- 测试数据验证规则

### 2. 集成测试
- 测试完整的用户操作流程
- 测试前后端数据交互
- 测试异常情况处理

### 3. 性能测试
- 测试并发用户访问
- 测试大数据量查询
- 测试文件上传下载

## 常见问题

### 1. 跨域问题
后端需要配置CORS，允许前端域名访问：
```python
# Django settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://your-domain.com"
]
```

### 2. JWT Token过期
前端已实现Token刷新机制，后端需提供刷新接口

### 3. 文件上传大小限制
建议后端配置：
- 单文件最大：10MB
- 单次请求最大：50MB

### 4. 数据库连接池
建议使用连接池管理数据库连接：
- 最大连接数：100
- 超时时间：30秒

## 联系信息

如有任何问题，请联系开发团队：
- 项目负责人：TCMS Team
- 技术支持：support@tcms.com
- 项目地址：[TCMS GitHub](https://github.com/your-org/tcms)

---

**注意**: 本文档详细说明了前端与后端的对接方式，包括API接口、数据格式、状态管理等。请后端开发人员按照此文档实现相应的API接口。