import { useCallback, useMemo, useState } from 'react';
import { Button, Text, View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import SectionBlock from '../../components/section-block';
import { clearSession, getSession } from '../../services/session';
import { getGoals } from '../../services/goal';
import { EVENTS } from '../../services/events';
import { usePageRefresh } from '../../services/use-page-refresh';
import { useTheme } from '../../services/use-theme';
import { THEME_PREFERENCE } from '../../services/theme';
import './index.scss';

const themeOptions = [
  { value: THEME_PREFERENCE.SYSTEM, label: '跟随系统', desc: '自动适配浅色或深色' },
  { value: THEME_PREFERENCE.LIGHT, label: '浅色主题', desc: '简洁明亮风格' },
  { value: THEME_PREFERENCE.DARK, label: '深色主题', desc: '夜间舒适阅读' }
];

function themeLabel(preference) {
  if (preference === THEME_PREFERENCE.LIGHT) return '浅色主题';
  if (preference === THEME_PREFERENCE.DARK) return '深色主题';
  return '跟随系统';
}

export default function MinePage() {
  const [session, setSessionState] = useState(getSession());
  const [goals, setGoals] = useState(getGoals());
  const { themeClass, preference, setPreference } = useTheme();

  const goalSummary = useMemo(() => {
    const total = goals.length;
    const done = goals.filter((item) => item.status === 'completed').length;
    return { total, done };
  }, [goals]);

  const loadData = useCallback(async () => {
    setSessionState(getSession());
    setGoals(getGoals());
  }, []);

  usePageRefresh(loadData, [EVENTS.SESSION_UPDATED, EVENTS.GOAL_UPDATED]);

  return (
    <View className={`ios-page ${themeClass}`}>
      <View className='monoHeader'>
        <View>
          <Text className='monoTitle'>我的</Text>
          <Text className='monoSubTitle'>偏好设置与数据管理</Text>
        </View>
      </View>

      <SectionBlock title='账号信息'>
        <Text>用户昵称：{session.user?.nickname || '-'}</Text>
        <Text>账本数量：{session.books?.length || 0}</Text>
      </SectionBlock>

      <SectionBlock title='显示主题'>
        <Text className='themeHint'>当前模式：{themeLabel(preference)}</Text>
        <View className='themeSwitch'>
          {themeOptions.map((item) => (
            <View
              key={item.value}
              className={`themeOption ${preference === item.value ? 'themeOptionActive' : ''}`}
              onClick={() => setPreference(item.value)}
            >
              <Text className='themeOptionTitle'>{item.label}</Text>
              <Text className='themeOptionDesc'>{item.desc}</Text>
            </View>
          ))}
        </View>
      </SectionBlock>

      <SectionBlock title='目标中心'>
        <Text>已完成：{goalSummary.done}/{goalSummary.total}</Text>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.navigateTo({ url: '/package-goal/pages/index/index' })}>管理目标</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-goal/pages/progress/index' })}>目标进度</Button>
        </View>
      </SectionBlock>

      <SectionBlock title='报告中心'>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.navigateTo({ url: '/package-report/pages/stats/index' })}>数据报表</Button>
          <Button onClick={() => Taro.navigateTo({ url: '/package-report/pages/ai-report/index' })}>AI 报告</Button>
        </View>
      </SectionBlock>

      <SectionBlock title='数据管理'>
        <View className='ios-row-wrap'>
          <Button onClick={() => Taro.showToast({ title: '云备份开发中', icon: 'none' })}>云端备份</Button>
          <Button onClick={() => Taro.showToast({ title: '导出 Excel 开发中', icon: 'none' })}>导出 Excel</Button>
          <Button
            onClick={() => {
              clearSession();
              Taro.showToast({ title: '会话已重置', icon: 'success' });
              setTimeout(() => Taro.switchTab({ url: '/pages/home/index' }), 500);
            }}
          >
            重置演示数据
          </Button>
        </View>
      </SectionBlock>
    </View>
  );
}
