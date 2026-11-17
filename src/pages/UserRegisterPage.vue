<template>
  <div class="register-page">
    <div class="register-header">
      <h2>用户注册</h2>
      <p>创建你的同频账号，注册后系统会自动分配用户编号</p>
    </div>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="formData.userAccount"
          name="userAccount"
          label="账号"
          placeholder="请输入账号（4 位以上，不含特殊字符）"
          :rules="[{ required: true, message: '请输入账号' }]"
        />
        <van-field
          v-model="formData.userPassword"
          type="password"
          name="userPassword"
          label="密码"
          placeholder="请输入密码（8 位以上）"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
        <van-field
          v-model="formData.checkPassword"
          type="password"
          name="checkPassword"
          label="确认密码"
          placeholder="请再次输入密码"
          :rules="[
            { required: true, message: '请确认密码' },
            { validator: validatePassword, message: '两次输入的密码不一致' }
          ]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          注册
        </van-button>
        <van-button round block type="default" style="margin-top: 12px;" @click="goToLogin">
          已有账号？去登录
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';

const router = useRouter();
const submitting = ref(false);

const formData = ref({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
});

const validatePassword = (val: string) => val === formData.value.userPassword;

const onSubmit = async () => {
  if (submitting.value) {
    return;
  }
  submitting.value = true;
  try {
    const res = await myAxios.post('/user/register', { ...formData.value });
    if (res.code === 0 && res.data) {
      showSuccessToast('注册成功，请登录');
      router.replace('/login');
    } else {
      showFailToast(res.description || res.message || '注册失败');
    }
  } catch (e) {
    showFailToast('注册失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};

const goToLogin = () => router.push('/login');
</script>

<style scoped>
.register-page {
  padding-top: 24px;
}
.register-header {
  text-align: center;
  margin-bottom: 16px;
}
.register-header h2 {
  margin: 0 0 8px;
  color: #323233;
}
.register-header p {
  margin: 0;
  font-size: 13px;
  color: #969799;
}
</style>
