import { useCallback, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
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
import { useTheme } from '../../services/use-theme';
import { showError } from '../../api/client';
import './index.scss';

const quickActions = [
  { title: '快速记账', desc: '记录收入或支出', url: '/package-ledger/pages/create/index' },
  { title: '数据报表', desc: '查看趋势与分析', url: '/package-report/pages/stats/index' },
  { title: 'AI 报告', desc: '生成本月建议', url: '/package-report/pages/ai-report/index' },
  { title: '目标进度', desc: '追踪存钱计划', url: '/package-goal/pages/progress/index' }
];

export default function HomePage() {
  const [session, setLocalSession] = useState(getSession());
  const [overview, setOverview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookMode, setBookMode] = useState('personal');
  const { themeClass } = useTheme();

  const loadPage = useCallback(async () => {
    try {
      setLoading(true);
      let local = getSession();
      if (!local.user || !local.activeBookId) {
        const demo = await initDemo();
        local = setSession({ user: demo.user, books: demo.books, activeBookId: demo.books[0]?.id || null });
      }

      setLocalSession(local);
      const active = local.books.find((item) => item.id === local.activeBookId);
      setBookMode(active?.bookType === 'family' ? 'family' : 'personal');

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
  const modeBooks = useMemo(() => {
    const rows = session.books.filter((item) => item.bookType === bookMode);
    return rows.length > 0 ? rows : session.books;
  }, [session.books, bookMode]);

  const activeBook = useMemo(
    () => modeBooks.find((item) => item.id === session.activeBookId) || modeBooks[0] || null,
    [modeBooks, session.activeBookId]
  );

  const budgetTotal = useMemo(() => {
    const predicted = Number(prediction?.predictedExpense || 0);
    const current = Number(overview?.expense || 0);
    return Math.max(predicted, current, 1);
  }, [prediction, overview]);

  const budgetUsed = Number(overview?.expense || 0);
  const budgetPercent = Math.max(0, Math.min(100, Math.round((budgetUsed / budgetTotal) * 100)));
  const ringAngle = Math.max(12, Math.round((budgetPercent / 100) * 360));

  function handleSwitchMode(mode) {
    if (mode === bookMode) return;
    setBookMode(mode);
    const rows = session.books.filter((item) => item.bookType === mode);
    if (!rows.length) return;
    const hasActive = rows.some((item) => item.id === session.activeBookId);
    if (hasActive) return;
    const updated = setSession({ activeBookId: rows[0].id });
    setLocalSession(updated);
    loadPage();
  }

  function handleSwitchBook(bookId) {
    if (!bookId || bookId === session.activeBookId) return;
    const updated = setSession({ activeBookId: bookId });
    setLocalSession(updated);
    loadPage();
  }

  return (
    <View className={`ios-page homePage ${themeClass}`}>
      <View className='monoHeader'>
        <View>
          <Text className='monoSubTitle'>你好，</Text>
          <Text className='monoTitle'>{session.user?.nickname || '新用户'}</Text>
        </View>
        <View className='monoIconBtn' onClick={() => Taro.showToast({ title: '提醒功能开发中', icon: 'none' })}>
          <Text>◌</Text>
        </View>
      </View>

      <View className='modeSegment'>
        <View className={`modeItem ${bookMode === 'personal' ? 'modeItemActive' : ''}`} onClick={() => handleSwitchMode('personal')}>
          个人账本
        </View>
        <View className={`modeItem ${bookMode === 'family' ? 'modeItemActive' : ''}`} onClick={() => handleSwitchMode('family')}>
          家庭账本
        </View>
      </View>

      <View className='bookTabs'>
        {modeBooks.map((item) => (
          <View
            key={item.id}
            className={`bookTab ${item.id === activeBook?.id ? 'bookTabActive' : ''}`}
            onClick={() => handleSwitchBook(item.id)}
          >
            <Text className='bookTabName'>{item.name}</Text>
          </View>
        ))}
      </View>

      <View className='ios-card budgetCard'>
        <View className='ringWrap'>
          <View className='budgetRing' style={{ '--budget-angle': `${ringAngle}deg` }}>
            <View className='budgetInner'>
              <Text className='budgetPercent'>{budgetPercent}%</Text>
              <Text className='budgetLabel'>本月预算</Text>
            </View>
          </View>
        </View>
        <View className='budgetMeta'>
          <View>
            <Text className='metaLabel'>已支出</Text>
            <Text className='metaValue'>￥{budgetUsed.toFixed(0)}</Text>
          </View>
          <View>
            <Text className='metaLabel'>预算总额</Text>
            <Text className='metaValue'>￥{budgetTotal.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      {loading ? <LoadingState text='正在加载首页数据...' /> : null}

      {!loading ? (
        <View>
          <View className='grid2'>
            <SummaryCard title='本月支出' value={`￥${overview?.expense || 0}`} color='var(--danger)' />
            <SummaryCard title='本月收入' value={`￥${overview?.income || 0}`} color='var(--success)' />
          </View>
          <View className='grid2'>
            <SummaryCard title='预测支出' value={`￥${prediction?.predictedExpense || 0}`} hint={prediction?.overBudget ? '预计超预算' : '预算稳定'} />
            <SummaryCard title='目标完成' value={`${completedGoals}/${goals.length}`} />
          </View>

          <SectionBlock title='AI 洞察'>
            {insights.length === 0 ? <Text className='ios-empty'>暂无洞察</Text> : null}
            {insights.slice(0, 3).map((item) => (
              <View key={item.id} className='insightItem'>
                <Text className='insightTitle'>{item.title}</Text>
                <Text className='insightDesc'>{item.content}</Text>
              </View>
            ))}
          </SectionBlock>

          <SectionBlock title='常用入口'>
            <View className='actionGrid'>
              {quickActions.map((action) => (
                <View key={action.title} className='actionCard' onClick={() => Taro.navigateTo({ url: action.url })}>
                  <Text className='actionTitle'>{action.title}</Text>
                  <Text className='actionDesc'>{action.desc}</Text>
                </View>
              ))}
            </View>
          </SectionBlock>
        </View>
      ) : null}
    </View>
  );
}
