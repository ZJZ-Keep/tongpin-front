<template>
  <div class="teamPage">
    <van-cell center title="心动模式">
      <template #right-icon>
        <van-switch v-model="isDoMatch" />
      </template>
    </van-cell>
    <user-card-list :user-list="userList" :loading="loading"/>
  </div>
</template>
<script setup lang="ts">
import UserCardList from "../components/UserCardList.vue";
import { ref, watchEffect} from "vue";
import myAxios from "../plugis/myAxios.ts";
import {showFailToast} from "vant";

const userList = ref([])
const loading = ref(false)
const isDoMatch = ref(false)

const loadUsers =async ()=>{
  loading.value = true;
  let res;
  if (isDoMatch.value){
     res = await myAxios.get('/user/match',{
      params:{
        num:10
      }
    });
    console.log(res);
    console.log(res.code);
    if (res.code === 0) {
      userList.value = res.data;
    }else {
      showFailToast('请求失败');
    }
  }else {
    res = await myAxios.get('/user/recommend',{
      params:{
        pageSize:20,
        pageNum:1
      }
    });
    console.log(res);
    console.log(res.code);
    if (res.code === 0) {
      userList.value = res.data.records;
    }else {
      showFailToast('请求失败');
    }
  }
  loading.value = false;
}

watchEffect(loadUsers);
</script>

<style scoped>

</style>