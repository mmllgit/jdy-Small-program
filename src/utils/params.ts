export interface pushLogin {
  code: string;
}

export interface register {
  open_id: string;
  name: string;
  address: string;
  phone_number: string;
  identity_front_image: string;
  identity_back_image: string;
}

export interface applyOrder {
  id: string;
  name: string;
  cost: string;
}

export interface getDetail {
  id: string;
}

export interface finishOrder {
  id: string;
  before_image: string;
  after_image: string;
  sign_image: string;
  extra_cost?: string;
}

export interface cancelOrder {
  id: string;
  abnormal: string;
}

export interface searchOrder {
  phone: string;
}

export interface changeFlag {
  id: string;
  flag: string;
}

export interface saveRemark {
  id: string;
  remark: string;
}
