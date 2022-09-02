import { httpReq } from './request';
import { pushLogin, register, applyOrder, getDetail, finishOrder, cancelOrder, searchOrder, changeFlag, saveRemark } from './params'

class requestUtil {
  pushLogin = (params: pushLogin) => 
    httpReq('post','/client/authority/login', params)

  register = (params: register) => 
    httpReq('post', '/client/authority/register', params)

  getCanOrder = () => 
    httpReq('post', '/client/order/list')

  applyOrder = (params: applyOrder) => 
    httpReq('post', '/client/order/start', params)
  
  getMyOrder = () =>
    httpReq('post', '/client/order/history')

  getDetail = (params: getDetail) => 
    httpReq('post', '/public/order/retrieval', params)

  finishOrder = (params: finishOrder) => 
    httpReq('post', '/client/order/finish', params) 

  cancelOrder = (params: cancelOrder) =>
    httpReq('post', '/client/order/abnormal', params)
  
  searchOrder = (params: searchOrder) => 
    httpReq('post', '/client/order/search', params)
  
  changeFlag = (params: changeFlag) =>
    httpReq('post', `/client/order/flag/change`, params)
  
  saveRemark = (params: saveRemark) =>
    httpReq('post', `/client/order/remark/change`, params)
}

export default new requestUtil()