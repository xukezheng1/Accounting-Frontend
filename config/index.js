module.exports = {
  projectName: 'haojizhang-frontend',
  date: '2026-02-11',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist/weapp',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: {
    type: 'vite'
  },
  cache: {
    enable: true
  },
  mini: {
    outputRoot: 'dist/weapp'
  },
  h5: {
    outputRoot: 'dist/h5',
    publicPath: '/',
    staticDirectory: 'static'
  }
};

