import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import { askAI } from '../../../api/modules/ai';
import { useTheme } from '../../../services/use-theme';
import { showError } from '../../../api/client';
import './index.scss';

function localAdvice(price, predictedBalance) {
  if (price <= 0) return '请先输入有效金额。';
  if (predictedBalance <= 0) return '当前结余偏紧，建议延后购买。';
  if (price > predictedBalance * 0.7) return '这笔消费会带来明显资金压力，建议延后或分期。';
  if (price > predictedBalance * 0.4) return '可以承担，但会明显影响可支配资金，建议观望。';
  return '当前资金可承受，可在预算内购买。';
}

export default function DecisionPage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [predictedBalance, setPredictedBalance] = useState('1000');
  const [result, setResult] = useState('');
  const [aiResult, setAIResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { themeClass } = useTheme();

  async function runDecision() {
    const amount = Number(price);
    const balance = Number(predictedBalance);
    const text = localAdvice(amount, balance);
    setResult(text);

    try {
      setLoading(true);
      const prompt = `我想购买${item || '某件商品'}，价格${amount}元，预计月结余${balance}元。请给出简洁理性的消费建议。`;
      const data = await askAI(prompt);
      setAIResult(data.reply || '暂无智能建议');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className={`ios-page ${themeClass}`}>
      <View className='monoHeader'>
        <View>
          <Text className='monoTitle'>买前决策</Text>
          <Text className='monoSubTitle'>估算购买影响，降低冲动消费</Text>
        </View>
      </View>

      <View className='ios-card decisionForm'>
        <Input className='ios-input' placeholder='商品名称（如：相机）' value={item} onInput={(e) => setItem(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='商品价格（元）' value={price} onInput={(e) => setPrice(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='预计月结余（元）' value={predictedBalance} onInput={(e) => setPredictedBalance(e.detail.value)} />
        <Button type='primary' loading={loading} onClick={runDecision}>开始分析</Button>
      </View>

      {result ? (
        <View className='ios-card'>
          <Text className='blockTitle'>规则建议</Text>
          <Text className='blockText'>{result}</Text>
        </View>
      ) : null}

      {aiResult ? (
        <View className='ios-card'>
          <Text className='blockTitle'>AI 建议</Text>
          <Text className='blockText'>{aiResult}</Text>
        </View>
      ) : null}
    </View>
  );
}
