<template>
  <div class="team-add-page">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="team.name"
          name="name"
          label="队伍名"
          placeholder="请输入队伍名（不超过 20 字）"
          :rules="[
            { required: true, message: '请输入队伍名' },
            { validator: (v: string) => !v || v.length <= 20, message: '队伍名不能超过 20 个字符' }
          ]"
        />
        <van-field
          v-model="team.description"
          rows="4"
          autosize
          label="队伍描述"
          type="textarea"
          placeholder="请输入队伍描述（不超过 512 字）"
          :rules="[
            { validator: (v: string) => !v || v.length <= 512, message: '描述不能超过 512 个字符' }
          ]"
        />
        <van-field name="stepper" label="最大人数">
          <template #input>
            <van-stepper v-model="team.maxNum" :min="2" :max="20" />
          </template>
        </van-field>
        <van-field
          v-model="expireTimeText"
          is-link
          readonly
          name="datePicker"
          label="过期时间"
          placeholder="点击选择过期时间"
          @click="showPicker = true"
        />
        <van-popup v-model:show="showPicker" destroy-on-close position="bottom">
          <van-date-picker
            v-model="pickerValue"
            :min-date="minDate"
            @confirm="onConfirm"
            @cancel="showPicker = false"
          />
        </van-popup>
        <van-field name="radio" label="队伍状态">
          <template #input>
            <van-radio-group v-model="team.status" direction="horizontal">
              <van-radio :name="0">公开</van-radio>
              <van-radio :name="1">私有</van-radio>
              <van-radio :name="2">加密</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-if="team.status === 2"
          v-model="team.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入队伍密码（不超过 32 位）"
          :rules="[{ required: true, message: '请填写密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          创建队伍
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

const pad = (n: number) => String(n).padStart(2, '0');

// 默认过期时间：7 天后 23:59:59
const defaultDate = new Date();
defaultDate.setDate(defaultDate.getDate() + 7);

const defaultExpire = `${defaultDate.getFullYear()}-${pad(defaultDate.getMonth() + 1)}-${pad(
  defaultDate.getDate(),
)} 23:59:59`;

const team = ref({
  name: '',
  description: '',
  maxNum: 3,
  status: 0,
  password: '',
  expireTime: defaultExpire,
});

const expireTimeText = ref(defaultExpire);
const showPicker = ref(false);
const minDate = new Date();
const pickerValue = ref<string[]>([
  String(defaultDate.getFullYear()),
  pad(defaultDate.getMonth() + 1),
  pad(defaultDate.getDate()),
]);

const onConfirm = ({ selectedValues }: { selectedValues: string[] }) => {
  const [y, m, d] = selectedValues;
  team.value.expireTime = `${y}-${m}-${d} 23:59:59`;
  expireTimeText.value = team.value.expireTime;
  pickerValue.value = selectedValues;
  showPicker.value = false;
};

const onSubmit = async () => {
  if (submitting.value) {
    return;
  }
  submitting.value = true;
  try {
    const postData = { ...team.value };
    const res = await myAxios.post('/team/add', postData);
    if (res.code === 0 && res.data) {
      showSuccessToast('创建成功');
      router.replace('/team');
    } else {
      showFailToast(res.description || '创建失败');
    }
  } catch (e) {
    showFailToast('创建失败，请稍后重试');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.team-add-page {
  padding-top: 12px;
  padding-bottom: 24px;
}
</style>
