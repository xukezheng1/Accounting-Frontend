import { useCallback, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import LoadingState from '../../../components/loading-state';
import { fetchInsights } from '../../../api/modules/ai';
import { fetchPrediction, fetchOverview } from '../../../api/modules/stats';
import { getSession } from '../../../services/session';
import { EVENTS } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { useTheme } from '../../../services/use-theme';
import { showError } from '../../../api/client';
import './index.scss';

function getAdviceLevel(prediction) {
  if (!prediction) return '暂无';
  if (prediction.overBudget) return '高风险';
  if (prediction.predictedBalance < 0) return '中风险';
  return '稳定';
}

export default function AIReportPage() {
  const [insights, setInsights] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { themeClass } = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [ai, pred, over] = await Promise.all([
        fetchInsights(session.activeBookId, 30),
        fetchPrediction(session.activeBookId),
        fetchOverview(session.activeBookId)
      ]);
      setInsights(ai);
      setPrediction(pred);
      setOverview(over);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadData, [EVENTS.TRANSACTION_UPDATED, EVENTS.SESSION_UPDATED]);

  const report = useMemo(() => {
    const level = getAdviceLevel(prediction);
    const top = insights[0]?.content || '暂无异常提醒';
    const title =
      level === '高风险'
        ? '本月资金压力偏高，建议立即控制可选消费。'
        : level === '中风险'
        ? '本月资金波动较大，建议保留应急预算。'
        : '本月财务状态稳定，可继续保持。';

    return {
      level,
      title,
      top,
      income: overview?.income || 0,
      expense: overview?.expense || 0,
      balance: overview?.balance || 0,
      predictedExpense: prediction?.predictedExpense || 0,
      predictedBalance: prediction?.predictedBalance || 0
    };
  }, [insights, prediction, overview]);

  return (
    <View className={`ios-page ${themeClass}`}>
      <View className='ios-card'>
        <Text className='ios-title'>AI报告页</Text>
        <Text className='ios-subtitle'>自动生成本月财务诊断与建议</Text>
      </View>

      {loading ? <LoadingState text='正在生成AI报告...' /> : null}

      {!loading ? (
        <View>
          <View className='ios-card'>
            <Text className='reportTag'>风险等级：{report.level}</Text>
            <Text className='reportTitle'>{report.title}</Text>
            <Text className='reportBody'>重点提醒：{report.top}</Text>
          </View>

          <View className='ios-card'>
            <Text className='reportTitle'>本月数据概览</Text>
            <Text className='reportBody'>收入：￥{report.income}</Text>
            <Text className='reportBody'>支出：￥{report.expense}</Text>
            <Text className='reportBody'>结余：￥{report.balance}</Text>
          </View>

          <View className='ios-card'>
            <Text className='reportTitle'>预测结果</Text>
            <Text className='reportBody'>预测支出：￥{report.predictedExpense}</Text>
            <Text className='reportBody'>预测结余：￥{report.predictedBalance}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}


