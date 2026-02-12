<template>
  <view class="safe-page fade-in">
    <AppNavbar title="首页" right-text="账本" @right-click="goBookSwitch" />

    <view class="glass-card card">
      <view class="book-name">{{ appStore.currentBook?.name || '加载中...' }}</view>
      <view class="book-type">{{ appStore.currentBook?.bookType === 'family' ? '家庭账本' : '个人账本' }}</view>
      <view class="money">¥{{ money(overview.expense) }}</view>
      <view class="meta">{{ overview.month }} 支出</view>
      <view class="progress">
        <u-line-progress :percentage="budgetRate" activeColor="#4a90b8" height="14" />
      </view>
      <view class="meta">预算 {{ budgetRate }}%</view>
    </view>

    <view class="section-title">今日概览</view>
    <view class="grid">
      <view class="glass-card item">
        <text class="label">收入</text>
        <text class="value">¥{{ money(overview.income) }}</text>
      </view>
      <view class="glass-card item">
        <text class="label">结余</text>
        <text class="value">¥{{ money(overview.balance) }}</text>
      </view>
    </view>

    <view class="section-title">AI 提示</view>
    <view class="glass-card ai" v-for="item in insights" :key="item.id">
      <view class="ai-title">{{ item.title }}</view>
      <view class="ai-content">{{ item.content }}</view>
    </view>

    <AppTabbar current="/pages/home/index" :badge-map="{ '/pages/ai/index': insights.length }" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTabbar from '@/components/AppTabbar.vue'
import { appStore, bootstrap } from '@/store/app'
import { api } from '@/api'
import { DEFAULT_BUDGET } from '@/utils/config'
import { money } from '@/utils/format'

const overview = reactive({ month: '-', income: 0, expense: 0, balance: 0 })
const insights = ref([])

const budgetRate = computed(() => {
  const ratio = (Number(overview.expense) / DEFAULT_BUDGET) * 100
  return Math.min(100, Number.isFinite(ratio) ? Math.round(ratio) : 0)
})

async function loadData() {
  await bootstrap()
  if (!appStore.currentBook) return
  const bookId = appStore.currentBook.id

  const [ov, aiList] = await Promise.all([
    api.getOverview(bookId),
    api.getInsights(bookId, 3)
  ])
  Object.assign(overview, ov)
  insights.value = aiList || []
}

function goBookSwitch() {
  uni.navigateTo({ url: '/pages/book-switch/index' })
}

loadData().catch((err) => {
  uni.showToast({ title: err.message, icon: 'none' })
})
</script>

<style scoped lang="scss">
.card {
  padding: 24rpx;
}

.book-name {
  font-size: 34rpx;
  font-weight: 600;
}

.book-type,
.meta {
  color: #7b8898;
  margin-top: 6rpx;
  font-size: 24rpx;
}

.money {
  margin-top: 18rpx;
  font-size: 52rpx;
  font-weight: 700;
  color: #223142;
}

.progress {
  margin-top: 16rpx;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.item {
  padding: 20rpx;
}

.label {
  color: #7f8b9d;
  font-size: 24rpx;
}

.value {
  display: block;
  margin-top: 12rpx;
  font-size: 34rpx;
  font-weight: 600;
}

.ai {
  margin-bottom: 14rpx;
  padding: 20rpx;
}

.ai-title {
  font-size: 28rpx;
  font-weight: 600;
}

.ai-content {
  margin-top: 8rpx;
  color: #6d7b8e;
  line-height: 1.5;
}
</style>
