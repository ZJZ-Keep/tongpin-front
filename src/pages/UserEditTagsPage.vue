<template>
  <div class="tags-page">
    <van-field
      v-model="newTag"
      label="新标签"
      placeholder="输入标签后点右侧添加"
      maxlength="10"
      @keyup.enter="addTag"
    >
      <template #button>
        <van-button size="small" type="primary" @click="addTag">添加</van-button>
      </template>
    </van-field>

    <van-divider content-position="left">我的标签（最多 10 个）</van-divider>
    <div class="tag-wrap">
      <van-tag
        v-for="tag in selectedTags"
        :key="tag"
        closeable
        size="medium"
        type="primary"
        @close="removeTag(tag)"
      >
        {{ tag }}
      </van-tag>
      <span v-if="selectedTags.length === 0" class="empty-tip">还没有标签，添加一个吧</span>
    </div>

    <van-divider content-position="left">推荐标签（点击添加）</van-divider>
    <div class="tag-wrap">
      <van-tag
        v-for="tag in recommendTags"
        :key="tag"
        size="medium"
        plain
        type="primary"
        @click="addTagText(tag)"
      >
        {{ tag }}
      </van-tag>
    </div>

    <div class="save-bar">
      <van-button round block type="primary" :loading="saving" @click="onSubmit">
        保存
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { showSuccessToast, showFailToast, showToast } from 'vant';
import myAxios from '../plugis/myAxios.ts';
import { getCurrentUser } from '../services/user.ts';
import { parseTags, stringifyTags } from '../utils/tags.ts';

const router = useRouter();

const selectedTags = ref<string[]>([]);
const newTag = ref('');
const saving = ref(false);

const recommendTags = [
  'Java', 'Python', 'C++', '前端', '后端', '算法',
  '篮球', '音乐', '旅行', '摄影', '游戏', '阅读',
  '考研', '健身', '电影', '美食',
];

const addTagText = (text: string) => {
  const tag = (text || '').trim();
  if (!tag) {
    return;
  }
  if (selectedTags.value.includes(tag)) {
    showToast('标签已存在');
    return;
  }
  if (selectedTags.value.length >= 10) {
    showToast('最多添加 10 个标签');
    return;
  }
  selectedTags.value.push(tag);
};

const addTag = () => {
  addTagText(newTag.value);
  newTag.value = '';
};

const removeTag = (tag: string) => {
  selectedTags.value = selectedTags.value.filter((t) => t !== tag);
};

onMounted(async () => {
  const user = await getCurrentUser();
  if (user) {
    selectedTags.value = parseTags(user.tags);
  }
});

const onSubmit = async () => {
  if (saving.value) {
    return;
  }
  saving.value = true;
  try {
    const user = await getCurrentUser();
    if (!user) {
      showFailToast('请先登录');
      return;
    }
    const res = await myAxios.post('/user/update', {
      id: user.id,
      tags: stringifyTags(selectedTags.value),
    });
    if (res.code === 0) {
      showSuccessToast('保存成功');
      router.back();
    } else {
      showFailToast(res.description || '保存失败');
    }
  } catch (e) {
    showFailToast('保存失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.tags-page {
  padding-bottom: 24px;
}
.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 16px 12px;
}
.empty-tip {
  font-size: 13px;
  color: #969799;
}
.save-bar {
  margin: 24px 16px 0;
}
</style>
