export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/ledger/index',
    'pages/ai/index',
    'pages/family/index',
    'pages/mine/index'
  ],
  subPackages: [
    {
      root: 'package-ledger',
      pages: ['pages/create/index', 'pages/list/index']
    },
    {
      root: 'package-ai',
      pages: ['pages/decision/index']
    },
    {
      root: 'package-goal',
      pages: ['pages/index/index', 'pages/progress/index']
    },
    {
      root: 'package-report',
      pages: ['pages/stats/index', 'pages/ai-report/index']
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f5f5f7',
    navigationBarTitleText: '好记账',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#8e8e93',
    selectedColor: '#007aff',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/ledger/index', text: '记账' },
      { pagePath: 'pages/ai/index', text: '智能' },
      { pagePath: 'pages/family/index', text: '家庭' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ]
  }
});


