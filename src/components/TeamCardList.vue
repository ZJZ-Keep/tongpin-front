<template>
  <div class="team-card-list">
    <van-card
      v-for="team in props.teamList"
      :key="team.id"
      :title="team.name"
      :desc="team.description || '暂无描述'"
      :thumb="TEAM_IMAGE"
    >
      <template #tags>
        <van-tag plain :type="getStatusType(team.status)" style="margin-right: 4px;">
          {{ getStatus[team.status] ?? '未知' }}
        </van-tag>
        <van-tag v-if="team.hasJoin" plain type="success">已加入</van-tag>
        <van-tag v-if="isExpired(team)" plain type="danger">已过期</van-tag>
      </template>
      <template #bottom>
        <div class="meta">队伍人数：{{ team.hasJoinNum ?? 0 }}/{{ team.maxNum }}</div>
        <div class="meta">创建时间：{{ formatDate(team.createTime) }}</div>
        <div class="meta" v-if="team.expireTime">过期时间：{{ formatDate(team.expireTime) }}</div>
      </template>
      <template #footer>
        <!-- 我创建的队伍 -->
        <template v-if="team.userId === currentUser?.id">
          <van-button size="mini" type="danger" plain @click="toDeleteTeam(team.id)">
            解散队伍
          </van-button>
        </template>
        <!-- 已加入（非创建者） -->
        <template v-else-if="team.hasJoin">
          <van-button size="mini" plain @click="toQuitTeam(team.id)">退出队伍</van-button>
        </template>
        <!-- 私有队伍不可加入 -->
        <template v-else-if="team.status === 1">
          <van-button size="mini" plain disabled>私有队伍</van-button>
        </template>
        <!-- 可加入 -->
        <template v-else>
          <van-button v-if="isExpired(team)" size="mini" plain disabled>已过期</van-button>
          <van-button v-else size="mini" type="success" plain @click="joinTeam(team)">
            加入队伍
          </van-button>
        </template>
      </template>
    </van-card>

    <!-- 加入加密队伍密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="请输入队伍密码"
      show-cancel-button
      @confirm="doJoinTeam"
      @cancel="cancelJoin"
    >
      <van-field v-model="password" type="password" placeholder="请输入密码" />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { TeamType } from '../models/team';
import type { UserType } from '../models/user';
import { getStatus } from '../constants/team.ts';
import { formatDate } from '../utils/format.ts';
import myAxios from '../plugis/myAxios.ts';
import { showFailToast, showSuccessToast } from 'vant';
import { getCurrentUser } from '../services/user.ts';

interface TeamCardListProps {
  teamList: TeamType[];
}

const props = withDefaults(defineProps<TeamCardListProps>(), {
  teamList: () => [],
});

const emit = defineEmits<{ (e: 'refresh'): void }>();

const TEAM_IMAGE = 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg';

const currentUser = ref<UserType>();
const showPasswordDialog = ref(false);
const password = ref('');
const joiningTeam = ref<TeamType>();

const getStatusType = (status: number) => {
  if (status === 2) {
    return 'warning';
  }
  if (status === 1) {
    return 'danger';
  }
  return 'primary';
};

const isExpired = (team: TeamType) => {
  if (!team.expireTime) {
    return false;
  }
  const t = new Date(String(team.expireTime).replace(' ', 'T')).getTime();
  return !isNaN(t) && t < Date.now();
};

onMounted(async () => {
  currentUser.value = await getCurrentUser();
});

const joinTeam = (team: TeamType) => {
  // 加密队伍需要先输入密码
  if (team.status === 2) {
    joiningTeam.value = team;
    password.value = '';
    showPasswordDialog.value = true;
    return;
  }
  doJoin(team);
};

const doJoinTeam = () => {
  if (joiningTeam.value) {
    doJoin(joiningTeam.value);
  }
};

const cancelJoin = () => {
  joiningTeam.value = undefined;
  password.value = '';
};

const doJoin = async (team: TeamType) => {
  try {
    const res = await myAxios.post('/team/join', {
      teamId: team.id,
      password: password.value,
    });
    if (res.code === 0) {
      // 本地即时更新，按钮立刻变化
      team.hasJoin = true;
      team.hasJoinNum = (team.hasJoinNum ?? 0) + 1;
      showSuccessToast('加入成功');
      emit('refresh');
    } else {
      showFailToast(res.description || '加入失败');
    }
  } catch (e) {
    showFailToast('加入失败，请稍后重试');
  } finally {
    showPasswordDialog.value = false;
    joiningTeam.value = undefined;
    password.value = '';
  }
};

const toQuitTeam = async (id: number) => {
  try {
    const res = await myAxios.post('/team/quit', { teamId: id });
    if (res.code === 0) {
      showSuccessToast('已退出队伍');
      emit('refresh');
    } else {
      showFailToast(res.description || '退出失败');
    }
  } catch (e) {
    showFailToast('退出失败，请稍后重试');
  }
};

const toDeleteTeam = async (id: number) => {
  try {
    const res = await myAxios.post('/team/delete', id, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.code === 0) {
      showSuccessToast('已解散队伍');
      emit('refresh');
    } else {
      showFailToast(res.description || '解散失败');
    }
  } catch (e) {
    showFailToast('解散失败，请稍后重试');
  }
};
</script>

<style scoped>
.team-card-list {
  padding-top: 8px;
}
.meta {
  font-size: 12px;
  color: #969799;
  line-height: 1.8;
}
.team-card-list :deep(.van-image__img) {
  object-fit: cover;
}
</style>
