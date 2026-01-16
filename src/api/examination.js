import request from './request'

// 题库API
export const questionBankAPI = {
  // 获取题库列表
  getQuestionBanks: (params) => request.get('/api/examination/question-banks/', { params }),
  
  // 获取题库详情
  getQuestionBankDetails: (id) => request.get(`/api/examination/question-banks/${id}/`),
  
  // 创建题库
  createQuestionBank: (data) => request.post('/api/examination/question-banks/', data),
  
  // 更新题库
  updateQuestionBank: (id, data) => request.put(`/api/examination/question-banks/${id}/`, data),
  
  // 删除题库
  deleteQuestionBank: (id) => request.delete(`/api/examination/question-banks/${id}/`)
}

// 题目API
export const questionAPI = {
  // 获取题目列表
  getQuestions: (params) => request.get('/api/examination/questions/', { params }),
  
  // 获取题目详情
  getQuestionDetails: (id) => request.get(`/api/examination/questions/${id}/`),
  
  // 创建题目
  createQuestion: (data) => request.post('/api/examination/questions/', data),
  
  // 更新题目
  updateQuestion: (id, data) => request.put(`/api/examination/questions/${id}/`, data),
  
  // 删除题目
  deleteQuestion: (id) => request.delete(`/api/examination/questions/${id}/`),
  
  // 导入题目
  importQuestions: (data) => request.post('/api/examination/questions/import/', data)
}

// 考试API
export const examAPI = {
  // 获取考试列表
  getExams: (params) => request.get('/api/examination/exams/', { params }),
  
  // 获取考试详情
  getExamDetails: (id) => request.get(`/api/examination/exams/${id}/`),
  
  // 创建考试
  createExam: (data) => request.post('/api/examination/exams/', data),
  
  // 更新考试
  updateExam: (id, data) => request.put(`/api/examination/exams/${id}/`, data),
  
  // 删除考试
  deleteExam: (id) => request.delete(`/api/examination/exams/${id}/`),
  
  // 发布考试
  publishExam: (id) => request.post(`/api/examination/exams/${id}/publish/`),
  
  // 管理参与人员
  manageParticipants: (id, data) => request.post(`/api/examination/exams/${id}/participants/`, data)
}

// 考试成绩API
export const examResultAPI = {
  // 获取考试成绩列表
  getExamResults: (params) => request.get('/api/examination/exam-results/', { params }),
  
  // 获取考试成绩详情
  getExamResultDetails: (id) => request.get(`/api/examination/exam-results/${id}/`),
  
  // 创建考试成绩
  createExamResult: (data) => request.post('/api/examination/exam-results/', data),
  
  // 更新考试成绩
  updateExamResult: (id, data) => request.put(`/api/examination/exam-results/${id}/`, data),
  
  // 删除考试成绩
  deleteExamResult: (id) => request.delete(`/api/examination/exam-results/${id}/`),
  
  // 提交考试
  submitExam: (examId, data) => request.post(`/api/examination/exams/${examId}/submit/`, data),
  
  // 生成证书
  generateCertificate: (id) => request.post(`/api/examination/exam-results/${id}/generate-certificate/`)
}

// 考试统计API
export const examStatsAPI = {
  // 获取考试统计
  getExaminationStatistics: () => request.get('/api/examination/statistics/')
}
