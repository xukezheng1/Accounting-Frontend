import { useCallback, useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import { addGoal, getGoals, toggleGoal, updateGoalAmount } from '../../../services/goal';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { useTheme } from '../../../services/use-theme';
import './index.scss';

export default function GoalPage() {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [goals, setGoals] = useState(getGoals());
  const { themeClass } = useTheme();

  const loadGoals = useCallback(async () => {
    setGoals(getGoals());
  }, []);

  usePageRefresh(loadGoals, [EVENTS.GOAL_UPDATED]);

  function submit() {
    if (!title.trim() || Number(target) <= 0) return;
    addGoal({ title: title.trim(), target: Number(target), current: Number(current || 0) });
    setTitle('');
    setTarget('');
    setCurrent('');
  }

  return (
    <View className={`ios-page ${themeClass}`}>
      <View className='ios-card'>
        <Input className='ios-input' placeholder='目标名称（例如：旅行基金）' value={title} onInput={(e) => setTitle(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='目标金额（元）' value={target} onInput={(e) => setTarget(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='当前金额（元）' value={current} onInput={(e) => setCurrent(e.detail.value)} />
        <Button type='primary' onClick={submit}>新增目标</Button>
      </View>

      {goals.length === 0 ? <View className='ios-card'><Text className='ios-empty'>暂无目标</Text></View> : null}

      {goals.map((item) => (
        <View key={item.id} className='ios-card'>
          <Text className='goalTitle'>{item.title}</Text>
          <Text className='goalSub'>进度：{item.current}/{item.target}</Text>
          <Text className='goalSub'>状态：{item.status === 'completed' ? '已完成' : '进行中'}</Text>
          <View className='ios-row-wrap'>
            <Button size='mini' onClick={() => updateGoalAmount(item.id, Number(item.current || 0) + 100)}>+100</Button>
            <Button size='mini' onClick={() => toggleGoal(item.id)}>{item.status === 'completed' ? '标记进行中' : '标记已完成'}</Button>
          </View>
        </View>
      ))}
    </View>
  );
}


