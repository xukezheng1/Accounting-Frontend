import { Text, View } from '@tarojs/components';
import './index.scss';

export default function SectionBlock({ title, extra, children }) {
  return (
    <View className='sectionBlock'>
      <View className='sectionHead'>
        <Text className='sectionTitle'>{title}</Text>
        {extra ? <View>{extra}</View> : null}
      </View>
      <View className='sectionBody'>{children}</View>
    </View>
  );
}


