import { useCallback, useMemo, useState } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SectionBlock from '../../components/section-block';
import { clearSession, getSession } from '../../services/session';
import { getGoals } from '../../services/goal';
import { EVENTS } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import './index.scss';

export default function MinePage() {
  const [session, setSessionState] = useState(getSession());
  const [goals, setGoals] = useState(getGoals());

  const goalSummary = useMemo(() => {
    const total = goals.length;
    const done = goals.filter((item) => item.status === 'completed').length;
    return { total, done };
  }, [goals]);

  const loadData = useCallback(async () => {
    setSessionState(getSession());
    setGoals(getGoals());
  }, []);

  usePageRefresh(loadData, [EVENTS.SESSION_UPDATED, EVENTS.GOAL_UPDATED]);

  return (
    <View className='ios-page'>
      <SectionBlock title='个人资料'>
        <Text>用户昵称：{session.user?.nickname || '-'}</Text>
        <Text>账本数量：{session.books?.length || 0}</Text>
      </SectionBlock>

      <SectionBlock title='目标中心'>
        <Text>
          已完成：{goalSummary.done}/{goalSummary.total}
        </Text>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.navigateTo({ url: '/package-goal/pages/index/index' })}>管理目标</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-goal/pages/progress/index' })}>目标进度图</Button>
        </View>
      </SectionBlock>

      <SectionBlock title='报告中心'>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.navigateTo({ url: '/package-report/pages/stats/index' })}>统计图表页</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-report/pages/ai-report/index' })}>AI报告页</Button>
        </View>
      </SectionBlock>

      <SectionBlock title='数据管理'>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.showToast({ title: '云备份开发中', icon: 'none' })}>云端备份</Button>
          <Button onClick={() => Taro.showToast({ title: '导出 Excel 开发中', icon: 'none' })}>导出Excel</Button>
          <Button
            onClick={() => {
              clearSession();
              Taro.showToast({ title: '会话已重置', icon: 'success' });
              setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 500);
            }}
          >
            重置演示数据
          </Button>
        </View>
      </SectionBlock>
    </View>
  );
}


