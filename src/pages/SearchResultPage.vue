<template>
  <van-loading v-if="loading" class="loading-center" />
  <van-card
    v-for="use in userList"
    :key="use.id"
    :desc="use.profile"
    :title="use.username + ('(' + use.planetCode + ')')"
    :thumb="use.avatarUrl || DEFAULT_AVATAR"
  >
    <template #tags>
      <van-tag
        plain
        type="primary"
        v-for="tag in parseTags(use.tags)"
        :key="tag"
        style="margin-right: 8px;margin-top: 8px"
      >
        {{ tag }}
      </van-tag>
    </template>
    <template #footer>
      <van-button size="mini" type="primary" plain icon="chat-o" @click="toChat(use.id)">
        联系
      </van-button>
    </template>
  </van-card>

  <van-empty v-if="!loading && userList.length === 0" description="没有找到匹配的用户" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import qs from 'qs';
import { showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import { DEFAULT_AVATAR } from '../constants/user.ts';
import type { UserType } from '../models/user';

const route = useRoute();
const router = useRouter();
const tags = route.query.tags as string[];
const username = (route.query.username as string) || '';

const loading = ref(true);
const userList = ref<UserType[]>([]);

const toChat = (id: number) => router.push(`/chat/${id}`);

const parseTags = (t: any) => {
  if (!t) {
    return [];
  }
  if (Array.isArray(t)) {
    return t;
  }
  try {
    return JSON.parse(t);
  } catch (e) {
    return [];
  }
};

onMounted(async () => {
  try {
    const params: Record<string, any> = {};
    if (tags && tags.length) {
      params.tagNameList = tags;
    }
    if (username) {
      params.username = username;
    }
    const res = await myAxios.get('/user/search/tags', {
      params,
      paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'repeat' }),
    });
    if (res.code === 0 && res.data) {
      userList.value = res.data;
    } else {
      showFailToast(res.description || '搜索失败');
    }
  } catch (e) {
    showFailToast('搜索失败，请稍后重试');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}
</style>
