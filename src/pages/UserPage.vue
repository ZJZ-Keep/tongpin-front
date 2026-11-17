<template>
  <div class="user-page">
    <template v-if="user">
      <div class="user-header">
        <van-image
          round
          width="64"
          height="64"
          fit="cover"
          :src="user.avatarUrl || DEFAULT_AVATAR"
        />
        <div class="user-info">
          <div class="username">{{ user.username || user.userAccount || '未设置昵称' }}</div>
          <div class="account">账号：{{ user.userAccount }}</div>
          <van-tag plain type="primary">编号：{{ user.planetCode || '未分配' }}</van-tag>
        </div>
      </div>

      <van-cell-group inset class="group">
        <van-cell
          title="昵称"
          is-link
          :value="user.username || '未设置'"
          @click="toEdit('username', '昵称', user.username)"
        />
        <van-cell title="头像" is-link @click="toEdit('avatarUrl', '头像', user.avatarUrl)">
          <template #value>
            <van-image round width="32" height="32" fit="cover" :src="user.avatarUrl || DEFAULT_AVATAR" />
          </template>
        </van-cell>
        <van-cell
          title="性别"
          is-link
          :value="genderText"
          @click="toEdit('gender', '性别', String(user.gender ?? ''))"
        />
        <van-cell
          title="电话"
          is-link
          :value="user.phone || '未填写'"
          @click="toEdit('phone', '电话', user.phone)"
        />
        <van-cell
          title="邮箱"
          is-link
          :value="user.email || '未填写'"
          @click="toEdit('email', '邮箱', user.email)"
        />
        <van-cell title="星球编号" :value="user.planetCode || '未分配'" />
        <van-cell title="标签" is-link @click="toEditTags">
          <template #value>
            <template v-if="userTags.length">
              <van-tag
                v-for="tag in userTags"
                :key="tag"
                plain
                type="primary"
                style="margin-left: 4px;"
              >
                {{ tag }}
              </van-tag>
            </template>
            <span v-else>未设置</span>
          </template>
        </van-cell>
        <van-cell title="注册时间" :value="formatDate(user.createTime)" />
      </van-cell-group>

      <van-cell-group inset class="group">
        <van-cell title="我创建的队伍" is-link icon="friends-o" to="/user/team/create" />
        <van-cell title="我加入的队伍" is-link icon="friends-o" to="/user/team/join" />
      </van-cell-group>

      <div class="logout">
        <van-button round block type="danger" plain @click="doLogout">退出登录</van-button>
      </div>
    </template>
    <van-empty v-else description="加载中..." />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast } from 'vant';
import { getCurrentUser } from '../services/user.ts';
import myAxios from '../plugis/myAxios.ts';
import { genderMap, DEFAULT_AVATAR } from '../constants/user.ts';
import { formatDate } from '../utils/format.ts';
import { parseTags } from '../utils/tags.ts';
import { clearCurrentUserState } from '../state/user.ts';
import type { UserType } from '../models/user';

const user = ref<UserType>();
const router = useRouter();

const genderText = computed(() => {
  const g = user.value?.gender;
  if (g === null || g === undefined) {
    return '未设置';
  }
  return genderMap[g as number] ?? '未设置';
});

const userTags = computed(() => parseTags(user.value?.tags));

onMounted(async () => {
  const res = await getCurrentUser();
  if (res) {
    user.value = res;
  }
});

const toEdit = (editKey: string, editName: string, currentValue?: string) => {
  router.push({
    path: '/user/edit',
    query: {
      editKey,
      currentValue: currentValue ?? '',
      editName,
    },
  });
};

const toEditTags = () => router.push('/user/tags');

const doLogout = async () => {
  try {
    await myAxios.post('/user/logout');
  } catch (e) {
    // 忽略退出接口异常，本地仍然清理登录态
  }
  clearCurrentUserState();
  showSuccessToast('已退出登录');
  router.replace('/login');
};
</script>

<style scoped>
.user-page {
  padding-bottom: 24px;
}
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #e8f3ff, #ffffff);
}
.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.username {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}
.account {
  font-size: 13px;
  color: #969799;
}
.group {
  margin-top: 12px;
}
.logout {
  margin: 24px 16px 0;
}
</style>
