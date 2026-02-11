import { Text, View } from '@tarojs/components';
import './index.scss';

export default function 加载态({ text }) {
  return (
    <View className='loadingWrap'>
      <View className='dotGroup'>
        <View className='dot' />
        <View className='dot' />
        <View className='dot' />
      </View>
      <Text className='loadingText'>{text || '加载中...'}</Text>
    </View>
  );
}


