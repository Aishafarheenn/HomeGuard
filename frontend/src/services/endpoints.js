// Use VITE_API_URL in production (e.g. https://api.yourdomain.com). Default for development.
export const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:8001'

export const endpoint = {
  BASE_URL,

  auth: {
    login: `${BASE_URL}/auth/login`,
  },

  owner: {
    create: `${BASE_URL}/owners/create`,
    get: `${BASE_URL}/owners`,
    getOne: (id) => `${BASE_URL}/owners/${id}`,
  },

  inspector: {
    create: `${BASE_URL}/inspectors`,
    list: `${BASE_URL}/inspectors`,
    getOne: (id) => `${BASE_URL}/inspectors/${id}`,
    profile: (id) => `${BASE_URL}/inspectors/${id}/profile`,
    approve: (id) => `${BASE_URL}/inspectors/${id}/approve`,
    reject: (id) => `${BASE_URL}/inspectors/${id}/reject`,
  },

  // High-level inspection entry points
  inspection: {
    inspections: `${BASE_URL}/inspection/inspections`,
    inspectionOne: (id) => `${BASE_URL}/inspection/inspections/${id}`,
    inspectionChecklistResults: (id) => `${BASE_URL}/inspection/inspections/${id}/checklist-results`,
    schedules: `${BASE_URL}/inspection/schedules`,
    myJobs: `${BASE_URL}/inspection/my-jobs`,
    ownerJobReport: `${BASE_URL}/inspection/owner/job-report`,
    jobtickets: `${BASE_URL}/inspection/jobtickets`,
    jobticketOne: (id) => `${BASE_URL}/inspection/jobtickets/${id}`,
    packages: `${BASE_URL}/inspection/packages`,
    packageOne: (packageId) => `${BASE_URL}/inspection/packages/${packageId}`,
    packageChecklistItems: (packageId) => `${BASE_URL}/inspection/packages/${packageId}/checklist-items`,
    checklists: `${BASE_URL}/inspection/checklists`,
    checklistOne: (id) => `${BASE_URL}/inspection/checklists/${id}`,
    checklistResults: `${BASE_URL}/inspection/checklist-results`,
    checklistResultOne: (id) => `${BASE_URL}/inspection/checklist-results/${id}`,
  },
  reports: {
    inspectionReports: `${BASE_URL}/reports/inspection-reports`,
    inspectionReportOne: (id) => `${BASE_URL}/reports/inspection-reports/${id}`,
    evidence: `${BASE_URL}/reports/evidence`,
    evidenceUpload: `${BASE_URL}/reports/evidence/upload`,
    redFlagCategories: `${BASE_URL}/reports/red-flag-categories`,
    redFlags: `${BASE_URL}/reports/red-flags`,
  },

  Package: {
    create: `${BASE_URL}/inspection/packages`,
    get: `${BASE_URL}/inspection/packages`,
  },

  // Preferred naming used by services
  property: {
    list: `${BASE_URL}/properties`,
    one: (id) => `${BASE_URL}/properties/${id}`,
  },

  // Legacy alias (if any older code uses it)
  Property: {
    create: `${BASE_URL}/properties`,
    get: `${BASE_URL}/properties`,
    put: `${BASE_URL}/properties/property`,
  },

  JobTicket: {
    create: `${BASE_URL}/inspection/jobtickets`,
    get: `${BASE_URL}/inspection/jobtickets`,
  },

  Complaint: {
    create: `${BASE_URL}/complaints/complaints`,
    get: `${BASE_URL}/complaints/complaints`,
    respond: (id) => `${BASE_URL}/complaints/complaints/${id}/response`,
  },

  Feedback: {
    create: `${BASE_URL}/feedback/feedback`,
    get: `${BASE_URL}/feedback/feedback`,
    inspectionReviews: `${BASE_URL}/feedback/inspection-reviews`,
  },

  notifications: {
    my: `${BASE_URL}/notifications/my-notifications`,
    unread: `${BASE_URL}/notifications/unread`,
    read: (id) => `${BASE_URL}/notifications/${id}/read`,
    markAllRead: `${BASE_URL}/notifications/mark-all-read`,
    delete: (id) => `${BASE_URL}/notifications/${id}`,
  },

  payments: {
    submit: `${BASE_URL}/payments`,
    my: `${BASE_URL}/payments/my`,
    list: `${BASE_URL}/payments`,
    verify: (id) => `${BASE_URL}/payments/${id}/verify`,
    reject: (id) => `${BASE_URL}/payments/${id}/reject`,
  },
}
