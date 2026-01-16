// src/api/index.js

// 1. 先把会冲突的 star export 拆开
export * from './auth'
export * from './organization'
export * from './examination'
export * from './competency'
export * from './position'
export * from './reporting'

// 2. training.js 里也有 userAPI，但我们只用它里面的 training 相关 API
//    因此把 training 的 star export 拆开，只导出非 userAPI 部分
export {
  trainingPlanAPI,
  trainingRecordAPI,
  courseAPI,
  trainingAPI
} from './training'

// 3. users.js 的 userAPI 作为唯一来源
export { userAPI } from './users'