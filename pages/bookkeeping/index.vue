<template>
  <view class="safe-page fade-in">
    <AppNavbar title="记一笔" :show-back="true" />

    <view class="glass-card panel">
      <u-tabs :list="directions" keyName="name" @click="onDirectionChange" />
      <u-input v-model="form.amount" type="number" placeholder="金额" border="surround" customStyle="margin-top: 16rpx" />

      <view class="label">分类</view>
      <view class="category-grid">
        <view
          v-for="c in categoryList"
          :key="c.id"
          :class="['category-item', Number(form.categoryId) === Number(c.id) ? 'category-item-active' : '']"
          @click="form.categoryId = c.id"
        >
          <u-icon :name="c.icon || 'grid'" size="16" :color="Number(form.categoryId) === Number(c.id) ? '#4a90b8' : '#748397'" />
          <text>{{ c.name }}</text>
        </view>
      </view>

      <view class="label">情绪</view>
      <u-radio-group v-model="form.emotionId" placement="row">
        <u-radio v-for="e in emotions" :key="e.id" :name="e.id" :label="e.name" />
      </u-radio-group>

      <view v-if="isFamily" class="label">成员归属</view>
      <u-picker
        v-if="isFamily"
        :show="showOwnerPicker"
        keyName="text"
        :columns="[ownerColumns]"
        @confirm="onOwnerPick"
        @close="showOwnerPicker = false"
      />
      <view v-if="isFamily" class="owner-select" @click="showOwnerPicker = true">
        <text>{{ ownerName || '请选择成员归属' }}</text>
        <u-icon name="arrow-down" size="14" color="#8a96a8" />
      </view>

      <u-input v-model="form.tags" placeholder="标签（逗号分隔）" border="surround" customStyle="margin-top: 16rpx" />
      <u-input v-model="form.note" placeholder="备注（可选）" border="surround" customStyle="margin-top: 16rpx" />

      <view class="family-row" v-if="isFamily">
        <u-switch v-model="isSplit" activeColor="#4a90b8" />
        <text>家庭分摊</text>
      </view>

      <u-button type="primary" text="保存" customStyle="margin-top: 20rpx" @click="submit" />
    </view>

    <view class="label list-title">最近记录</view>
    <view class="glass-card tx-panel">
      <view v-if="!transactions.length" class="empty">暂无记录</view>
      <view v-for="item in transactions" :key="item.id" class="tx-row">
        <view>
          <view class="tx-name">{{ item.category?.name || '未分类' }} · {{ item.ownerUser?.nickname || '-' }}</view>
          <view class="tx-meta">{{ shortTime(item.occurredAt) }}</view>
        </view>
        <view :class="['tx-amount', item.direction === 'income' ? 'income' : 'expense']">
          {{ item.direction === 'income' ? '+' : '-' }}{{ Number(item.amount).toFixed(2) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import AppNavbar from '@/components/AppNavbar.vue'
import { api } from '@/api'
import { appStore, bootstrap } from '@/store/app'
import { shortTime } from '@/utils/format'

const direction = ref('expense')
const categories = ref([])
const emotions = ref([])
const isSplit = ref(false)
const members = ref([])
const showOwnerPicker = ref(false)
const transactions = ref([])

const directions = [
  { name: '支出', value: 'expense' },
  { name: '收入', value: 'income' }
]

const form = reactive({
  amount: '',
  categoryId: null,
  ownerUserId: null,
  emotionId: null,
  tags: '',
  note: ''
})

const isFamily = computed(() => appStore.currentBook?.bookType === 'family')
const categoryList = computed(() => categories.value.filter((item) => item.type === direction.value))
const ownerColumns = computed(() => members.value.map((m) => ({ text: m.user?.nickname || '成员', value: m.user?.id })))
const ownerName = computed(() => {
  const target = members.value.find((m) => Number(m.user?.id) === Number(form.ownerUserId))
  return target?.user?.nickname || ''
})

function onDirectionChange(item) {
  direction.value = item.value
  form.categoryId = null
}

async function init() {
  await bootstrap()
  if (!appStore.currentBook) return
  const bookId = appStore.currentBook.id
  const [data, tx] = await Promise.all([api.getMetaOptions(bookId), api.getTransactions(bookId, 8)])
  categories.value = data.categories || []
  emotions.value = data.emotions || []
  transactions.value = tx || []
  if (isFamily.value) {
    members.value = await api.getBookMembers(bookId)
    form.ownerUserId = members.value[0]?.user?.id || null
  }
}

function onOwnerPick(e) {
  const item = e.value?.[0]
  form.ownerUserId = item?.value || null
  showOwnerPicker.value = false
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
  if (isFamily.value && !form.ownerUserId) {
    uni.showToast({ title: '请选择成员归属', icon: 'none' })
    return
  }

  await api.createTransaction({
    bookId,
    recordUserId: userId,
    ownerUserId: isFamily.value ? Number(form.ownerUserId) : userId,
    direction: direction.value,
    amount: Number(form.amount),
    categoryId: Number(form.categoryId),
    emotionId: form.emotionId ? Number(form.emotionId) : undefined,
    note: [form.note, form.tags ? `#${form.tags}` : ''].filter(Boolean).join(' ') || undefined
  })

  uni.showToast({ title: '记账成功', icon: 'success' })
  await init()
  form.amount = ''
  form.note = ''
  form.tags = ''
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

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10rpx;
}

.category-item {
  background: #f5f8fb;
  border-radius: 16rpx;
  min-height: 72rpx;
  padding: 10rpx 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  font-size: 22rpx;
  color: #6f7f93;
  border: 1px solid transparent;
}

.category-item-active {
  background: #eef6fb;
  color: #4a90b8;
  border-color: #bdd5e2;
}

.owner-select {
  height: 76rpx;
  border-radius: 14rpx;
  border: 1px solid #e6ebf1;
  background: #fff;
  padding: 0 18rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #5f7086;
}

.family-row {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  color: #667589;
}

.list-title {
  margin-top: 20rpx;
}

.tx-panel {
  padding: 10rpx 18rpx;
}

.tx-row {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #edf1f6;
}

.tx-row:last-child {
  border-bottom: none;
}

.tx-name {
  font-size: 26rpx;
  color: #2d3d50;
}

.tx-meta {
  margin-top: 4rpx;
  color: #7c899a;
  font-size: 22rpx;
}

.tx-amount {
  font-size: 30rpx;
  font-weight: 600;
}

.income {
  color: #6cae86;
}

.expense {
  color: #d96f7e;
}

.empty {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a95a6;
  font-size: 24rpx;
}
</style>
