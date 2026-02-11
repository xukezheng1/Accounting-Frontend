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
    color: '#7b8088',
    selectedColor: '#111111',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/ledger/index',
        text: '记账',
        iconPath: 'assets/tabbar/ledger.png',
        selectedIconPath: 'assets/tabbar/ledger-active.png'
      },
      {
        pagePath: 'pages/ai/index',
        text: '智能',
        iconPath: 'assets/tabbar/ai.png',
        selectedIconPath: 'assets/tabbar/ai-active.png'
      },
      {
        pagePath: 'pages/family/index',
        text: '家庭',
        iconPath: 'assets/tabbar/family.png',
        selectedIconPath: 'assets/tabbar/family-active.png'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.png',
        selectedIconPath: 'assets/tabbar/mine-active.png'
      }
    ]
  }
});


