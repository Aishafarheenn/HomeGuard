import api from '../api'
import { endpoint } from '../endpoints'

export const paymentServices = {
  submitPayment: async (data) => {
    const form = new FormData()
    form.append('schedule_id', data.schedule_id)
    form.append('amount', data.amount)
    form.append('currency', data.currency ?? 'INR')
    form.append('method', data.method)
    if (data.reference_no != null) form.append('reference_no', data.reference_no)
    if (data.notes != null) form.append('notes', data.notes)
    if (data.proof_file) form.append('proof_file', data.proof_file)

    const response = await api.post(endpoint.payments.submit, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  getMyPayments: async () => {
    const response = await api.get(endpoint.payments.my)
    return response.data
  },

  getAllPayments: async () => {
    const response = await api.get(endpoint.payments.list)
    return response.data
  },

  verifyPayment: async (paymentId, update = {}) => {
    const response = await api.patch(endpoint.payments.verify(paymentId), update)
    return response.data
  },

  rejectPayment: async (paymentId, update = {}) => {
    const response = await api.patch(endpoint.payments.reject(paymentId), update)
    return response.data
  },
}

