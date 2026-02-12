<template>
  <view class="safe-page fade-in">
    <AppNavbar title="家庭" right-text="分摊" @right-click="goSplit" />

    <view class="glass-card head">
      <view class="name">{{ appStore.currentBook?.name || '家庭账本' }}</view>
      <view class="code">邀请码：{{ appStore.currentBook?.inviteCode || '-' }}</view>
      <view class="head-actions">
        <u-button type="primary" text="新增成员" size="small" customStyle="width: 220rpx" @click="addMember" />
        <u-button text="复制邀请码" size="small" customStyle="margin-top: 10rpx; width: 220rpx" @click="copyInviteCode" />
      </view>
    </view>

    <view class="section-title">成员与权限</view>
    <view class="glass-card row" v-for="m in members" :key="m.id" @click="openRolePanel(m)">
      <view>
        <view class="n">{{ m.user?.nickname || '成员' }}</view>
        <view class="r">{{ roleText(m.role) }}</view>
      </view>
      <view class="role-action">
        <u-tag :text="roleText(m.role)" plain />
        <u-icon name="arrow-right" size="12" color="#95a1b2" />
      </view>
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

function copyInviteCode() {
  const code = appStore.currentBook?.inviteCode
  if (!code) return
  uni.setClipboardData({
    data: code,
    success: () => uni.showToast({ title: '邀请码已复制', icon: 'none' })
  })
}

function openRolePanel(member) {
  const items = ['管理员', '普通成员', '只读成员']
  uni.showActionSheet({
    itemList: items,
    success: async ({ tapIndex }) => {
      const roles = ['admin', 'member', 'read']
      const nextRole = roles[tapIndex]
      if (nextRole === member.role) return
      try {
        await api.updateMemberRole(appStore.currentBook.id, member.id, nextRole)
        await init()
        uni.showToast({ title: '权限已更新', icon: 'none' })
      } catch (err) {
        uni.showToast({ title: err.message, icon: 'none' })
      }
    }
  })
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

.head-actions {
  margin-top: 14rpx;
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

.role-action {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
</style>
