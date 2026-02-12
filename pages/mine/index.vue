<template>
  <view class="safe-page fade-in">
    <AppNavbar title="我的" />

    <view class="glass-card profile">
      <u-avatar :text="avatarText" size="54" bg-color="#4a90b8" />
      <view class="info">
        <view class="name">{{ appStore.user?.nickname || '用户' }}</view>
        <view class="id">ID：{{ appStore.user?.id || '-' }}</view>
      </view>
    </view>

    <view class="glass-card menu">
      <view class="row" v-for="item in menus" :key="item" @click="tap(item)">
        <text>{{ item }}</text>
        <u-icon name="arrow-right" color="#8894a6" size="16" />
      </view>
    </view>

    <AppTabbar current="/pages/mine/index" />
  </view>
</template>

<script setup>
import { computed } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTabbar from '@/components/AppTabbar.vue'
import { appStore, bootstrap } from '@/store/app'

const menus = ['数据备份', 'AI报告历史', '订阅管理', '导出Excel']

const avatarText = computed(() => {
  const name = appStore.user?.nickname || '记账'
  return name.slice(0, 1)
})

function tap(name) {
  uni.showToast({ title: `${name} 开发中`, icon: 'none' })
}

bootstrap()
</script>

<style scoped lang="scss">
.profile {
  display: flex;
  align-items: center;
  padding: 22rpx;
}

.info {
  margin-left: 14rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
}

.id {
  margin-top: 6rpx;
  color: #7a889b;
  font-size: 24rpx;
}

.menu {
  margin-top: 16rpx;
  padding: 0 20rpx;
}

.row {
  height: 92rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ecf0f5;
}

.row:last-child {
  border-bottom: none;
}
</style>
