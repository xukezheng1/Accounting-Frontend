import { useCallback, useState } from 'react';
import { Button, Picker, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SummaryCard from '../../components/summary-card';
import SectionBlock from '../../components/section-block';
import LoadingState from '../../components/loading-state';
import { initDemo } from '../../api/modules/bootstrap';
import { fetchOverview, fetchPrediction } from '../../api/modules/stats';
import { fetchInsights } from '../../api/modules/ai';
import { getSession, setSession } from '../../services/session';
import { getGoals } from '../../services/goal';
import { EVENTS } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import { showError } from '../../api/client';
import './index.scss';

export default function HomePage() {
  const [session, setLocalSession] = useState(getSession());
  const [overview, setOverview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      let local = getSession();
      if (!local.user || !local.activeBookId) {
        const demo = await initDemo();
        local = setSession({ user: demo.user, books: demo.books, activeBookId: demo.books[0]?.id || null });
      }

      setLocalSession(local);

      if (!local.activeBookId) return;
      const [o, p, ai] = await Promise.all([
        fetchOverview(local.activeBookId),
        fetchPrediction(local.activeBookId),
        fetchInsights(local.activeBookId, 6)
      ]);
      setOverview(o);
      setPrediction(p);
      setInsights(ai);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadPage, [EVENTS.SESSION_UPDATED, EVENTS.TRANSACTION_UPDATED, EVENTS.GOAL_UPDATED]);

  const goals = getGoals();
  const completedGoals = goals.filter((g) => g.status === 'completed').length;
  const bookNames = session.books.map((item) => `${item.name}（${item.bookType === 'family' ? '家庭' : '个人'}）`);

  return (
    <View className='ios-page'>
      <View className='ios-card'>
        <Text className='ios-title'>今日概览</Text>
        <Text className='ios-subtitle'>轻点下方模块，快速完成记账与分析</Text>
      </View>

      <SectionBlock title='账本切换'>
        <Picker
          mode='selector'
          range={bookNames}
          value={Math.max(0, session.books.findIndex((item) => item.id === session.activeBookId))}
          onChange={(e) => {
            const idx = Number(e.detail.value);
            const next = session.books[idx];
            if (!next) return;
            const updated = setSession({ activeBookId: next.id });
            setLocalSession(updated);
            loadPage();
          }}
        >
          <View className='ios-picker'>{session.books.find((item) => item.id === session.activeBookId)?.name || '请选择账本'}</View>
        </Picker>
        <Text className='ios-subtitle'>当前用户：{session.user?.nickname || '-'}</Text>
      </SectionBlock>

      {loading ? <LoadingState text='正在加载首页数据...' /> : null}

      {!loading ? (
        <View>
          <View className='grid-2'>
            <SummaryCard title='本月支出' value={overview ? `￥${overview.expense}` : '-'} color='#ff3b30' />
            <SummaryCard title='本月收入' value={overview ? `￥${overview.income}` : '-'} color='#34c759' />
          </View>
          <View className='grid-2'>
            <SummaryCard
              title='预测支出'
              value={prediction ? `￥${prediction.predictedExpense}` : '-'}
              hint={prediction?.overBudget ? '存在超预算风险' : '预算趋势平稳'}
            />
            <SummaryCard title='目标完成' value={`${completedGoals}/${goals.length}`} />
          </View>

          <SectionBlock title='智能提醒'>
            {insights.length === 0 ? <Text className='ios-empty'>暂无提醒</Text> : null}
            {insights.map((item) => (
              <View key={item.id} className='alertItem'>
                <Text className='alertTitle'>{item.title}</Text>
                <Text className='alertDesc'>{item.content}</Text>
              </View>
            ))}
          </SectionBlock>

          <SectionBlock title='常用入口'>
            <View className='ios-row-wrap'>
              <Button size='mini' onClick={() => Taro.navigateTo({ url: '/package-ledger/pages/create/index' })}>快速记账</Button>
              <Button size='mini' onClick={() => Taro.navigateTo({ url: '/package-report/pages/stats/index' })}>统计图表</Button>
              <Button size='mini' onClick={() => Taro.navigateTo({ url: '/package-report/pages/ai-report/index' })}>AI报告</Button>
              <Button size='mini' onClick={() => Taro.navigateTo({ url: '/package-goal/pages/progress/index' })}>目标进度图</Button>
            </View>
          </SectionBlock>
        </View>
      ) : null}
    </View>
  );
}


