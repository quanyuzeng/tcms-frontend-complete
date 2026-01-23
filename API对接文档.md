# TCMS Frontend - API对接文档

## 项目概述

TCMS (Training & Competency Management System) 是一个培训与能力管理系统的前端项目，采用 Vue 3 + Element Plus 技术栈，支持国际化（中英文切换）。

## 技术栈

- **前端框架**: Vue 3
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **国际化**: vue-i18n
- **HTTP客户端**: Axios（已配置，当前使用Mock数据）
- **构建工具**: Vite

## API接口设计

### 1. 认证授权模块 (Auth)

#### 登录
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "remember": false
  }
  ```
- **Response**:
  ```json
  {
    "access": "string", // JWT access token
    "refresh": "string", // JWT refresh token
    "user": {
      "id": 1,
      "username": "string",
      "realName": "string",
      "email": "string",
      "department": "string",
      "position": "string",
      "role": "string"
    }
  }
  ```

#### 登出
- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Logout successful"
  }
  ```

#### 获取用户信息
- **URL**: `/api/auth/profile/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "id": 1,
    "username": "string",
    "realName": "string",
    "email": "string",
    "roles": ["string"],
    "permissions": ["string"]
  }
  ```

### 2. 用户管理模块 (Users)

#### 获取用户列表
- **URL**: `/api/users/`
- **Method**: `GET`
- **Query Parameters**:
  - `page` (integer): 页码，默认1
  - `size` (integer): 每页数量，默认10
  - `search` (string): 搜索关键词
  - `department` (string): 部门筛选
  - `role` (string): 角色筛选
  - `status` (string): 状态筛选 (active/inactive)
- **Response**:
  ```json
  {
    "count": 100,
    "next": "url",
    "previous": "url",
    "results": [
      {
        "id": 1,
        "username": "string",
        "realName": "string",
        "employeeId": "string",
        "email": "string",
        "phone": "string",
        "department": "string",
        "position": "string",
        "role": "string",
        "status": "active",
        "avatar": "url",
        "lastLogin": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### 创建用户
- **URL**: `/api/users/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "realName": "string",
    "employeeId": "string",
    "email": "string",
    "phone": "string",
    "departmentId": 1,
    "positionId": 1,
    "role": "string"
  }
  ```

#### 更新用户
- **URL**: `/api/users/{id}/`
- **Method**: `PUT`
- **Request Body**: 同创建用户

#### 删除用户
- **URL**: `/api/users/{id}/`
- **Method**: `DELETE`

#### 重置密码
- **URL**: `/api/users/{id}/reset-password/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "newPassword": "string"
  }
  ```

### 3. 组织管理模块 (Organization)

#### 部门管理

##### 获取部门列表
- **URL**: `/api/organization/departments/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`, `size`: 分页参数
  - `search`: 搜索关键词
- **Response**:
  ```json
  {
    "count": 50,
    "results": [
      {
        "id": 1,
        "name": "string",
        "code": "string",
        "parentId": null,
        "managerId": 1,
        "description": "string",
        "employeeCount": 10,
        "level": 1,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

##### 创建部门
- **URL**: `/api/organization/departments/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "string",
    "code": "string",
    "parentId": null,
    "managerId": 1,
    "description": "string"
  }
  ```

#### 岗位管理

##### 获取岗位列表
- **URL**: `/api/organization/positions/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 30,
    "results": [
      {
        "id": 1,
        "name": "string",
        "code": "string",
        "level": "junior",
        "responsibilities": "string",
        "qualifications": "string",
        "requiredTrainingHours": 40,
        "minExperience": 1,
        "minEducation": "bachelor",
        "employeeCount": 5
      }
    ]
  }
  ```

### 4. 培训管理模块 (Training)

#### 课程管理

##### 获取课程列表
- **URL**: `/api/training/courses/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`, `size`: 分页参数
  - `search`: 搜索关键词
  - `category`: 分类筛选
  - `status`: 状态筛选 (draft/published/archived)
- **Response**:
  ```json
  {
    "count": 200,
    "results": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "description": "string",
        "category": "string",
        "courseType": "online",
        "duration": 60,
        "credit": 2.0,
        "passingScore": 60,
        "instructor": "string",
        "status": "published",
        "viewCount": 100,
        "enrollmentCount": 50,
        "completionCount": 30,
        "completionRate": 60.0,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

##### 创建课程
- **URL**: `/api/training/courses/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string",
    "title": "string",
    "description": "string",
    "category": "string",
    "courseType": "online",
    "duration": 60,
    "credit": 2.0,
    "passingScore": 60,
    "instructor": "string",
    "prerequisites": [],
    "tags": "string",
    "status": "draft"
  }
  ```

##### 发布课程
- **URL**: `/api/training/courses/{id}/publish/`
- **Method**: `POST`

#### 培训计划管理

##### 获取培训计划列表
- **URL**: `/api/training/plans/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`, `size`: 分页参数
  - `search`: 搜索关键词
  - `planType`: 计划类型 (individual/department/position/company)
- **Response**:
  ```json
  {
    "count": 50,
    "results": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "planType": "department",
        "targetDepartmentId": 1,
        "targetPositionId": null,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "totalHours": 100,
        "totalCourses": 10,
        "status": "approved",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

##### 创建培训计划
- **URL**: `/api/training/plans/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string",
    "title": "string",
    "planType": "department",
    "targetDepartmentId": 1,
    "targetPositionId": null,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "courseIds": [1, 2, 3]
  }
  ```

##### 审批培训计划
- **URL**: `/api/training/plans/{id}/approve/`
- **Method**: `POST`

#### 培训记录管理

##### 获取培训记录
- **URL**: `/api/training/records/`
- **Method**: `GET`
- **Query Parameters**:
  - `userId`: 用户ID
  - `planId`: 培训计划ID
- **Response**:
  ```json
  {
    "count": 100,
    "results": [
      {
        "id": 1,
        "userId": 1,
        "planId": 1,
        "courseId": 1,
        "progress": 75,
        "studyDuration": 45,
        "completeDate": "2024-06-01",
        "score": 85,
        "feedback": "string",
        "status": "in_progress"
      }
    ]
  }
  ```

### 5. 考试管理模块 (Examination)

#### 题库管理

##### 获取题库列表
- **URL**: `/api/examination/question-banks/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 20,
    "results": [
      {
        "id": 1,
        "name": "string",
        "code": "string",
        "category": "string",
        "questionCount": 100,
        "totalScore": 100,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### 考试管理

##### 获取考试列表
- **URL**: `/api/examination/exams/`
- **Method**: `GET`
- **Query Parameters**:
  - `page`, `size`: 分页参数
  - `search`: 搜索关键词
  - `examType`: 考试类型 (practice/formal/makeup)
  - `status`: 状态筛选
- **Response**:
  ```json
  {
    "count": 30,
    "results": [
      {
        "id": 1,
        "code": "string",
        "title": "string",
        "examType": "formal",
        "courseId": 1,
        "questionBankId": 1,
        "totalQuestions": 50,
        "totalScore": 100,
        "passingScore": 60,
        "timeLimit": 60,
        "startTime": "2024-01-01T09:00:00Z",
        "endTime": "2024-01-01T11:00:00Z",
        "status": "published",
        "participantCount": 30,
        "resultCount": 25
      }
    ]
  }
  ```

##### 创建考试
- **URL**: `/api/examination/exams/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "string",
    "title": "string",
    "examType": "formal",
    "courseId": 1,
    "questionBankId": 1,
    "timeLimit": 60,
    "startTime": "2024-01-01T09:00:00Z",
    "endTime": "2024-01-01T11:00:00Z"
  }
  ```

#### 考试成绩管理

##### 获取考试成绩
- **URL**: `/api/examination/results/`
- **Method**: `GET`
- **Query Parameters**:
  - `examId`: 考试ID
  - `userId`: 用户ID
- **Response**:
  ```json
  {
    "count": 100,
    "results": [
      {
        "id": 1,
        "examId": 1,
        "userId": 1,
        "userName": "string",
        "score": 85,
        "correctCount": 42,
        "wrongCount": 8,
        "isPassed": true,
        "duration": 45,
        "submittedAt": "2024-01-01T10:30:00Z"
      }
    ]
  }
  ```

### 6. 能力管理模块 (Competency)

#### 能力库管理

##### 获取能力列表
- **URL**: `/api/competency/competencies/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 50,
    "results": [
      {
        "id": 1,
        "name": "string",
        "code": "string",
        "description": "string",
        "level": "master",
        "assessmentMethod": "exam",
        "required": true
      }
    ]
  }
  ```

#### 能力评估管理

##### 获取评估记录
- **URL**: `/api/competency/assessments/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 80,
    "results": [
      {
        "id": 1,
        "userId": 1,
        "competencyId": 1,
        "assessorId": 2,
        "level": "master",
        "score": 85,
        "status": "approved",
        "assessedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

#### 证书管理

##### 获取证书列表
- **URL**: `/api/competency/certificates/`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "count": 60,
    "results": [
      {
        "id": 1,
        "name": "string",
        "certificateNo": "string",
        "userId": 1,
        "competencyId": 1,
        "issueDate": "2024-01-01",
        "expiryDate": "2025-01-01",
        "verificationCode": "string",
        "status": "valid"
      }
    ]
  }
  ```

### 7. 报表管理模块 (Reporting)

#### 获取培训统计报表
- **URL**: `/api/reporting/training-statistics/`
- **Method**: `GET`
- **Query Parameters**:
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `departmentId`: 部门ID
- **Response**:
  ```json
  {
    "totalCourses": 100,
    "totalTrainees": 500,
    "completionRate": 85,
    "avgScore": 78,
    "departmentStats": [
      {
        "departmentName": "string",
        "courseCount": 20,
        "traineeCount": 100,
        "completionRate": 90
      }
    ]
  }
  ```

#### 导出报表
- **URL**: `/api/reporting/export/`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "reportType": "training_statistics",
    "format": "excel",
    "filters": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    }
  }
  ```

## 错误处理规范

### 响应格式

#### 成功响应
```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

#### 错误响应
```json
{
  "code": 400,
  "message": "Validation error",
  "errors": {
    "field1": ["error message"],
    "field2": ["error message"]
  }
}
```

### HTTP状态码

- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器错误

## 前端API调用示例

### 使用API模块

```javascript
import { userAPI } from '@/api'

// 获取用户列表
const users = await userAPI.getUsers({
  page: 1,
  size: 10,
  search: 'keyword'
})

// 创建用户
const newUser = await userAPI.createUser({
  username: 'john_doe',
  realName: 'John Doe',
  email: 'john@example.com'
})
```

### 错误处理

```javascript
try {
  const result = await courseAPI.createCourse(courseData)
  ElMessage.success(t('message.saveSuccess'))
} catch (error) {
  ElMessage.error(error.message || t('message.saveFailed'))
}
```

## 数据格式规范

### 日期时间格式
- 所有日期时间使用 ISO 8601 格式: `2024-01-15T10:30:00Z`
- 仅日期使用: `2024-01-15`

### 枚举值
- 状态字段使用小写字符串: `active`, `inactive`, `draft`, `published`
- 类型字段使用大写字符串: `SYSTEM_ADMIN`, `HR_MANAGER`

### 分页参数
- `page`: 页码，从1开始
- `size`: 每页数量，默认10
- `count`: 总记录数

## 安全建议

1. **JWT Token**: 使用Access Token + Refresh Token机制
2. **HTTPS**: 生产环境必须使用HTTPS
3. **输入验证**: 前后端都要进行输入验证
4. **权限控制**: 基于角色的访问控制(RBAC)
5. **审计日志**: 记录重要操作

## 开发环境配置

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 环境变量
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=TCMS
```