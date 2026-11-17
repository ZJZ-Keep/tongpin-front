<template>
  <div class="team-page">
    <van-search
      v-model="searchText"
      placeholder="搜索队伍名称 / 描述"
      show-action
      @update:model-value="onInput"
      @search="onSearch"
      @clear="onSearch"
      @cancel="onCancel"
    />
    <van-tabs v-model:active="active" @change="onTabChange">
      <van-tab title="公开" name="public" />
      <van-tab title="加密（需密码）" name="secret" />
    </van-tabs>
    <team-card-list :team-list="teamList" @refresh="loadTeam" />
    <van-loading v-if="loading" class="loading-center" />
    <van-empty v-else-if="teamList.length < 1" description="暂无队伍" />
    <div class="fab">
      <van-button type="primary" round icon="plus" @click="toAddPage">创建队伍</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import TeamCardList from '../components/TeamCardList.vue';
import type { TeamType } from '../models/team';

const router = useRouter();
const searchText = ref('');
const active = ref('public');
const teamList = ref<TeamType[]>([]);
const loading = ref(false);

const statusOfTab = (name: string) => (name === 'secret' ? 2 : 0);

// 请求序号，避免输入过快时旧请求覆盖新结果
let requestSeq = 0;

const loadTeam = async () => {
  const seq = ++requestSeq;
  loading.value = true;
  try {
    const res = await myAxios.get('/team/list', {
      params: {
        search: searchText.value.trim(),
        status: statusOfTab(active.value),
        pageNum: 1,
      },
    });
    if (seq !== requestSeq) {
      return;
    }
    if (res.code === 0) {
      teamList.value = res.data || [];
    } else {
      teamList.value = [];
      showFailToast(res.description || '加载队伍失败');
    }
  } catch (e) {
    if (seq !== requestSeq) {
      return;
    }
    teamList.value = [];
    showFailToast('加载队伍失败，请刷新重试');
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
    }
  }
};

// 输入时实时搜索（防抖 300ms）
let inputTimer: number | null = null;
const onInput = () => {
  if (inputTimer) {
    clearTimeout(inputTimer);
  }
  inputTimer = window.setTimeout(() => {
    inputTimer = null;
    loadTeam();
  }, 300);
};

const onTabChange = (name: string | number) => {
  active.value = String(name);
  loadTeam();
};

const onSearch = () => loadTeam();

const onCancel = () => {
  searchText.value = '';
  loadTeam();
};

const toAddPage = () => router.push('/team/add');

onMounted(() => loadTeam());

onBeforeUnmount(() => {
  if (inputTimer) {
    clearTimeout(inputTimer);
    inputTimer = null;
  }
});
</script>

<style scoped>
.team-page {
  padding-bottom: 80px;
}
.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}
.fab {
  position: fixed;
  right: 16px;
  bottom: 70px;
  z-index: 10;
}
</style>
