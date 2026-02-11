import { useCallback, useState } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SectionBlock from '../../components/section-block';
import LoadingState from '../../components/loading-state';
import { fetchTransactions } from '../../api/modules/transaction';
import { getSession } from '../../services/session';
import { EVENTS } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import { showError } from '../../api/client';
import './index.scss';

export default function LedgerPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) {
        setTransactions([]);
        return;
      }
      const rows = await fetchTransactions(session.activeBookId, 12);
      setTransactions(rows);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadList, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  return (
    <View className='ios-page'>
      <SectionBlock title='记账操作'>
        <View className='ios-row'>
          <Button type='primary' onClick={() => Taro.navigateTo({ url: '/package-ledger/pages/create/index' })}>新增账单</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-ledger/pages/list/index' })}>查看全部</Button>
        </View>
      </SectionBlock>

      <SectionBlock title='最近账单'>
        {loading ? <LoadingState text='正在加载账单...' /> : null}
        {!loading && transactions.length === 0 ? <Text className='ios-empty'>还没有账单记录</Text> : null}
        {!loading
          ? transactions.map((item) => (
              <View key={item.id} className='ledgerItem'>
                <Text className='ledgerMain'>
                  {item.direction === 'expense' ? '-' : '+'}￥{item.amount} · {item.category?.name || '未分类'}
                </Text>
                <Text className='ledgerSub'>
                  归属：{item.ownerUser?.nickname || '-'} · 备注：{item.note || '无'}
                </Text>
              </View>
            ))
          : null}
      </SectionBlock>
    </View>
  );
}


