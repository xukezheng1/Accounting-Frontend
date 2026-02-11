import { useCallback, useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SectionBlock from '../../components/section-block';
import LoadingState from '../../components/loading-state';
import { askAI, fetchInsights } from '../../api/modules/ai';
import { fetchPrediction } from '../../api/modules/stats';
import { getSession } from '../../services/session';
import { EVENTS } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import { showError } from '../../api/client';
import './index.scss';

export default function AIPage() {
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [prompt, setPrompt] = useState('怎样减少本月不必要支出？');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [ai, pred] = await Promise.all([fetchInsights(session.activeBookId, 20), fetchPrediction(session.activeBookId)]);
      setInsights(ai);
      setPrediction(pred);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadData, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  async function submitPrompt() {
    if (!prompt.trim()) return;
    try {
      setAsking(true);
      const data = await askAI(prompt.trim());
      setReply(data.reply || '暂无回复');
    } catch (error) {
      showError(error);
    } finally {
      setAsking(false);
    }
  }

  return (
    <View className='ios-page'>
      <SectionBlock title='本月预测'>
        {loading ? <LoadingState text='正在计算预测...' /> : null}
        {!loading ? (
          <View>
            <Text className='line'>月份：{prediction?.month || '-'}</Text>
            <Text className='line'>当前支出：￥{prediction?.currentExpense || 0}</Text>
            <Text className='line'>预测支出：￥{prediction?.predictedExpense || 0}</Text>
            <Text className='line'>预测结余：￥{prediction?.predictedBalance || 0}</Text>
          </View>
        ) : null}
      </SectionBlock>

      <SectionBlock title='智能助手'>
        <Input className='ios-input' value={prompt} onInput={(e) => setPrompt(e.detail.value)} />
        <View className='ios-row-wrap'>
          <Button type='primary' loading={asking} onClick={submitPrompt}>发送问题</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-ai/pages/decision/index' })}>购买决策助手</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-report/pages/ai-report/index' })}>查看AI报告</Button>
        </View>
        {reply ? <View className='reply'>{reply}</View> : null}
      </SectionBlock>

      <SectionBlock title='异常提醒'>
        {loading ? <LoadingState text='正在获取提醒...' /> : null}
        {!loading && insights.length === 0 ? <Text className='ios-empty'>暂无异常提醒</Text> : null}
        {!loading
          ? insights.map((item) => (
              <View key={item.id} className='alert'>
                <Text className='title'>{item.title}</Text>
                <Text className='desc'>{item.content}</Text>
              </View>
            ))
          : null}
      </SectionBlock>
    </View>
  );
}


