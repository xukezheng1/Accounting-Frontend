import { BASE_URL } from './config'

export function request(url, method = 'GET', data = {}, options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      timeout: 10000,
      ...options,
      success: (res) => {
        const body = res.data || {}
        if (body.code === 0 || body.message === 'ok') {
          resolve(body.data !== undefined ? body.data : body)
          return
        }
        reject(new Error(body.message || `请求失败(${body.code || res.statusCode})`))
      },
      fail: (err) => reject(new Error(err.errMsg || '网络请求失败'))
    })
  })
}
