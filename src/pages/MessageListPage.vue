<template>
  <div class="message-list-page">
    <van-loading v-if="loading" class="loading-center" />
    <template v-else>
      <van-cell
        v-for="conv in conversations"
        :key="conv.targetId"
        :title="conv.targetUser?.username || '用户'"
        :label="conv.lastMessage"
        :value="conv.unreadCount > 0 ? conv.unreadCount + ' 条未读' : formatDate(conv.lastTime, false)"
        is-link
        @click="toChat(conv.targetId)"
      />
      <van-empty v-if="conversations.length === 0" description="暂无会话，去首页找人聊聊吧" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import myAxios from '../plugis/myAxios.ts';
import { formatDate } from '../utils/format.ts';

interface Conversation {
  targetId: number;
  targetUser?: { username?: string; avatarUrl?: string };
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

const router = useRouter();
const conversations = ref<Conversation[]>([]);
const loading = ref(true);

const toChat = (id: number) => router.push(`/chat/${id}`);

onMounted(async () => {
  try {
    const res = await myAxios.get('/message/conversations');
    // 没有会话或接口异常时都按空列表处理，不弹错误
    conversations.value = res && res.code === 0 ? res.data || [] : [];
  } catch (e) {
    conversations.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.message-list-page {
  padding-bottom: 24px;
}
.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}
</style>
