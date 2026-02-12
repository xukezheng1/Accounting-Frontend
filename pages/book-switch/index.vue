<template>
  <view class="safe-page fade-in">
    <AppNavbar title="账本切换" :show-back="true" right-text="新建" @right-click="createFamilyBook" />

    <view class="glass-card row" v-for="book in appStore.books" :key="book.id" @click="pick(book.id)">
      <view>
        <view class="name">{{ book.name }}</view>
        <view class="meta">{{ book.bookType === 'family' ? '家庭账本' : '个人账本' }} · {{ book.role }}</view>
      </view>
      <u-icon name="checkmark-circle" :color="book.id === appStore.currentBook?.id ? '#4a90b8' : '#d3dce8'" size="20" />
    </view>

    <view class="glass-card join">
      <u-input v-model="inviteCode" placeholder="输入邀请码加入家庭账本" border="surround" />
      <u-button type="primary" text="加入" customStyle="margin-top: 12rpx" @click="join" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { api } from '@/api'
import { appStore, bootstrap, setCurrentBook } from '@/store/app'

const inviteCode = ref('')

async function init() {
  await bootstrap(true)
}

async function createFamilyBook() {
  if (!appStore.user?.id) return
  const name = `家庭账本${Date.now().toString().slice(-4)}`
  await api.createBook({ userId: appStore.user.id, name, bookType: 'family' })
  await init()
  uni.showToast({ title: '创建成功', icon: 'none' })
}

function pick(id) {
  setCurrentBook(id)
  uni.showToast({ title: '已切换账本', icon: 'none' })
  setTimeout(() => uni.navigateBack(), 220)
}

async function join() {
  if (!inviteCode.value) return
  await api.joinBook({ inviteCode: inviteCode.value, userId: appStore.user.id })
  inviteCode.value = ''
  await init()
  uni.showToast({ title: '已加入家庭账本', icon: 'none' })
}

init().catch((err) => uni.showToast({ title: err.message, icon: 'none' }))
</script>

<style scoped lang="scss">
.row {
  padding: 20rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
}

.meta {
  margin-top: 6rpx;
  color: #768497;
  font-size: 24rpx;
}

.join {
  margin-top: 20rpx;
  padding: 20rpx;
}
</style>
