import { defineStore } from 'pinia';
import { ref } from 'vue';
import {getLoginUser} from "../api/userController";
import USER_ROLE_ENUM from '../enums/USER_ROLE_ENUM';


export const useLoginUserStore = defineStore("loginUser" , ()=>{
  const loginUser = ref<API.Users>({
      username:"not login",
      role: USER_ROLE_ENUM.NOT_LOGIN
  });

  async function fetchLoginUser() {
      const res = await getLoginUser()
      if(res.data.code === 0 && res.data.data){
          loginUser.value = res.data.data;
      }
  }

  function setLoginStore(newLoginUser:API.Users){
      loginUser.value = newLoginUser;
  }

  function clearLoginStore(){
      loginUser.value = {
          username:"not login",
          role: USER_ROLE_ENUM.NOT_LOGIN
      }
  }

  return {loginUser,setLoginStore,fetchLoginUser,clearLoginStore}
});