import { useCallback, useMemo, useState } from 'react';
import { Button, Input, Picker, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import LoadingState from '../../../components/loading-state';
import { createTransaction, fetchMetaOptions } from '../../../api/modules/transaction';
import { fetchMembers } from '../../../api/modules/book';
import { getSession } from '../../../services/session';
import { EVENTS, dispatchEvent } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { showError } from '../../../api/client';
import './index.scss';

export default function CreateTransactionPage() {
  const [direction, setDirection] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState([]);
  const [emotions, setEmotions] = useState([]);
  const [members, setMembers] = useState([]);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [emotionIndex, setEmotionIndex] = useState(0);
  const [memberIndex, setMemberIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const availableCategories = useMemo(() => categories.filter((item) => item.type === direction), [categories, direction]);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [meta, memberRows] = await Promise.all([fetchMetaOptions(session.activeBookId), fetchMembers(session.activeBookId)]);
      setCategories(meta.categories || []);
      setEmotions(meta.emotions || []);
      setMembers(memberRows || []);
      setCategoryIndex(0);
      setEmotionIndex(0);
      setMemberIndex(0);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  usePageRefresh(loadOptions, [EVENTS.SESSION_UPDATED, EVENTS.MEMBER_UPDATED]);

  async function submit() {
    try {
      const session = getSession();
      const userId = session.user?.id;
      const bookId = session.activeBookId;
      const category = availableCategories[categoryIndex];
      const emotion = emotions[emotionIndex];
      const member = members[memberIndex];

      if (!bookId || !userId || !category || !member || Number(amount) <= 0) {
        Taro.showToast({ title: '请先填写完整信息', icon: 'none' });
        return;
      }

      setSaving(true);
      await createTransaction({
        bookId,
        recordUserId: userId,
        ownerUserId: member.user.id,
        direction,
        amount: Number(amount),
        categoryId: category.id,
        emotionId: emotion?.id,
        note
      });

      dispatchEvent(EVENTS.TRANSACTION_UPDATED, { from: 'create' });
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 500);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className='ios-page'>
      <View className='ios-card'>
        {loading ? <LoadingState text='正在加载记账选项...' /> : null}
        {!loading ? (
          <View className='form'>
            <View className='ios-row'>
              <Button size='mini' type={direction === 'expense' ? 'primary' : 'default'} onClick={() => setDirection('expense')}>
                支出
              </Button>
              <Button size='mini' type={direction === 'income' ? 'primary' : 'default'} onClick={() => setDirection('income')}>
                收入
              </Button>
            </View>

            <Input className='ios-input' type='number' placeholder='输入金额' value={amount} onInput={(e) => setAmount(e.detail.value)} />

            <Picker mode='selector' range={availableCategories.map((item) => item.name)} value={categoryIndex} onChange={(e) => setCategoryIndex(Number(e.detail.value))}>
              <View className='ios-picker'>分类：{availableCategories[categoryIndex]?.name || '-'}</View>
            </Picker>

            <Picker mode='selector' range={members.map((item) => item.user.nickname)} value={memberIndex} onChange={(e) => setMemberIndex(Number(e.detail.value))}>
              <View className='ios-picker'>归属成员：{members[memberIndex]?.user.nickname || '-'}</View>
            </Picker>

            <Picker mode='selector' range={emotions.map((item) => item.name)} value={emotionIndex} onChange={(e) => setEmotionIndex(Number(e.detail.value))}>
              <View className='ios-picker'>情绪：{emotions[emotionIndex]?.name || '-'}</View>
            </Picker>

            <Input className='ios-input' placeholder='备注（可选）' value={note} onInput={(e) => setNote(e.detail.value)} />

            <Button type='primary' loading={saving} onClick={submit}>保存账单</Button>
          </View>
        ) : null}
      </View>
    </View>
  );
}


