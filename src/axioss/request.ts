import axios from 'axios'
import { ElMessage } from 'element-plus'

const myAxios = axios.create({
    baseURL: 'http://localhost:8886',
    timeout: 60000,
    withCredentials: true,
})

// interceptors
myAxios.interceptors.request.use(
    function (config){
        return config
    },
    function(error){
        return Promise.reject(error)
    }
)

myAxios.interceptors.response.use(
    function (response){
        const {data} = response
        if(data.code === 40100){
            if(!response.request.responseURL.includes('user/get/login') && !window.location.pathname.includes('/user/login') && !window.location.pathname.includes('/user/register')){
                ElMessage.warning('please login first')
                window.location.href = `/user/login?redirect=${window.location.href}`
            }
        }
        return response
    }
    ,
    function(error){
        return Promise.reject(error)
    },
)

export default myAxios