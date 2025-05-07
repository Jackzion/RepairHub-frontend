<template>
  <el-config-provider :locale="zhCn">
    <template v-if="!isAuthPage">
      <main-layout>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main-layout>
    </template>
    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
import MainLayout from './components/MainLayout.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const isAuthPage = computed(() => {
  return route.path === '/login' || route.path === '/register';
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>