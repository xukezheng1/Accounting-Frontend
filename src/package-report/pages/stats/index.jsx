import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import LoadingState from '../../../components/loading-state';
import { fetchOverview } from '../../../api/modules/stats';
import { fetchTransactions } from '../../../api/modules/transaction';
import { getSession } from '../../../services/session';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { useTheme } from '../../../services/use-theme';
import { showError } from '../../../api/client';
import './index.scss';

const rangeOptions = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' }
];

function getRangeBoundary(range) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (range === 'week') {
    const day = now.getDay() || 7;
    const start = new Date(now);
    start.setDate(now.getDate() - day + 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (range === 'year') {
    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    return { start, end };
  }

  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return { start, end };
}

function getPreviousBoundary(range, currentStart) {
  if (range === 'week') {
    const start = new Date(currentStart);
    start.setDate(start.getDate() - 7);
    const end = new Date(currentStart);
    end.setDate(end.getDate() - 1);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (range === 'year') {
    const start = new Date(currentStart.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
    const end = new Date(currentStart.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(currentStart.getFullYear(), currentStart.getMonth(), 0, 23, 59, 59, 999);
  return { start, end };
}

function inRange(dateText, boundary) {
  if (!dateText) return false;
  const time = new Date(dateText);
  if (Number.isNaN(time.getTime())) return false;
  return time >= boundary.start && time <= boundary.end;
}

function toPercent(current, previous) {
  if (!previous) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getMoodScore(name = '') {
  if (/开心|愉悦|满足|轻松|兴奋|奖励/.test(name)) return 78;
  if (/平静|普通|中性|一般/.test(name)) return 55;
  if (/压力|焦虑|难过|烦躁|疲惫|冲动/.test(name)) return 30;
  return 50;
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 });
}

export default function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('month');
  const [activeBubble, setActiveBubble] = useState('');
  const [activeTrend, setActiveTrend] = useState('');
  const { themeClass } = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [o, rows] = await Promise.all([fetchOverview(session.activeBookId), fetchTransactions(session.activeBookId, 360)]);
      setOverview(o);
      setTransactions(rows);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadData, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  const currentBoundary = useMemo(() => getRangeBoundary(range), [range]);
  const previousBoundary = useMemo(() => getPreviousBoundary(range, currentBoundary.start), [range, currentBoundary.start]);

  const currentList = useMemo(
    () => transactions.filter((item) => inRange(item.occurredAt, currentBoundary)),
    [transactions, currentBoundary]
  );

  const previousList = useMemo(
    () => transactions.filter((item) => inRange(item.occurredAt, previousBoundary)),
    [transactions, previousBoundary]
  );

  const summary = useMemo(() => {
    const currentExpense = currentList.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const currentIncome = currentList.filter((item) => item.direction === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const previousExpense = previousList.filter((item) => item.direction === 'expense').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const previousIncome = previousList.filter((item) => item.direction === 'income').reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return {
      expense: currentExpense,
      income: currentIncome,
      expenseTrend: toPercent(currentExpense, previousExpense),
      incomeTrend: toPercent(currentIncome, previousIncome)
    };
  }, [currentList, previousList]);

  const bubbles = useMemo(() => {
    const map = {};
    currentList
      .filter((item) => item.direction === 'expense')
      .forEach((item) => {
        const name = item.emotion?.name || item.category?.name || '未标注';
        if (!map[name]) {
          map[name] = { key: name, amount: 0, count: 0, mood: getMoodScore(name) };
        }
        map[name].amount += Number(item.amount || 0);
        map[name].count += 1;
      });

    const rows = Object.values(map).slice(0, 6);
    if (!rows.length) return [];

    const maxAmount = Math.max(...rows.map((item) => item.amount), 1);
    const maxCount = Math.max(...rows.map((item) => item.count), 1);
    return rows.map((item) => ({
      ...item,
      x: 10 + Math.round((item.mood / 100) * 80),
      y: 88 - Math.round((item.amount / maxAmount) * 65),
      size: 24 + Math.round((item.count / maxCount) * 30)
    }));
  }, [currentList]);

  useEffect(() => {
    if (!bubbles.length) {
      setActiveBubble('');
      return;
    }
    if (!bubbles.some((item) => item.key === activeBubble)) {
      setActiveBubble(bubbles[0].key);
    }
  }, [bubbles, activeBubble]);

  const selectedBubble = bubbles.find((item) => item.key === activeBubble) || null;

  const trendRows = useMemo(() => {
    const source = currentList.filter((item) => item.direction === 'expense');

    let labels = [];
    if (range === 'week') labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    if (range === 'month') labels = ['第1周', '第2周', '第3周', '第4周', '第5周'];
    if (range === 'year') labels = Array.from({ length: 12 }).map((_, idx) => `${idx + 1}月`);

    const actual = labels.map((label, idx) => ({ label, idx, value: 0 }));
    source.forEach((item) => {
      const date = new Date(item.occurredAt);
      if (Number.isNaN(date.getTime())) return;
      let position = 0;
      if (range === 'week') {
        position = (date.getDay() || 7) - 1;
      } else if (range === 'month') {
        position = Math.min(4, Math.floor((date.getDate() - 1) / 7));
      } else {
        position = date.getMonth();
      }
      if (!actual[position]) return;
      actual[position].value += Number(item.amount || 0);
    });

    const average = actual.reduce((sum, item) => sum + item.value, 0) / Math.max(actual.length, 1);
    const predicted = actual.map((item, idx) => {
      if (idx === 0) return item.value || average;
      const prev = actual[idx - 1].value || average;
      return Math.round(prev * 0.55 + (item.value || average) * 0.45);
    });

    const max = Math.max(
      1,
      ...actual.map((item) => item.value),
      ...predicted
    );

    return actual.map((item, idx) => ({
      key: item.label,
      label: item.label,
      actual: item.value,
      predicted: predicted[idx],
      actualPercent: Math.round((item.value / max) * 100),
      predictedPercent: Math.round((predicted[idx] / max) * 100)
    }));
  }, [currentList, range]);

  useEffect(() => {
    if (!trendRows.length) {
      setActiveTrend('');
      return;
    }
    if (!trendRows.some((item) => item.key === activeTrend)) {
      setActiveTrend(trendRows[trendRows.length - 1].key);
    }
  }, [trendRows, activeTrend]);

  const activeTrendRow = trendRows.find((item) => item.key === activeTrend) || null;

  return (
    <View className={`ios-page statsPage ${themeClass}`}>
      <View className='statsHeader'>
        <Text className='statsTitle'>数据报表</Text>
        <View className='filterBtn' onClick={() => Taro.showToast({ title: '筛选功能开发中', icon: 'none' })}>
          <Text>⚑</Text>
        </View>
      </View>

      <View className='rangeSegment'>
        {rangeOptions.map((item) => (
          <View key={item.key} className={`rangeItem ${range === item.key ? 'rangeItemActive' : ''}`} onClick={() => setRange(item.key)}>
            {item.label}
          </View>
        ))}
      </View>

      {loading ? <LoadingState text='正在生成报表...' /> : null}

      {!loading ? (
        <View>
          <View className='summaryGrid'>
            <View className='summaryCard summaryOut'>
              <Text className='summaryLabel'>总支出</Text>
              <Text className='summaryValue'>￥{formatAmount(summary.expense)}</Text>
              <Text className='summaryTrend'>{summary.expenseTrend >= 0 ? '↑' : '↓'} {Math.abs(summary.expenseTrend)}% vs 上周期</Text>
            </View>
            <View className='summaryCard summaryIn'>
              <Text className='summaryLabel'>总收入</Text>
              <Text className='summaryValue'>￥{formatAmount(summary.income)}</Text>
              <Text className='summaryTrend'>{summary.incomeTrend >= 0 ? '↑' : '↓'} {Math.abs(summary.incomeTrend)}% vs 上周期</Text>
            </View>
          </View>

          <View className='ios-card chartCard'>
            <View className='chartHead'>
              <Text className='chartTitle'>情绪消费分析</Text>
              <Text className='chartIcon'>💗</Text>
            </View>
            {bubbles.length === 0 ? <Text className='ios-empty'>当前周期暂无可分析数据</Text> : null}
            {bubbles.length ? (
              <View>
                <View className='scatterPlane'>
                  {[0, 1, 2, 3].map((line) => (
                    <View key={line} className='axisLine' style={{ top: `${25 + line * 18}%` }} />
                  ))}
                  {bubbles.map((item) => (
                    <View
                      key={item.key}
                      className={`bubble ${item.key === activeBubble ? 'bubbleActive' : ''}`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.size}px`,
                        height: `${item.size}px`
                      }}
                      onClick={() => setActiveBubble(item.key)}
                    />
                  ))}
                </View>
                {selectedBubble ? (
                  <Text className='bubbleMeta'>
                    {selectedBubble.key} · 支出 ￥{formatAmount(selectedBubble.amount)} · 共 {selectedBubble.count} 笔
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>

          <View className='ios-card chartCard'>
            <View className='chartHead'>
              <Text className='chartTitle'>支出趋势预测</Text>
              <Text className='chartIcon'>📈</Text>
            </View>
            <View className='legend'>
              <View className='legendItem'>
                <View className='legendDot legendActual' />
                <Text>实际支出</Text>
              </View>
              <View className='legendItem'>
                <View className='legendDot legendPred' />
                <Text>预测支出</Text>
              </View>
            </View>
            <View className='trendChart'>
              {trendRows.map((item) => (
                <View
                  key={item.key}
                  className={`trendCol ${item.key === activeTrend ? 'trendColActive' : ''}`}
                  onClick={() => setActiveTrend(item.key)}
                >
                  <View className='trendTrack'>
                    <View className='trendPredLine' style={{ bottom: `${Math.max(8, item.predictedPercent)}%` }} />
                    <View className='trendActualBar' style={{ height: `${Math.max(8, item.actualPercent)}%` }} />
                  </View>
                  <Text className='trendLabel'>{item.label}</Text>
                </View>
              ))}
            </View>
            {activeTrendRow ? (
              <Text className='trendMeta'>
                {activeTrendRow.label}：实际 ￥{formatAmount(activeTrendRow.actual)}，预测 ￥{formatAmount(activeTrendRow.predicted)}
              </Text>
            ) : null}
            <Text className='overviewHint'>累计结余：￥{formatAmount(overview?.balance || 0)}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
