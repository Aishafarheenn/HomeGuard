import api from "../api";
import { endpoint } from "../endpoints";

export const feedbackService = {
  CreateFeedback: async (data) => {
    const payload = {
      rating: data.rating,
      comment: data.comment,
    }
    const response = await api.post(endpoint.Feedback.create, payload)
    return response.data
  },

  getFeedback: async () => {
    const response = await api.get(endpoint.Feedback.get)
    return response.data
  },

  createInspectionReview: async ({ inspection_id, rating, comment }) => {
    const response = await api.post(endpoint.Feedback.inspectionReviews, {
      inspection_id,
      rating,
      comment,
    })
    return response.data
  },

  getInspectionReviews: async () => {
    const response = await api.get(endpoint.Feedback.inspectionReviews)
    return response.data
  },
}
