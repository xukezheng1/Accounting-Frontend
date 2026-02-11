import { useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import { askAI } from '../../../api/modules/ai';
import { showError } from '../../../api/client';
import './index.scss';

function 本地建议(price, predictedBalance) {
  if (price <= 0) return '请先输入有效金额。';
  if (predictedBalance <= 0) return '当前结余趋势偏紧，建议延后购买。';
  if (price > predictedBalance * 0.7) return '该消费对本月资金压力较高，建议延后或分期。';
  if (price > predictedBalance * 0.4) return '可承担，但会明显影响灵活资金，建议观望。';
  return '当前财务承受范围内，可考虑购买。';
}

export default function DecisionPage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [predictedBalance, setPredictedBalance] = useState('1000');
  const [result, setResult] = useState('');
  const [aiResult, setAIResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function runDecision() {
    const amount = Number(price);
    const balance = Number(predictedBalance);
    const text = 本地建议(amount, balance);
    setResult(text);

    try {
      setLoading(true);
      const prompt = `我想购买${item || '某件商品'}，价格${amount}元，预计月结余${balance}元。请给出精炼消费建议。`;
      const data = await askAI(prompt);
      setAIResult(data.reply || '暂无智能建议');
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className='ios-page'>
      <View className='ios-card'>
        <Input className='ios-input' placeholder='商品名称（例如：相机）' value={item} onInput={(e) => setItem(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='商品价格（元）' value={price} onInput={(e) => setPrice(e.detail.value)} />
        <Input className='ios-input' type='number' placeholder='预计月结余（元）' value={predictedBalance} onInput={(e) => setPredictedBalance(e.detail.value)} />
        <Button type='primary' loading={loading} onClick={runDecision}>开始分析</Button>
      </View>

      {result ? (
        <View className='ios-card'>
          <Text className='ios-title'>规则建议</Text>
          <Text>{result}</Text>
        </View>
      ) : null}

      {aiResult ? (
        <View className='ios-card'>
          <Text className='ios-title'>AI建议</Text>
          <Text>{aiResult}</Text>
        </View>
      ) : null}
    </View>
  );
}


