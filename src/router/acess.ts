import USER_ROLE_ENUM from '../enums/USER_ROLE_ENUM'
import { useLoginUserStore } from '../stores/user'
import router from './index'
// import ACCESS_ENUM from './accessEnum'

let firstFetchLoginUser = true

router.beforeEach(async (to , from , next) => {
    const loginUserStore = useLoginUserStore()
    if(firstFetchLoginUser){
        await loginUserStore.fetchLoginUser()
        firstFetchLoginUser = false
    }

    
    const loginuser = loginUserStore.loginUser
    console.log('userInfo : ' + loginuser)

    // 未获取 userStore 重定向
    if(!loginuser||!loginuser.role||loginuser.role === USER_ROLE_ENUM.NOT_LOGIN){
        next(`/login?redirect=${to.fullPath}`)
        return
    }

    // const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN
    // check access and userRole
    // if(needAccess !== ACCESS_ENUM.NOT_LOGIN){
    //     if(!loginuser||!loginuser.userRole||loginuser.userRole === ACCESS_ENUM.NOT_LOGIN){
    //         next(`/user/login?redirect=${to.fullPath}`)
    //         return
    //     }
    // }
    // if(needAccess === ACCESS_ENUM.ADMIN){
    //     if(loginuser.userRole !== ACCESS_ENUM.ADMIN){
    //         next('/noAuth')
    //         return
    //     }
    // }
    next()
})