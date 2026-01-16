import request from './request'

// 审计日志API
export const auditLogAPI = {
  // 获取审计日志列表
  getAuditLogs: (params) => request.get('/api/reporting/audit-logs/', { params }),
  
  // 获取审计日志详情
  getAuditLogDetails: (id) => request.get(`/api/reporting/audit-logs/${id}/`),
  
  // 删除审计日志
  deleteAuditLog: (id) => request.delete(`/api/reporting/audit-logs/${id}/`)
}

// 报表模板API
export const templateAPI = {
  // 获取报表模板列表
  getTemplates: (params) => request.get('/api/reporting/templates/', { params }),
  
  // 获取报表模板详情
  getTemplateDetails: (id) => request.get(`/api/reporting/templates/${id}/`),
  
  // 创建报表模板
  createTemplate: (data) => request.post('/api/reporting/templates/', data),
  
  // 更新报表模板
  updateTemplate: (id, data) => request.put(`/api/reporting/templates/${id}/`, data),
  
  // 删除报表模板
  deleteTemplate: (id) => request.delete(`/api/reporting/templates/${id}/`)
}

// 报表API
export const reportAPI = {
  // 获取报表列表
  getReports: (params) => request.get('/api/reporting/reports/', { params }),
  
  // 获取报表详情
  getReportDetails: (id) => request.get(`/api/reporting/reports/${id}/`),
  
  // 生成报表
  generateReport: (templateId, data) => request.post(`/api/reporting/reports/${templateId}/generate/`, data),
  
  // 重新生成报表
  regenerateReport: (id) => request.post(`/api/reporting/reports/${id}/regenerate/`),
  
  // 下载报表
  downloadReport: (id) => request.get(`/api/reporting/reports/${id}/download/`, { responseType: 'blob' }),
  
  // 删除报表
  deleteReport: (id) => request.delete(`/api/reporting/reports/${id}/`)
}

// 系统统计API
export const statisticsAPI = {
  // 获取系统统计列表
  getStatistics: (params) => request.get('/api/reporting/statistics/', { params }),
  
  // 获取仪表盘统计
  getDashboardStatistics: () => request.get('/api/reporting/dashboard/')
}

// 合规记录API
export const complianceAPI = {
  // 获取合规记录列表
  getComplianceRecords: (params) => request.get('/api/reporting/compliance/', { params }),
  
  // 获取合规记录详情
  getComplianceDetails: (id) => request.get(`/api/reporting/compliance/${id}/`),
  
  // 创建合规记录
  createComplianceRecord: (data) => request.post('/api/reporting/compliance/', data),
  
  // 更新合规记录
  updateComplianceRecord: (id, data) => request.put(`/api/reporting/compliance/${id}/`, data),
  
  // 删除合规记录
  deleteComplianceRecord: (id) => request.delete(`/api/reporting/compliance/${id}/`)
}
export const reportingAPI = {
  getReports: reportAPI.getReports,
  getAuditLogs: auditLogAPI.getAuditLogs
}