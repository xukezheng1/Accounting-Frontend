import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';

export default function Index() {
  const onClick = () => {
    Taro.showToast({
      title: 'Taro 初始化完成',
      icon: 'none'
    });
  };

  return (
    <View className='page'>
      <Text className='title'>好记账 · Taro 前端已重建</Text>
      <Button className='btn' type='primary' onClick={onClick}>
        点击测试
      </Button>
    </View>
  );
}
