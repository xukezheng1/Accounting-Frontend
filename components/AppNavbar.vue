<template>
  <view class="nav-wrap">
    <view class="status" :style="{ height: `${statusBar}px` }" />
    <view class="nav glass-card">
      <view class="left" @click="back">
        <u-icon v-if="showBack" name="arrow-left" size="18" color="#617187" />
      </view>
      <text class="title">{{ title }}</text>
      <view class="right" @click="$emit('right-click')">{{ rightText }}</view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  showBack: { type: Boolean, default: false },
  rightText: { type: String, default: '' }
})

defineEmits(['right-click'])

const statusBar = computed(() => {
  const info = uni.getSystemInfoSync()
  return info.statusBarHeight || 20
})

function back() {
  if (!props.showBack) return
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.nav-wrap {
  margin-bottom: 20rpx;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 86rpx;
  padding: 0 24rpx;
}

.left,
.right {
  width: 120rpx;
  font-size: 24rpx;
  color: #7a879a;
}

.right {
  text-align: right;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2d3d;
}
</style>
