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
}
