import api from '../api'
import { endpoint } from '../endpoints'

export const authServices = {
    login: async (email , password ) =>{
        try{
            const response = await api.post(endpoint.auth.login, {
                email,
                password
            })
            return response.data
             
        } catch (error) {
            const message = error.response?.data?.detail || 'login failed. please check email or password'
            throw new Error(message)
        }
        
    },

    
}