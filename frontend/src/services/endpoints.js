

export const BASE_URL = 'http://localhost:8001'

export const endpoint = {
  BASE_URL,

  auth: {
    login: `${BASE_URL}/auth/login`,
    refresh: `${BASE_URL}/auth/refresh`,
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
    approve: (id) => `${BASE_URL}/inspectors/${id}/approve`,
    reject: (id) => `${BASE_URL}/inspectors/${id}/reject`,
  },

  inspection: {
    create: `${BASE_URL}/inspection/create`,
    get: `${BASE_URL}/inspection`,
  },

  Package: {
    create: `${BASE_URL}/inspection/packages`,
    get: `${BASE_URL}/inspection/packages`
  },

  Property: {
    create: `${BASE_URL}/properties`,
    get: `${BASE_URL}/properties`,
    put:`${BASE_URL}/properties/property`
  },

  JobTicket: {
    create: `${BASE_URL}/inspection/jobticket`
  },

  Complaint: {
    create: `${BASE_URL}/complaints/complaints`,
    get: `${BASE_URL}/complaints`
  },

  Feedback: {
    create: `${BASE_URL}/feedback/feedback`,
    get: `${BASE_URL}/feedback/feedback`,
  }
}
