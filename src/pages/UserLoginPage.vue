<template>
  <div class="login-page">
    <div class="login-header">
      <h2>登录</h2>
      <p>欢迎回到同频匹配</p>
    </div>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
            v-model="userAccount"
            name="userAccount"
            label="账号"
            placeholder="请输入账号"
            :rules="[{ required: true, message: '请输入账号' }]"
        />
        <van-field
            v-model="userPassword"
            type="password"
            name="userPassword"
            label="密码"
            placeholder="密码"
            :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          登录
        </van-button>
      </div>
    </van-form>
    <div class="register-entry" @click="toRegister">
      还没有账号？<span class="register-link">立即注册</span>
    </div>
  </div>

</template>

<script setup lang="ts">
import {ref} from "vue";
import {useRoute, useRouter} from 'vue-router'
import {showSuccessToast, showFailToast} from 'vant';
import myAxios from "../plugis/myAxios.ts";
import {setCurrentUserState} from "../state/user.ts";

const router=useRouter()
const route=useRoute()
const userAccount = ref('');
const userPassword = ref('');
const submitting = ref(false)
const onSubmit =async () => {
  if (submitting.value) {
    return
  }
  submitting.value = true
  try {
    const res= await myAxios.post('/user/login',{
      userAccount: userAccount.value,
      userPassword: userPassword.value
    })
    if (res.code===0 && res.data) {
      // 记录登录态，避免路由守卫再查一次
      setCurrentUserState(res.data)
      showSuccessToast('登录成功')
      // 登录前想访问的页面，登录后回去；没有就回首页
      const redirect = (route.query.redirect as string) || '/'
      router.replace(redirect)
    } else {
      showFailToast(res.description || res.message || '账号或密码错误')
    }
  } catch (e) {
    showFailToast('登录失败，请稍后重试')
  } finally {
    submitting.value = false
  }
};

const toRegister = () => router.push('/register')
</script>


<style scoped>
.login-page {
  padding-top: 56px;
}
.login-header {
  text-align: center;
  margin-bottom: 20px;
}
.login-header h2 {
  margin: 0 0 8px;
  color: #323233;
  font-size: 24px;
}
.login-header p {
  margin: 0;
  font-size: 13px;
  color: #969799;
}
.register-entry {
  text-align: center;
  margin-top: 4px;
  padding: 8px;
  font-size: 14px;
  color: #646566;
}
.register-link {
  color: #1989fa;
  font-weight: 600;
}
</style>
