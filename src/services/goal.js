import Taro from '@tarojs/taro';
import { EVENTS, dispatchEvent } from './events';

const GOAL_KEY = 'smart_accounting_goals';

export function getGoals() {
  return Taro.getStorageSync(GOAL_KEY) || [];
}

export function saveGoals(goals) {
  Taro.setStorageSync(GOAL_KEY, goals);
  dispatchEvent(EVENTS.GOAL_UPDATED, goals);
}

export function addGoal(goal) {
  const goals = getGoals();
  const next = [
    {
      id: Date.now(),
      title: goal.title,
      target: Number(goal.target),
      current: Number(goal.current || 0),
      status: 'active'
    },
    ...goals
  ];
  saveGoals(next);
  return next;
}

export function updateGoalAmount(id, current) {
  const goals = getGoals().map((item) => {
    if (item.id !== id) return item;
    const normalized = Math.max(0, Number(current || 0));
    const nextStatus = normalized >= Number(item.target) ? 'completed' : item.status;
    return {
      ...item,
      current: normalized,
      status: nextStatus
    };
  });
  saveGoals(goals);
  return goals;
}

export function toggleGoal(id) {
  const goals = getGoals().map((item) => {
    if (item.id !== id) return item;
    const nextStatus = item.status === 'completed' ? 'active' : 'completed';
    return { ...item, status: nextStatus };
  });
  saveGoals(goals);
  return goals;
}


