import { useCallback, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import { getGoals } from '../../../services/goal';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import './index.scss';

export default function GoalProgressPage() {
  const [goals, setGoals] = useState(getGoals());

  const loadGoals = useCallback(async () => {
    setGoals(getGoals());
  }, []);

  usePageRefresh(loadGoals, [EVENTS.GOAL_UPDATED]);

  const overall = useMemo(() => {
    if (goals.length === 0) return 0;
    const ratio = goals.reduce((sum, item) => {
      if (!item.target) return sum;
      return sum + Math.min(1, Number(item.current || 0) / Number(item.target));
    }, 0);
    return Math.round((ratio / goals.length) * 100);
  }, [goals]);

  return (
    <View className='ios-page'>
      <View className='ios-card'>
        <Text className='ringTitle'>总体完成度</Text>
        <View className='ringWrap'>
          <View className='ringOuter'>
            <View className='ringInner'>
              <Text className='ringValue'>{overall}%</Text>
            </View>
          </View>
        </View>
      </View>

      {goals.length === 0 ? <View className='ios-card'><Text className='ios-empty'>暂无目标</Text></View> : null}

      {goals.map((item) => {
        const ratio = item.target ? Math.min(1, Number(item.current || 0) / Number(item.target)) : 0;
        const percent = Math.round(ratio * 100);
        return (
          <View key={item.id} className='ios-card'>
            <Text className='goalName'>{item.title}</Text>
            <View className='barTrack'>
              <View className='barFill' style={{ width: `${percent}%` }} />
            </View>
            <Text className='goalMeta'>￥{item.current} / ￥{item.target} · {percent}%</Text>
          </View>
        );
      })}
    </View>
  );
}


