<template>
  <van-form @submit="onSubmit">
    <!-- 头像编辑：支持上传图片或粘贴图片链接 -->
    <template v-if="isAvatar">
      <van-cell-group inset>
        <van-cell title="当前头像">
          <template #value>
            <van-image round width="48" height="48" fit="cover" :src="userEdit.currentValue || DEFAULT_AVATAR" />
          </template>
        </van-cell>
        <van-field name="uploader" label="上传图片">
          <template #input>
            <van-uploader :after-read="afterRead" :max-count="1" :preview-size="48" />
          </template>
        </van-field>
        <van-field
          v-model="userEdit.currentValue"
          label="图片链接"
          placeholder="也可直接粘贴图片链接"
        />
      </van-cell-group>
      <div class="tip">支持 jpg / png / gif / webp，大小不超过 5MB</div>
    </template>

    <!-- 性别编辑：男 / 女 -->
    <template v-else-if="isGender">
      <van-cell-group inset>
        <van-field name="radio" label="性别">
          <template #input>
            <van-radio-group v-model="genderValue" direction="horizontal">
              <van-radio :name="0">男</van-radio>
              <van-radio :name="1">女</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-cell-group>
    </template>

    <!-- 普通字段编辑 -->
    <template v-else>
      <van-field
        v-model="userEdit.currentValue"
        :name="userEdit.editKey"
        :label="userEdit.editName"
        :placeholder="`请输入${userEdit.editName}`"
        :rules="fieldRules"
      />
    </template>

    <div class="submit-bar">
      <van-button round block type="primary" native-type="submit" :loading="submitting">
        提交
      </van-button>
    </div>
  </van-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showSuccessToast, showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import { getCurrentUser } from '../services/user.ts';
import { DEFAULT_AVATAR } from '../constants/user.ts';

const route = useRoute();
const router = useRouter();

const userEdit = ref({
  editKey: route.query.editKey as string,
  currentValue: (route.query.currentValue as string) || '',
  editName: route.query.editName as string,
});

const isAvatar = computed(() => userEdit.value.editKey === 'avatarUrl');
const isGender = computed(() => userEdit.value.editKey === 'gender');

// 性别默认值
const initGender = route.query.currentValue !== undefined && route.query.currentValue !== ''
  ? Number(route.query.currentValue)
  : 0;
const genderValue = ref<number>(isNaN(initGender) ? 0 : initGender);

const submitting = ref(false);

const fieldRules = computed(() => {
  const key = userEdit.value.editKey;
  if (key === 'phone') {
    return [
      {
        validator: (val: string) => !val || /^1[3-9]\d{9}$/.test(val),
        message: '请输入正确的手机号（11 位）',
      },
    ];
  }
  if (key === 'email') {
    return [
      {
        validator: (val: string) => !val || /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(val),
        message: '请输入正确的邮箱地址',
      },
    ];
  }
  if (key === 'username') {
    return [
      {
        validator: (val: string) => !val || val.length <= 20,
        message: '昵称不能超过 20 个字符',
      },
    ];
  }
  return [];
});

// 上传图片
const afterRead = async (item: any) => {
  const file = Array.isArray(item) ? item[0]?.file : item?.file;
  if (!file) {
    return;
  }
  const form = new FormData();
  form.append('file', file);
  try {
    const res = await myAxios.post('/user/avatar/upload', form);
    if (res.code === 0 && res.data) {
      userEdit.value.currentValue = res.data;
      showSuccessToast('上传成功');
    } else {
      showFailToast(res.description || '上传失败');
    }
  } catch (e) {
    showFailToast('上传失败，请稍后重试');
  }
};

const onSubmit = async () => {
  if (submitting.value) {
    return;
  }
  // 头像场景要求有链接
  if (isAvatar.value && !userEdit.value.currentValue) {
    showFailToast('请上传图片或填写图片链接');
    return;
  }
  submitting.value = true;
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      showFailToast('请先登录');
      return;
    }
    const payload: Record<string, any> = { id: currentUser.id };
    if (isGender.value) {
      payload.gender = genderValue.value;
    } else {
      payload[userEdit.value.editKey] = userEdit.value.currentValue;
    }
    const res = await myAxios.post('/user/update', payload);
    if (res.code === 0) {
      showSuccessToast('修改成功');
      router.back();
    } else {
      showFailToast(res.description || '修改失败');
    }
  } catch (e) {
    showFailToast('修改失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.tip {
  padding: 8px 20px;
  font-size: 12px;
  color: #969799;
}
.submit-bar {
  margin: 16px;
}
</style>
