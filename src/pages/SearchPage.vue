<template>
  <div class="search-page">
    <van-search
      v-model="nickname"
      show-action
      placeholder="请输入要搜索的昵称"
      @search="toSearchResult"
      @cancel="onCancel"
    />

    <van-divider content-position="left">已选标签</van-divider>
    <div class="selected-tags">
      <template v-if="activeId.length">
        <van-tag
          v-for="tag in activeId"
          :key="tag"
          closeable
          size="medium"
          type="primary"
          style="margin-right: 8px;"
          @close="removeTag(tag)"
        >
          {{ tag }}
        </van-tag>
      </template>
      <span v-else class="empty-tip">请选择标签</span>
    </div>

    <van-divider content-position="left">选择标签</van-divider>
    <van-tree-select
      v-model:active-id="activeId"
      v-model:main-active-index="activeIndex"
      :items="tagList"
      style="height: 380px;"
    />

    <div class="search-bar">
      <van-button block type="primary" @click="toSearchResult">搜索</van-button>
    </div>

    <!-- 选择“其他”后输入自定义标签 -->
    <van-dialog
      v-model:show="showOther"
      title="自定义标签"
      show-cancel-button
      @confirm="confirmOther"
      @cancel="cancelOther"
    >
      <van-field
        v-model="otherText"
        placeholder="输入你想要的标签（最多 10 字）"
        maxlength="10"
      />
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();

const nickname = ref('');
const activeId = ref<string[]>([]);
const activeIndex = ref(0);

const OTHER = '其他';

const tagList = ref([
  {
    text: '性别',
    children: [
      { text: '男', id: '男' },
      { text: '女', id: '女' },
    ],
  },
  {
    text: '年级',
    children: [
      { text: '大一', id: '大一' },
      { text: '大二', id: '大二' },
      { text: '大三', id: '大三' },
      { text: '大四', id: '大四' },
    ],
  },
  {
    // 「其他」与性别、年级同级，用于输入自定义标签
    text: '其他',
    children: [
      { text: '自定义标签', id: OTHER },
    ],
  },
]);

const showOther = ref(false);
const otherText = ref('');

// 选中“其他”时不当作标签，而是弹出输入框
watch(
  activeId,
  (val) => {
    if (val.includes(OTHER)) {
      activeId.value = val.filter((id) => id !== OTHER);
      otherText.value = '';
      showOther.value = true;
    }
  },
  { deep: true },
);

const confirmOther = () => {
  const tag = otherText.value.trim();
  if (tag && tag !== OTHER && !activeId.value.includes(tag)) {
    activeId.value = [...activeId.value, tag];
  }
  otherText.value = '';
  showOther.value = false;
};

const cancelOther = () => {
  otherText.value = '';
  showOther.value = false;
};

const removeTag = (tag: string) => {
  activeId.value = activeId.value.filter((item) => item !== tag);
};

const onCancel = () => {
  nickname.value = '';
};

const toSearchResult = () => {
  const keyword = nickname.value.trim();
  if (activeId.value.length === 0 && !keyword) {
    showToast('请选择标签或输入昵称');
    return;
  }
  const query: Record<string, any> = {};
  if (activeId.value.length > 0) {
    query.tags = activeId.value;
  }
  if (keyword) {
    query.username = keyword;
  }
  router.push({ path: '/search/searchResult', query });
};
</script>

<style scoped>
.search-page {
  /* 给底部固定的搜索按钮留出空间，避免遮住内容 */
  padding-bottom: 90px;
}
.selected-tags {
  padding: 4px 16px 8px;
  min-height: 24px;
}
.empty-tip {
  font-size: 13px;
  color: #969799;
}
.search-bar {
  position: fixed;
  left: 0;
  right: 0;
  /* 固定在底部 TabBar 之上 */
  bottom: 50px;
  z-index: 20;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}
</style>
