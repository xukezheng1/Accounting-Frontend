import { useCallback, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import LoadingState from '../../../components/loading-state';
import { fetchOverview } from '../../../api/modules/stats';
import { fetchTransactions } from '../../../api/modules/transaction';
import { getSession } from '../../../services/session';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { showError } from '../../../api/client';
import './index.scss';

function formatDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [o, rows] = await Promise.all([fetchOverview(session.activeBookId), fetchTransactions(session.activeBookId, 120)]);
      setOverview(o);
      setTransactions(rows);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadData, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  const categoryChart = useMemo(() => {
    if (!overview?.topCategories?.length) return [];
    const max = Math.max(...overview.topCategories.map((x) => Number(x.total || 0)), 1);
    return overview.topCategories.map((item) => ({ ...item, percent: Math.round((Number(item.total) / max) * 100) }));
  }, [overview]);

  const sevenDay = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return { key: d.toDateString(), label: formatDate(d), value: 0 };
    });

    const map = Object.fromEntries(days.map((d) => [d.key, d]));
    transactions.forEach((item) => {
      if (item.direction !== 'expense') return;
      const d = new Date(item.occurredAt);
      const key = d.toDateString();
      if (map[key]) map[key].value += Number(item.amount || 0);
    });

    const arr = Object.values(map);
    const max = Math.max(...arr.map((x) => x.value), 1);
    return arr.map((x) => ({ ...x, percent: Math.round((x.value / max) * 100) }));
  }, [transactions]);

  return (
    <View className='ios-page'>
      <View className='ios-card'>
        <Text className='ios-title'>统计图表页</Text>
        <Text className='ios-subtitle'>基于当前账本生成的可视化统计</Text>
      </View>

      {loading ? <LoadingState text='正在生成图表...' /> : null}

      {!loading ? (
        <View>
          <View className='ios-card'>
            <Text className='chartTitle'>本月收支</Text>
            <Text className='chartLine'>收入：￥{overview?.income || 0}</Text>
            <Text className='chartLine'>支出：￥{overview?.expense || 0}</Text>
            <Text className='chartLine'>结余：￥{overview?.balance || 0}</Text>
          </View>

          <View className='ios-card'>
            <Text className='chartTitle'>分类支出排行</Text>
            {categoryChart.length === 0 ? <Text className='ios-empty'>暂无分类数据</Text> : null}
            {categoryChart.map((item) => (
              <View key={item.categoryName} className='rowBlock'>
                <View className='rowHead'>
                  <Text>{item.categoryName}</Text>
                  <Text>￥{item.total}</Text>
                </View>
                <View className='barTrack'>
                  <View className='barFill' style={{ width: `${item.percent}%` }} />
                </View>
              </View>
            ))}
          </View>

          <View className='ios-card'>
            <Text className='chartTitle'>近7日支出趋势</Text>
            <View className='trendWrap'>
              {sevenDay.map((item) => (
                <View key={item.key} className='trendCol'>
                  <View className='trendBarWrap'>
                    <View className='trendBar' style={{ height: `${Math.max(10, item.percent)}%` }} />
                  </View>
                  <Text className='trendValue'>{item.value.toFixed(0)}</Text>
                  <Text className='trendLabel'>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}


