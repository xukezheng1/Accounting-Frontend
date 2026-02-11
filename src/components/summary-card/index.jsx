import { Text, View } from '@tarojs/components';
import './index.scss';

export default function SummaryCard({ title, value, hint, color }) {
  return (
    <View className='summaryCard'>
      <Text className='summaryCardTitle'>{title}</Text>
      <Text className='summaryCardValue' style={{ color: color || '#1c1c1e' }}>
        {value}
      </Text>
      {hint ? <Text className='summaryCardHint'>{hint}</Text> : null}
    </View>
  );
}


