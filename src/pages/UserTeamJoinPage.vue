<template>
  <div class="team-page">
    <van-search
      v-model="searchText"
      placeholder="搜索我加入的队伍"
      @search="onSearch"
      @clear="onSearch"
    />
    <team-card-list :team-list="teamList" @refresh="refreshList" />
    <van-loading v-if="loading" class="loading-center" />
    <van-empty v-else-if="teamList.length < 1" description="还没有加入任何队伍" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { showFailToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import TeamCardList from '../components/TeamCardList.vue';
import type { TeamType } from '../models/team';

const searchText = ref('');
const teamList = ref<TeamType[]>([]);
const loading = ref(false);

const listTeam = async (val = '') => {
  loading.value = true;
  try {
    const res = await myAxios.get('/team/list/my/join', {
      params: { search: val, pageNum: 1 },
    });
    if (res.code === 0) {
      teamList.value = res.data || [];
    } else {
      showFailToast(res.description || '加载队伍失败');
    }
  } catch (e) {
    showFailToast('加载队伍失败，请刷新重试');
  } finally {
    loading.value = false;
  }
};

const onSearch = (val: string) => listTeam(val);

const refreshList = () => listTeam(searchText.value);

onMounted(() => listTeam());
</script>

<style scoped>
.team-page {
  padding-bottom: 24px;
}
.loading-center {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}
</style>
