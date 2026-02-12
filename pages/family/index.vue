<template>
  <view class="safe-page fade-in">
    <AppNavbar title="家庭" right-text="分摊" @right-click="goSplit" />

    <view class="glass-card head">
      <view class="name">{{ appStore.currentBook?.name || '家庭账本' }}</view>
      <view class="code">邀请码：{{ appStore.currentBook?.inviteCode || '-' }}</view>
      <u-button type="primary" text="新增成员" size="small" customStyle="margin-top: 14rpx; width: 220rpx" @click="addMember" />
    </view>

    <view class="section-title">成员与权限</view>
    <view class="glass-card row" v-for="m in members" :key="m.id">
      <view>
        <view class="n">{{ m.user?.nickname || '成员' }}</view>
        <view class="r">{{ roleText(m.role) }}</view>
      </view>
      <u-tag :text="roleText(m.role)" plain />
    </view>

    <AppTabbar current="/pages/family/index" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTabbar from '@/components/AppTabbar.vue'
import { appStore, bootstrap } from '@/store/app'
import { api } from '@/api'
import { roleText } from '@/utils/format'

const members = ref([])

async function init() {
  await bootstrap()
  const book = appStore.currentBook
  if (!book?.id || book.bookType !== 'family') {
    members.value = []
    return
  }
  members.value = await api.getBookMembers(book.id)
}

async function addMember() {
  const bookId = appStore.currentBook?.id
  if (!bookId) return

  await api.addBookMember(bookId, {
    nickname: `成员${Date.now().toString().slice(-4)}`,
    role: 'member'
  })

  await init()
  uni.showToast({ title: '已添加成员', icon: 'none' })
}

function goSplit() {
  uni.navigateTo({ url: '/pages/split-calc/index' })
}

init().catch((err) => uni.showToast({ title: err.message, icon: 'none' }))
</script>

<style scoped lang="scss">
.head {
  padding: 22rpx;
  margin-bottom: 16rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
}

.code {
  margin-top: 8rpx;
  color: #768396;
}

.row {
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.n {
  font-size: 28rpx;
  font-weight: 600;
}

.r {
  margin-top: 6rpx;
  color: #758397;
  font-size: 24rpx;
}
</style>
