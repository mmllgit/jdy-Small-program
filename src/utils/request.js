import Taro, {
  request,
  atMessage
} from '@tarojs/taro'
import {
  baseUrl
} from './baseUrl';

export const httpReq = (method, url, data, resType) => {
  return new Promise((resolve, reject) => {
    request({
      method: method,
      url: baseUrl + url,
      header:{
        ContentType:'application/json',
        token:Taro.getStorageSync('Token') || ''
      },
      data: data,
      responseType: resType,
    }).then((res) => {
      const { code, data, msg } = res.data
      if(code === 200){
        if(!data){
          resolve(msg)
        }else{
          resolve(data)
        }
      }else{
        atMessage({
          'message': msg,
          'type': 'error',
        })
      }
     })
  })
}
