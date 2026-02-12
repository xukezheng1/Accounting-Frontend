<script>
export default {
  onLaunch() {
    console.log('好记账启动')
  }
}
</script>

<style lang="scss">
@import './uni.scss';

page {
  background: linear-gradient(180deg, #f7f9fc 0%, #f2f5f9 100%);
  color: #1e2a38;
  font-family: 'PingFang SC', 'HarmonyOS Sans SC', sans-serif;
}

.safe-page {
  min-height: 100vh;
  padding: 24rpx;
  padding-bottom: 170rpx;
}

.glass-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 28rpx;
  box-shadow: 0 12rpx 36rpx rgba(28, 61, 109, 0.08);
  backdrop-filter: blur(8px);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.fade-in {
  animation: fadeInMove 240ms ease-out;
}

@keyframes fadeInMove {
  from {
    opacity: 0;
    transform: translateY(12rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
