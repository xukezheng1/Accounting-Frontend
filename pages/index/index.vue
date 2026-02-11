<template>
  <view class="container">
    <u--text type="primary" size="20" text="好记账 · UniApp 初始化完成" />

    <view class="card">
      <u-button type="primary" text="检查后端健康状态" @click="onCheckHealth" />
      <text class="result">{{ healthText }}</text>
    </view>

    <view class="card">
      <u--textarea v-model="prompt" placeholder="输入一句记账问题，调用千问" />
      <u-button type="success" text="调用千问" @click="onAskAi" />
      <text class="result">{{ aiText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { askAi, healthCheck } from '../../api';

const healthText = ref('');
const prompt = ref('我这个月外卖有点多，给我3条建议');
const aiText = ref('');

async function onCheckHealth() {
  try {
    const res = await healthCheck();
    healthText.value = JSON.stringify(res);
  } catch (error) {
    healthText.value = `请求失败: ${error.errMsg || error.message}`;
  }
}

async function onAskAi() {
  try {
    const res = await askAi(prompt.value);
    aiText.value = res?.data?.reply || JSON.stringify(res);
  } catch (error) {
    aiText.value = `调用失败: ${error.errMsg || error.message}`;
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 28rpx;

  .card {
    margin-top: 24rpx;
    padding: 24rpx;
    border-radius: 16rpx;
    background: #fff;
  }

  .result {
    display: block;
    margin-top: 16rpx;
    color: #333;
    word-break: break-all;
  }
}
</style>
