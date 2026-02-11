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
  outputRoot: 'dist',
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
  mini: {},
  h5: {
    publicPath: '/',
    staticDirectory: 'static'
  }
};
