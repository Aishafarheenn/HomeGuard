import api from '../api'
import { endpoint } from '../endpoints'

export const inspectionServices = {
  getMyJobs: async () => {
    const response = await api.get(endpoint.inspection.myJobs)
    return response.data
  },

  getInspections: async () => {
    const response = await api.get(endpoint.inspection.inspections)
    return response.data
  },

  getInspection: async (id) => {
    const response = await api.get(endpoint.inspection.inspectionOne(id))
    return response.data
  },

  createInspection: async (data) => {
    const payload = {
      job_ticket_id: data.job_ticket_id,
      start_time: data.start_time,
      end_time: data.end_time,
      overall_status: data.overall_status ?? 'scheduled',
    }
    const response = await api.post(endpoint.inspection.inspections, payload)
    return response.data
  },

  updateInspection: async (id, data) => {
    const payload = {}
    if (data.start_time !== undefined) payload.start_time = data.start_time
    if (data.end_time !== undefined) payload.end_time = data.end_time
    if (data.overall_status !== undefined) payload.overall_status = data.overall_status
    const response = await api.put(endpoint.inspection.inspectionOne(id), payload)
    return response.data
  },

  deleteInspection: async (id) => {
    const response = await api.delete(endpoint.inspection.inspectionOne(id))
    return response.data
  },

  getChecklistItemsByPackage: async (packageId) => {
    const response = await api.get(endpoint.inspection.packageChecklistItems(packageId))
    return response.data
  },

  getChecklistResultsByInspection: async (inspectionId) => {
    const response = await api.get(endpoint.inspection.inspectionChecklistResults(inspectionId))
    return response.data
  },

  createChecklistResult: async (data) => {
    const response = await api.post(endpoint.inspection.checklistResults, data)
    return response.data
  },

  updateChecklistResult: async (resultId, data) => {
    const response = await api.put(endpoint.inspection.checklistResultOne(resultId), data)
    return response.data
  },

  getOwnerJobReport: async (scheduleId) => {
    const response = await api.get(endpoint.inspection.ownerJobReport, {
      params: { schedule_id: scheduleId },
    })
    return response.data
  },
}

export const reportServices = {
  getInspectionReports: async (inspectionId) => {
    const response = await api.get(endpoint.reports.inspectionReports, {
      params: inspectionId != null ? { inspection_id: inspectionId } : undefined,
    })
    return response.data
  },

  createInspectionReport: async (data) => {
    const response = await api.post(endpoint.reports.inspectionReports, data)
    return response.data
  },

  updateInspectionReport: async (reportId, data) => {
    const response = await api.put(endpoint.reports.inspectionReportOne(reportId), data)
    return response.data
  },
}
