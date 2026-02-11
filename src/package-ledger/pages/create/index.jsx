import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Input, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import LoadingState from '../../../components/loading-state';
import { createTransaction, fetchMetaOptions } from '../../../api/modules/transaction';
import { fetchMembers } from '../../../api/modules/book';
import { getSession } from '../../../services/session';
import { EVENTS, dispatchEvent } from '../../../services/events';
import { usePageRefresh } from '../../../services/use-page-refresh';
import { useTheme } from '../../../services/use-theme';
import { showError } from '../../../api/client';
import './index.scss';

const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

function getCategoryIcon(name = '') {
  if (/餐|吃|饮/.test(name)) return '🍽';
  if (/购|买|商/.test(name)) return '🛍';
  if (/交|车|行/.test(name)) return '🚌';
  if (/娱|玩|游/.test(name)) return '🎮';
  if (/住|房|租/.test(name)) return '🏠';
  if (/医|药/.test(name)) return '💊';
  if (/工|薪/.test(name)) return '💼';
  return '🧩';
}

function appendAmount(raw, key) {
  if (key === 'del') return raw.slice(0, -1);
  if (key === '.') {
    if (!raw) return '0.';
    if (raw.includes('.')) return raw;
    return `${raw}.`;
  }

  const next = `${raw}${key}`;
  if (!raw || raw === '0') return key === '0' ? '0' : key;
  if (raw.includes('.')) {
    const decimal = raw.split('.')[1] || '';
    if (decimal.length >= 2) return raw;
  }
  if (next.length > 10) return raw;
  return next;
}

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
  const { themeClass } = useTheme();

  const availableCategories = useMemo(() => categories.filter((item) => item.type === direction), [categories, direction]);

  const memberRows = useMemo(() => {
    if (members.length) return members;
    const session = getSession();
    if (!session.user) return [];
    return [{ user: session.user }];
  }, [members]);

  useEffect(() => {
    if (categoryIndex > availableCategories.length - 1) {
      setCategoryIndex(0);
    }
  }, [availableCategories.length, categoryIndex]);

  useEffect(() => {
    if (emotionIndex > emotions.length - 1) {
      setEmotionIndex(0);
    }
  }, [emotions.length, emotionIndex]);

  useEffect(() => {
    if (memberIndex > memberRows.length - 1) {
      setMemberIndex(0);
    }
  }, [memberRows.length, memberIndex]);

  const loadOptions = useCallback(async () => {
    try {
      setLoading(true);
      const session = getSession();
      if (!session.activeBookId) return;
      const [meta, memberData] = await Promise.all([fetchMetaOptions(session.activeBookId), fetchMembers(session.activeBookId)]);
      setCategories(meta.categories || []);
      setEmotions(meta.emotions || []);
      setMembers(memberData || []);
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

  function onKeyTap(key) {
    setAmount((current) => appendAmount(current, key));
  }

  async function submit() {
    try {
      const session = getSession();
      const userId = session.user?.id;
      const bookId = session.activeBookId;
      const category = availableCategories[categoryIndex];
      const emotion = emotions[emotionIndex];
      const member = memberRows[memberIndex];
      const numericAmount = Number(amount);

      if (!bookId || !userId || !category || !member || !numericAmount || numericAmount <= 0) {
        Taro.showToast({ title: '请先填写完整信息', icon: 'none' });
        return;
      }

      setSaving(true);
      await createTransaction({
        bookId,
        recordUserId: userId,
        ownerUserId: member.user.id,
        direction,
        amount: numericAmount,
        categoryId: category.id,
        emotionId: emotion?.id,
        note
      });

      dispatchEvent(EVENTS.TRANSACTION_UPDATED, { from: 'create' });
      Taro.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 450);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View className={`ios-page recordPage ${themeClass}`}>
      <View className='recordHeader'>
        <Text className='headerBtn' onClick={() => Taro.navigateBack()}>
          ×
        </Text>
        <Text className='recordTitle'>记一笔</Text>
        <Text className='headerBtn' onClick={() => Taro.showToast({ title: '语音识别开发中', icon: 'none' })}>
          🎙
        </Text>
      </View>

      {loading ? <LoadingState text='正在加载记账选项...' /> : null}

      {!loading ? (
        <View className='recordMain'>
          <View className='directionTabs'>
            <View className={`directionTab ${direction === 'expense' ? 'directionTabActive' : ''}`} onClick={() => setDirection('expense')}>
              支出
            </View>
            <View className={`directionTab ${direction === 'income' ? 'directionTabActive' : ''}`} onClick={() => setDirection('income')}>
              收入
            </View>
          </View>

          <View className='amountBlock'>
            <Text className='amountLabel'>金额</Text>
            <Text className='amountValue'>￥{amount || 0}</Text>
          </View>

          <View className='fieldBlock'>
            <Text className='fieldTitle'>选择分类</Text>
            <View className='categoryGrid'>
              {availableCategories.slice(0, 8).map((item, idx) => (
                <View
                  key={item.id}
                  className={`categoryCard ${idx === categoryIndex ? 'categoryCardActive' : ''}`}
                  onClick={() => setCategoryIndex(idx)}
                >
                  <Text className='categoryIcon'>{getCategoryIcon(item.name)}</Text>
                  <Text className='categoryName'>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='fieldBlock'>
            <Text className='fieldTitle'>当前心情</Text>
            <View className='emotionRow'>
              {emotions.slice(0, 6).map((item, idx) => (
                <View
                  key={item.id || `${item.name}-${idx}`}
                  className={`emotionChip ${idx === emotionIndex ? 'emotionChipActive' : ''}`}
                  onClick={() => setEmotionIndex(idx)}
                >
                  {item.name}
                </View>
              ))}
            </View>
          </View>

          <View className='fieldBlock'>
            <Text className='fieldTitle'>成员归属</Text>
            <View className='memberRow'>
              {memberRows.map((item, idx) => (
                <View
                  key={item.id || item.user.id}
                  className={`memberChip ${idx === memberIndex ? 'memberChipActive' : ''}`}
                  onClick={() => setMemberIndex(idx)}
                >
                  {item.user.nickname}
                </View>
              ))}
            </View>
          </View>

          <Input className='ios-input noteInput' placeholder='备注（可选）' value={note} onInput={(e) => setNote(e.detail.value)} />

          <View className='keypad'>
            {keypadKeys.map((key) => (
              <View key={key} className={`key ${key === 'del' ? 'keyDanger' : ''}`} onClick={() => onKeyTap(key)}>
                {key === 'del' ? '⌫' : key}
              </View>
            ))}
          </View>

          <Button className='saveBtn' type='primary' loading={saving} onClick={submit}>
            保存账单
          </Button>
        </View>
      ) : null}
    </View>
  );
}
