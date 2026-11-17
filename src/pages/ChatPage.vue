<template>
  <div class="chat-page">
    <div class="chat-header">
      <van-image round width="40" height="40" fit="cover" :src="targetAvatar" />
      <div class="chat-title">
        <div class="name">{{ targetUser?.username || targetUser?.userAccount || '用户' }}</div>
        <div class="status">{{ connected ? '实时连接已建立' : '连接中...' }}</div>
      </div>
    </div>

    <div class="message-list" ref="listRef">
      <template v-for="(msg, index) in messages" :key="msg.id">
        <div v-if="showTime(index)" class="message-time">{{ formatMsgTime(msg.timeMs) }}</div>
        <div :class="['message-row', msg.mine ? 'mine' : 'other']">
          <van-image round width="32" height="32" fit="cover" :src="msg.mine ? myAvatar : targetAvatar" />
          <div class="bubble">{{ msg.content }}</div>
        </div>
      </template>
      <van-empty v-if="messages.length === 0" description="还没有消息，打个招呼吧" />
    </div>

    <div class="input-bar">
      <van-field
        v-model="inputText"
        placeholder="输入消息..."
        type="textarea"
        rows="1"
        autosize
        maxlength="1024"
        style="flex: 1;"
      />
      <van-button
        size="small"
        type="primary"
        :disabled="!inputText.trim() || !connected"
        @click="send"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import { getCurrentUser } from '../services/user.ts';
import { DEFAULT_AVATAR } from '../constants/user.ts';
import type { UserType } from '../models/user';

interface ChatMsg {
  id: number;
  content: string;
  mine: boolean;
  timeMs: number;
}

const route = useRoute();
const targetId = Number(route.params.userId);

const targetUser = ref<UserType>();
const myUser = ref<UserType>();
const messages = ref<ChatMsg[]>([]);
const inputText = ref('');
const connected = ref(false);
const listRef = ref<HTMLElement>();

let ws: WebSocket | null = null;
let reconnectTimer: number | null = null;
let heartbeatTimer: number | null = null;
let manualClose = false;
let reconnectAttempts = 0;

const targetAvatar = computed(() => targetUser.value?.avatarUrl || DEFAULT_AVATAR);
const myAvatar = computed(() => myUser.value?.avatarUrl || DEFAULT_AVATAR);

const scrollToBottom = async () => {
  await nextTick();
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight;
  }
};

const markRead = () => {
  myAxios
    .post('/message/read', targetId, { headers: { 'Content-Type': 'application/json' } })
    .then(() => {
      // 通知布局刷新未读角标
      window.dispatchEvent(new Event('message-read'));
    })
    .catch(() => {});
};

const loadUsers = async () => {
  const [me, targetRes] = await Promise.all([
    getCurrentUser(),
    myAxios.get('/user/get', { params: { id: targetId } }).catch(() => null),
  ]);
  myUser.value = me || undefined;
  if (targetRes && targetRes.code === 0) {
    targetUser.value = targetRes.data;
  }
};

const loadHistory = async () => {
  try {
    const res = await myAxios.get('/message/history', {
      params: { targetId, pageNum: 1, pageSize: 100 },
    });
    if (res.code === 0) {
      messages.value = (res.data || []).map((m: any) => ({
        id: m.id,
        content: m.content,
        mine: m.senderId === myUser.value?.id,
        timeMs: toTimeMs(m.createTime),
      }));
      await scrollToBottom();
    }
  } catch (e) {
    // 忽略历史加载失败
  }
};

const connect = () => {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${location.host}/api/ws/chat`);

  ws.onopen = () => {
    connected.value = true;
    reconnectAttempts = 0;
    startHeartbeat();
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'chat' && data.senderId === targetId) {
        messages.value.push({
          id: data.id,
          content: data.content,
          mine: false,
          timeMs: toTimeMs(data.createTime),
        });
        scrollToBottom();
        markRead();
      } else if (data.type === 'pong') {
        connected.value = true;
      } else if (data.type === 'error') {
        showFailToast(data.message || '消息发送失败');
      }
    } catch (e) {
      // ignore
    }
  };

  ws.onclose = () => {
    connected.value = false;
    stopHeartbeat();
    if (!manualClose) {
      scheduleReconnect();
    }
  };

  ws.onerror = () => {
    connected.value = false;
  };
};

const scheduleReconnect = () => {
  if (reconnectTimer || reconnectAttempts >= 5) {
    return;
  }
  reconnectAttempts += 1;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 3000);
};

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatTimer = window.setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }));
    }
  }, 20000);
};

const stopHeartbeat = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

const send = () => {
  const content = inputText.value.trim();
  if (!content) {
    return;
  }
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    showFailToast('连接未就绪，请稍后重试');
    return;
  }
  ws.send(JSON.stringify({ type: 'chat', toUserId: targetId, content }));
  messages.value.push({ id: Date.now(), content, mine: true, timeMs: Date.now() });
  inputText.value = '';
  scrollToBottom();
};

/** 把后端时间字符串/时间戳转成毫秒 */
const toTimeMs = (value?: string | number | null): number => {
  if (!value) {
    return Date.now();
  }
  if (typeof value === 'number') {
    return value;
  }
  const d = new Date(String(value).replace(' ', 'T'));
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
};

/** 超过 5 分钟才显示一次时间（类似微信） */
const showTime = (index: number): boolean => {
  if (index === 0) {
    return true;
  }
  const cur = messages.value[index];
  const prev = messages.value[index - 1];
  if (!cur || !prev) {
    return false;
  }
  return cur.timeMs - prev.timeMs >= 5 * 60 * 1000;
};

const formatMsgTime = (ms: number): string => {
  const d = new Date(ms);
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (d.toDateString() === now.toDateString()) {
    return hm;
  }
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hm}`;
};

onMounted(async () => {
  await loadUsers();
  await loadHistory();
  markRead();
  connect();
});

onBeforeUnmount(() => {
  manualClose = true;
  stopHeartbeat();
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  ws?.close();
});
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 46px);
  background: #f7f8fa;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #ebedf0;
}
.chat-title .name {
  font-size: 15px;
  font-weight: 600;
  color: #323233;
}
.chat-title .status {
  font-size: 12px;
  color: #969799;
}
.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px 16px;
}
.message-time {
  text-align: center;
  font-size: 12px;
  color: #b0b4bb;
  margin: 8px 0 12px;
}
.message-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}
.message-row.mine {
  flex-direction: row-reverse;
}
.bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  font-size: 14px;
  color: #323233;
  word-break: break-word;
  white-space: pre-wrap;
}
.message-row.mine .bubble {
  background: #1989fa;
  color: #fff;
}
.input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-top: 1px solid #ebedf0;
}
</style>
