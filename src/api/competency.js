import request from './request'

// 能力API
export const competencyAPI = {
  // 获取能力列表
  getCompetencies: (params) => request.get('/api/competency/competencies/', { params }),
  
  // 获取能力详情
  getCompetencyDetails: (id) => request.get(`/api/competency/competencies/${id}/`),
  
  // 创建能力
  createCompetency: (data) => request.post('/api/competency/competencies/', data),
  
  // 更新能力
  updateCompetency: (id, data) => request.put(`/api/competency/competencies/${id}/`, data),
  
  // 删除能力
  deleteCompetency: (id) => request.delete(`/api/competency/competencies/${id}/`),
  
  // 获取能力树
  getCompetencyTree: () => request.get('/api/competency/competencies/tree/'),
  
  // 获取能力评估列表
  getAssessments: (params) => request.get('/api/competency/assessments/', { params }),
  
  // 创建能力评估
  createAssessment: (data) => request.post('/api/competency/assessments/', data),
  
  // 获取能力矩阵列表
  getMatrix: (params) => request.get('/api/competency/matrix/', { params }),
  
  // 获取证书模板列表
  getCertificateTemplates: (params) => request.get('/api/competency/certificate-templates/', { params }),
  
  // 获取证书列表
  getCertificates: (params) => request.get('/api/competency/certificates/', { params }),
  
  // 获取证书详情
  getCertificateDetails: (id) => request.get(`/api/competency/certificates/${id}/`),
  
  // 创建证书
  createCertificate: (data) => request.post('/api/competency/certificates/', data),
  
  // 更新证书
  updateCertificate: (id, data) => request.put(`/api/competency/certificates/${id}/`, data),
  
  // 删除证书
  deleteCertificate: (id) => request.delete(`/api/competency/certificates/${id}/`),
  
  // 验证证书
  verifyCertificate: (code) => request.get(`/api/competency/certificates/verify/${code}/`),
  
  // 获取能力统计
  getCompetencyStatistics: () => request.get('/api/competency/statistics/')
}
