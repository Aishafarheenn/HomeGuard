export const BASE_URL='http://localhost8000'
export const endpoint={
   BASE_URL,
   
   auth:{
    login:`${BASE_URL}/auth/login`,
    refresh:`${BASE_URL}/auth/refresh`
   },

   owner:{
    create:`${BASE_URL}/owner/create`,
    get:`${BASE_URL}/owner/get`
   },

   inspector:{
    create:`${BASE_URL}/inspector/create`

   },

   inspection:{
    create:`${BASE_URL}/inspection/create`,
    get:`${BASE_URL}/inspection/create`
    },


   }
