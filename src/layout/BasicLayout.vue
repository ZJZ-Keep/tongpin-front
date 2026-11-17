<template>
  <van-nav-bar
    v-if="showNavBar"
    :title="title"
    left-arrow
    @click-left="onClickLeft"
    @click-right="onClickRight"
  >
    <template #right>
      <van-icon name="search" size="18" />
    </template>
  </van-nav-bar>
  <div class="content" :class="{ 'with-tabbar': showTabbar }">
    <RouterView />
  </div>
  <van-tabbar v-if="showTabbar" v-model="active" route>
    <van-tabbar-item to="/" icon="home-o" name="index">主页</van-tabbar-item>
    <van-tabbar-item to="/team" icon="search" name="team">队伍</van-tabbar-item>
    <van-tabbar-item
      to="/messages"
      icon="chat-o"
      name="messages"
      :badge="unreadCount > 0 ? unreadCount : ''"
    >消息</van-tabbar-item>
    <van-tabbar-item to="/user" icon="friends-o" name="user">个人</van-tabbar-item>
  </van-tabbar>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { routes } from '../config/route.ts';
import myAxios from '../plugis/myAxios.ts';

const route = useRoute();
const router = useRouter();
const active = ref(0);

// 登录 / 注册页不显示导航栏和底部 TabBar
const HIDE_CHROME_PATHS = ['/login', '/register'];

const showNavBar = computed(() => !HIDE_CHROME_PATHS.includes(route.path));
const showTabbar = computed(
  () => !HIDE_CHROME_PATHS.includes(route.path) && !route.path.startsWith('/chat'),
);

const onClickLeft = () => router.back();
const onClickRight = () => router.push({ path: '/search' });

const DEFAULT_TITLE = '伙伴匹配';
const title = computed(() => {
  if (route.path.startsWith('/chat/')) {
    return '聊天';
  }
  const matched = routes.find((r) => r.path === route.path);
  return matched?.title || DEFAULT_TITLE;
});

// 未读消息数（消息 Tab 红色角标）
const unreadCount = ref(0);
let unreadTimer: number | null = null;

const fetchUnread = async () => {
  if (HIDE_CHROME_PATHS.includes(route.path)) {
    return;
  }
  try {
    const res = await myAxios.get('/message/unread/count');
    if (res && res.code === 0) {
      unreadCount.value = Number(res.data) || 0;
    }
  } catch (e) {
    // 未登录或接口异常时静默处理
  }
};

onMounted(() => {
  fetchUnread();
  unreadTimer = window.setInterval(fetchUnread, 20000);
  window.addEventListener('message-read', fetchUnread);
});

onBeforeUnmount(() => {
  if (unreadTimer) {
    clearInterval(unreadTimer);
    unreadTimer = null;
  }
  window.removeEventListener('message-read', fetchUnread);
});

watch(
  () => route.path,
  () => fetchUnread(),
);
</script>

<style scoped>
.content.with-tabbar {
  padding-bottom: 50px;
}
</style>
