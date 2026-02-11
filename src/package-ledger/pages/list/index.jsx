import { useCallback, useMemo, useState } from 'react';
import { Picker, Text, View } from '@tarojs/components';
import LoadingState from '../../../components/loading-state';
import { fetchTransactions } from '../../../api/modules/transaction';
import { getSession } from '../../../services/session';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { useTheme } from '../../../services/use-theme';
import { showError } from '../../../api/client';
import './index.scss';

const directionOptions = ['all', 'expense', 'income'];
const directionLabels = ['全部', '支出', '收入'];

export default function LedgerListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState('all');
  const { themeClass } = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) {
        setList([]);
        return;
      }
      const rows = await fetchTransactions(session.activeBookId, 240);
      setList(rows);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadData, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  const filtered = useMemo(() => {
    if (direction === 'all') return list;
    return list.filter((item) => item.direction === direction);
  }, [list, direction]);

  return (
    <View className={`ios-page ${themeClass}`}>
      <View className='monoHeader'>
        <View>
          <Text className='monoTitle'>账单明细</Text>
          <Text className='monoSubTitle'>按方向筛选历史记录</Text>
        </View>
      </View>

      <View className='ios-card'>
        <Picker
          mode='selector'
          range={directionLabels}
          value={directionOptions.indexOf(direction)}
          onChange={(e) => setDirection(directionOptions[Number(e.detail.value)])}
        >
          <View className='ios-picker'>筛选：{direction === 'all' ? '全部' : direction === 'expense' ? '支出' : '收入'}</View>
        </Picker>
      </View>

      <View className='ios-card'>
        {loading ? <LoadingState text='正在加载账单明细...' /> : null}
        {!loading && filtered.length === 0 ? <Text className='ios-empty'>暂无账单</Text> : null}
        {!loading
          ? filtered.map((item) => (
              <View key={item.id} className='item'>
                <Text className='itemMain'>
                  {item.direction === 'expense' ? '-' : '+'}￥{item.amount} · {item.category?.name || '未分类'}
                </Text>
                <Text className='itemSub'>
                  归属：{item.ownerUser?.nickname || '-'} · 备注：{item.note || '无'}
                </Text>
              </View>
            ))
          : null}
      </View>
    </View>
  );
}
