<template>
  <view class="safe-page fade-in">
    <AppNavbar title="目标" />

    <view class="glass-card card">
      <view class="section-title">个人目标</view>
      <view class="goal">旅游基金</view>
      <u-line-progress :percentage="62" activeColor="#6cae86" height="14" />
      <view class="meta">13,000 / 21,000</view>
    </view>

    <view class="glass-card card">
      <view class="section-title">家庭目标</view>
      <view class="goal">孩子教育金</view>
      <u-line-progress :percentage="41" activeColor="#4a90b8" height="14" />
      <view class="meta">49,000 / 120,000</view>
    </view>

    <view class="glass-card card">
      <view class="section-title">AI规划建议</view>
      <view class="desc">如果将本月餐饮预算下调 15%，预计可以提前 1.5 个月完成旅游基金目标。</view>
    </view>

    <AppTabbar current="/pages/goals/index" />
  </view>
</template>

<script setup>
import AppNavbar from '@/components/AppNavbar.vue'
import AppTabbar from '@/components/AppTabbar.vue'
</script>

<style scoped lang="scss">
.card {
  padding: 22rpx;
  margin-bottom: 14rpx;
}

.goal {
  margin-bottom: 10rpx;
  font-size: 30rpx;
  font-weight: 600;
}

.meta {
  margin-top: 10rpx;
  color: #768598;
}

.desc {
  color: #5f7084;
  line-height: 1.6;
}
</style>
