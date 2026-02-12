<template>
  <view class="safe-page fade-in">
    <AppNavbar title="AI分析" />

    <view class="glass-card card">
      <view class="section-title">月度预测</view>
      <view class="kv"><text>当前支出</text><text>¥{{ money(pred.currentExpense) }}</text></view>
      <view class="kv"><text>预测支出</text><text>¥{{ money(pred.predictedExpense) }}</text></view>
      <view class="kv"><text>预测结余</text><text>¥{{ money(pred.predictedBalance) }}</text></view>
      <view class="tag" :class="pred.overBudget ? 'warn' : 'ok'">
        {{ pred.overBudget ? '预计超预算' : '预算范围内' }}
      </view>
    </view>

    <view class="section-title">异常提醒</view>
    <view class="glass-card ai" v-for="it in insights" :key="it.id">
      <view class="t">{{ it.title }}</view>
      <view class="c">{{ it.content }}</view>
    </view>

    <view class="glass-card card">
      <view class="section-title">买前问AI</view>
      <u-input v-model="prompt" placeholder="输入购买计划，例如：5000元相机" border="surround" />
      <u-button type="primary" text="生成建议" customStyle="margin-top: 14rpx" @click="ask" />
      <view class="answer" v-if="reply">{{ reply }}</view>
    </view>

    <AppTabbar current="/pages/ai/index" />
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import AppTabbar from '@/components/AppTabbar.vue'
import { api } from '@/api'
import { appStore, bootstrap } from '@/store/app'
import { DEFAULT_BUDGET } from '@/utils/config'
import { money } from '@/utils/format'

const pred = reactive({ currentExpense: 0, predictedExpense: 0, predictedBalance: 0, overBudget: false })
const insights = ref([])
const prompt = ref('')
const reply = ref('')

async function init() {
  await bootstrap()
  const bookId = appStore.currentBook?.id
  if (!bookId) return

  const [p, list] = await Promise.all([
    api.getPrediction(bookId, DEFAULT_BUDGET),
    api.getInsights(bookId, 6)
  ])

  Object.assign(pred, p)
  insights.value = list || []
}

async function ask() {
  if (!prompt.value) return
  const data = await api.askAI(prompt.value)
  reply.value = data.reply
}

init().catch((err) => uni.showToast({ title: err.message, icon: 'none' }))
</script>

<style scoped lang="scss">
.card {
  padding: 22rpx;
  margin-bottom: 16rpx;
}

.kv {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
  color: #5f7085;
}

.tag {
  margin-top: 10rpx;
  display: inline-block;
  padding: 8rpx 14rpx;
  border-radius: 999px;
  font-size: 22rpx;
}

.ok {
  background: #edf7f1;
  color: #6cae86;
}

.warn {
  background: #fbf2ec;
  color: #d9a56d;
}

.ai {
  padding: 20rpx;
  margin-bottom: 12rpx;
}

.t {
  font-size: 28rpx;
  font-weight: 600;
}

.c {
  margin-top: 8rpx;
  color: #6e7b90;
}

.answer {
  margin-top: 14rpx;
  color: #3e5874;
  line-height: 1.6;
}
</style>
