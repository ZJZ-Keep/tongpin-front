<template>
  <div class="user-card-list">
    <template v-if="props.loading">
      <van-skeleton v-for="i in 3" :key="i" title :row="3" />
    </template>
    <template v-else>
      <van-card
        v-for="user in props.userList"
        :key="user.id"
        :thumb="user.avatarUrl || DEFAULT_AVATAR"
        :title="user.username || user.userAccount || '匿名用户'"
        :desc="`编号：${user.planetCode || '无'}`"
      >
        <template #tags>
          <van-tag
            plain
            type="primary"
            v-for="tag in parseTags(user.tags)"
            :key="tag"
            style="margin-right: 4px;"
          >
            {{ tag }}
          </van-tag>
        </template>
        <template #footer>
          <van-button size="mini" type="primary" plain icon="chat-o" @click="toChat(user.id)">
            联系
          </van-button>
        </template>
      </van-card>
      <van-empty v-if="props.userList.length < 1" description="暂无用户" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { DEFAULT_AVATAR } from '../constants/user.ts';

interface UserCardListProps {
  userList: any[];
  loading?: boolean;
}

const props = withDefaults(defineProps<UserCardListProps>(), {
  userList: () => [],
  loading: true,
});

const router = useRouter();

const toChat = (id: number) => router.push(`/chat/${id}`);

// 安全解析标签
const parseTags = (tags: any) => {
  if (!tags) {
    return [];
  }
  if (Array.isArray(tags)) {
    return tags;
  }
  try {
    return JSON.parse(tags);
  } catch (e) {
    return [];
  }
};
</script>

<style scoped>
.user-card-list {
  padding-bottom: 8px;
}
</style>
