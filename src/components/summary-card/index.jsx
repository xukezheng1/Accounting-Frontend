import { Text, View } from '@tarojs/components';
import './index.scss';

export default function SummaryCard({ title, value, hint, color }) {
  return (
    <View className='summaryCard'>
      <Text className='summaryCardTitle'>{title}</Text>
      <Text className='summaryCardValue' style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </Text>
      {hint ? <Text className='summaryCardHint'>{hint}</Text> : null}
    </View>
  );
}


