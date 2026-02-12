<template>
  <view class="safe-page fade-in">
    <AppNavbar title="分摊计算" :show-back="true" />

    <view class="glass-card card">
      <u-input v-model="total" type="number" placeholder="请输入总金额" border="surround" />
      <view class="label">场景</view>
      <u-radio-group v-model="scene" placement="row">
        <u-radio name="聚餐" label="聚餐" />
        <u-radio name="房租" label="房租" />
        <u-radio name="旅游" label="旅游" />
      </u-radio-group>

      <view class="label">方式</view>
      <u-radio-group v-model="mode" placement="row">
        <u-radio name="equal" label="平均分摊" />
        <u-radio name="ratio" label="比例分摊" />
      </u-radio-group>

      <u-button type="primary" text="计算" customStyle="margin-top: 16rpx" @click="calc" />
      <view class="res" v-if="result">{{ result }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'

const total = ref('')
const scene = ref('聚餐')
const mode = ref('equal')
const result = ref('')

function calc() {
  const amount = Number(total.value)
  if (!amount) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }
  if (mode.value === 'equal') {
    result.value = `${scene.value}：4人均摊，每人 ¥${(amount / 4).toFixed(2)}`
  } else {
    result.value = `${scene.value}：4:3:2:1，分别 ¥${(amount * 0.4).toFixed(2)} / ¥${(amount * 0.3).toFixed(
      2
    )} / ¥${(amount * 0.2).toFixed(2)} / ¥${(amount * 0.1).toFixed(2)}`
  }
}
</script>

<style scoped lang="scss">
.card {
  padding: 22rpx;
}

.label {
  margin-top: 16rpx;
  margin-bottom: 8rpx;
  color: #6f7d91;
}

.res {
  margin-top: 16rpx;
  background: #eef5f8;
  color: #3f5975;
  border-radius: 16rpx;
  padding: 14rpx;
}
</style>
