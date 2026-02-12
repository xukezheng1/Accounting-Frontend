<template>
  <view class="safe-page fade-in">
    <AppNavbar title="记一笔" :show-back="true" />

    <view class="glass-card panel">
      <u-tabs :list="directions" keyName="name" @click="onDirectionChange" />
      <u-input v-model="form.amount" type="number" placeholder="金额" border="surround" customStyle="margin-top: 16rpx" />

      <view class="label">分类</view>
      <u-radio-group v-model="form.categoryId" placement="row">
        <u-radio v-for="c in categoryList" :key="c.id" :name="c.id" :label="c.name" />
      </u-radio-group>

      <view class="label">情绪</view>
      <u-radio-group v-model="form.emotionId" placement="row">
        <u-radio v-for="e in emotions" :key="e.id" :name="e.id" :label="e.name" />
      </u-radio-group>

      <u-input v-model="form.note" placeholder="备注（可选）" border="surround" customStyle="margin-top: 16rpx" />

      <view class="family-row" v-if="isFamily">
        <u-switch v-model="isSplit" activeColor="#4a90b8" />
        <text>家庭分摊</text>
      </view>

      <u-button type="primary" text="保存" customStyle="margin-top: 20rpx" @click="submit" />
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { api } from '@/api'
import { appStore, bootstrap } from '@/store/app'

const direction = ref('expense')
const categories = ref([])
const emotions = ref([])
const isSplit = ref(false)

const directions = [
  { name: '支出', value: 'expense' },
  { name: '收入', value: 'income' }
]

const form = reactive({
  amount: '',
  categoryId: null,
  emotionId: null,
  note: ''
})

const isFamily = computed(() => appStore.currentBook?.bookType === 'family')
const categoryList = computed(() => categories.value.filter((item) => item.type === direction.value))

function onDirectionChange(item) {
  direction.value = item.value
  form.categoryId = null
}

async function init() {
  await bootstrap()
  if (!appStore.currentBook) return
  const data = await api.getMetaOptions(appStore.currentBook.id)
  categories.value = data.categories || []
  emotions.value = data.emotions || []
}

async function submit() {
  if (!form.amount || !form.categoryId) {
    uni.showToast({ title: '金额和分类必填', icon: 'none' })
    return
  }
  const userId = appStore.user?.id
  const bookId = appStore.currentBook?.id
  if (!userId || !bookId) {
    uni.showToast({ title: '用户/账本缺失', icon: 'none' })
    return
  }

  await api.createTransaction({
    bookId,
    recordUserId: userId,
    ownerUserId: userId,
    direction: direction.value,
    amount: Number(form.amount),
    categoryId: Number(form.categoryId),
    emotionId: form.emotionId ? Number(form.emotionId) : undefined,
    note: form.note || undefined
  })

  uni.showToast({ title: '记账成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 350)
}

init().catch((err) => uni.showToast({ title: err.message, icon: 'none' }))
</script>

<style scoped lang="scss">
.panel {
  padding: 24rpx;
}

.label {
  margin-top: 18rpx;
  margin-bottom: 10rpx;
  color: #69788d;
  font-size: 24rpx;
}

.family-row {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #667589;
}
</style>
