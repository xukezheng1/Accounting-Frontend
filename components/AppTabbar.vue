<template>
  <view class="bar-wrap">
    <view class="bar glass-card">
      <view v-for="item in tabs" :key="item.path" class="tab" @click="go(item.path)">
        <u-icon :name="item.icon" size="18" :color="isActive(item.path) ? '#4a90b8' : '#8a96a8'" />
        <text :class="['name', isActive(item.path) ? 'active' : '']">{{ item.name }}</text>
      </view>
      <view class="fab" @click="go('/pages/bookkeeping/index')">
        <u-icon name="plus" color="#fff" size="22" />
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  current: { type: String, default: '/pages/home/index' }
})

const tabs = [
  { name: '首页', path: '/pages/home/index', icon: 'home' },
  { name: 'AI', path: '/pages/ai/index', icon: 'chat' },
  { name: '家庭', path: '/pages/family/index', icon: 'account' },
  { name: '目标', path: '/pages/goals/index', icon: 'grid' },
  { name: '我的', path: '/pages/mine/index', icon: 'setting' }
]

function isActive(path) {
  return props.current === path
}

function go(path) {
  if (path === props.current) return
  uni.redirectTo({ url: path })
}
</script>

<style scoped lang="scss">
.bar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 16rpx;
  padding: 0 24rpx;
  z-index: 80;
}

.bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 104rpx;
  padding: 0 24rpx;
  border-radius: 52rpx;
}

.tab {
  width: 20%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.name {
  margin-top: 4rpx;
  color: #8a96a8;
  font-size: 20rpx;
}

.active {
  color: #4a90b8;
  font-weight: 600;
}

.fab {
  position: absolute;
  left: 50%;
  top: -24rpx;
  transform: translateX(-50%);
  width: 84rpx;
  height: 84rpx;
  border-radius: 42rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(140deg, #5ea8c7 0%, #3e87ad 100%);
  box-shadow: 0 10rpx 24rpx rgba(62, 135, 173, 0.32);
}
</style>
