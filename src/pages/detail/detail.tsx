import {
  View,
  Image,
  Button,
  Text,
  Input,
  BaseEventOrig,
  InputProps,
} from "@tarojs/components";
import Taro, { useDidShow, usePullDownRefresh, useRouter } from "@tarojs/taro";
import { useState } from "react";
import { handleCopy } from "../../commonFunctions";
import { AtMessage, AtModal, AtToast } from "taro-ui";
import requestUtil from "../../utils/requestUtil";
import styles from "./detail.module.less";

export default function detail() {
  const router = useRouter();
  const { orderId } = router.params;
  const Cost = Taro.getStorageSync("Cost");
  const [lockImage, setLockImage] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<any>();
  const [atModal, setAtModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInputRemark, setIsInputRemark] = useState<boolean>(false);
  const [remarkInput, setRemarkInput] = useState<string>("");
  const [initRemark, setInitRemark] = useState<string>("");

  const getDetail = async () => {
    setLoading(true);
    try {
      const res = await requestUtil.getDetail({
        id: orderId!,
      });
      const { LockImage, OrderInfo } = res;
      setLockImage(LockImage);
      setOrderInfo(OrderInfo);
      setLoading(false);
    } catch (err) {}
  };

  const hidePhoneNumber = (phoneNumber: string, status: number) => {
    if (status === 0) {
      return phoneNumber.slice(0, 3) + "****" + phoneNumber.slice(7, 11);
    } else {
      return phoneNumber;
    }
  };

  const handleApply = async () => {
    try {
      const res = await requestUtil.applyOrder({
        id: orderInfo?.Id,
        name: Taro.getStorageSync("Name"),
        cost: String(Cost),
      });
      if (res === "操作成功") {
        Taro.atMessage({
          type: "success",
          message: "接单成功",
        });
        getDetail();
      }
    } catch (err) {}
  };

  const modal = () => {
    setAtModal(true);
  };

  const handleConfirm = () => {
    setAtModal(false);
    handleApply();
  };

  const handleClose = () => {
    setAtModal(false);
  };

  const handleCancel = () => {
    setAtModal(false);
  };

  const makePhoneCall = (phoneNumber: string) => {
    Taro.makePhoneCall({
      phoneNumber,
    });
  };

  const contactService = (orderNumber: string) => {
    Taro.makePhoneCall({
      phoneNumber: orderNumber,
    });
  };

  const toFinish = () => {
    Taro.navigateTo({
      url: `/pages/progress/progress?orderId=${orderId}`,
    });
  };

  const backIndex = () => {
    Taro.switchTab({
      url: "/pages/index/index",
    });
  };

  //改变订单是否结账
  const changeFlag = async () => {
    try {
      const res = await requestUtil.changeFlag({
        id: orderId!,
        flag: orderInfo?.user_flag === "1" ? "0" : "1",
      });
      getDetail();
      Taro.atMessage({
        message: "更新标记成功",
        type: "success",
      });
    } catch (err) {}
  };

  //保存备注
  const saveRemark = async () => {
    if (remarkInput === "") {
      return Taro.atMessage({
        type: "warning",
        message: "备注内容不能为空",
      });
    }
    if (remarkInput === initRemark) {
      return setIsInputRemark(false);
    }
    try {
      const res = await requestUtil.saveRemark({
        id: orderId!,
        remark: remarkInput,
      });
      getDetail();
      Taro.atMessage({
        type: "success",
        message: "保存成功",
      });
    } catch (err) {}
    setIsInputRemark(false);
  };

  //输入备注
  const handleRemarkInput = (e: BaseEventOrig<InputProps.inputEventDetail>) => {
    setRemarkInput(e.detail.value);
  };

  //点击输入备注
  const handleUpdateRemark = () => {
    setInitRemark(orderInfo?.user_remark);
    setRemarkInput(orderInfo?.user_remark);
    setIsInputRemark(true);
  };

  usePullDownRefresh(() => {
    getDetail();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  useDidShow(() => {
    getDetail();
  });

  return loading ? (
    <AtToast
      isOpened
      text="{加载中}"
      icon="{loading}"
      status="loading"
    ></AtToast>
  ) : (
    <View className={styles["detail-container"]}>
      <AtMessage></AtMessage>
      <AtModal
        isOpened={atModal}
        title="接单"
        cancelText="取消"
        confirmText="确认"
        onConfirm={handleConfirm}
        onClose={handleClose}
        onCancel={handleCancel}
        content="确定接单吗?"
      />
      <View className={styles["detail"]}>
        <View className={styles["detail-shop-message"]}>
          <View className={styles["detail-shop-title"]}>商品信息</View>
          <View className={styles["shop-detail"]}>
            <View className={styles["shop-image"]}>
              <Image src={lockImage}></Image>
            </View>
            <View className={styles["shop-info"]}>
              <View>
                型号：<Text>{orderInfo?.lock_kind}</Text>
              </View>
              <View>
                数量：<Text>{orderInfo?.lock_num}</Text>
              </View>
              <View>
                是否到货：<Text>{orderInfo?.is_get_lock}</Text>
              </View>
              <View>
                包裹数：<Text>{orderInfo?.pkg_num}</Text>
              </View>
            </View>
          </View>
        </View>
        <View className={styles["detail-user-message"]}>
          <View className={styles["detail-user-title"]}>客户信息</View>
          <View className={styles["user-name"]}>
            <View className="at-icon at-icon-user"></View>
            <View onClick={() => handleCopy(orderInfo?.name)}>
              {orderInfo?.name}
            </View>
          </View>
          <View className={styles["user-address"]}>
            <View className="at-icon at-icon-map-pin"></View>
            <View onClick={() => handleCopy(orderInfo?.address)}>
              {orderInfo?.address}
            </View>
          </View>
          <View className={styles["user-phone"]}>
            <View className="at-icon at-icon-phone"></View>
            <View
              style={{ color: orderInfo?.order_status ? "red" : "#242323" }}
            >
              <Text
                onClick={() =>
                  handleCopy(
                    hidePhoneNumber(
                      orderInfo?.phone_number,
                      orderInfo?.order_status
                    )
                  )
                }
              >
                {hidePhoneNumber(
                  orderInfo?.phone_number,
                  orderInfo?.order_status
                )}
              </Text>
              {orderInfo?.order_status === 0 ? (
                <Text>(接单后可查看全部号码)</Text>
              ) : (
                <Button onClick={() => makePhoneCall(orderInfo?.phone_number)}>
                  立即拨打，预约时间
                </Button>
              )}
            </View>
          </View>
        </View>
        <View className={styles["detail-order-message"]}>
          <View className={styles["order-start"]}>
            接单时间：
            <Text>{orderInfo?.start_order_time}</Text>
          </View>
          <View className={styles["order-start"]}>
            完工时间：
            <Text>{orderInfo?.finish_order_time}</Text>
          </View>
          {orderInfo?.order_status === 2 && (
            <View className={styles["order-flag"]}>
              <View>
                是否结账：
                <Text
                  style={{
                    color:
                      orderInfo?.user_flag === "1"
                        ? "rgb(82, 196, 26)"
                        : "rgb(222, 151, 9)",
                  }}
                >
                  {orderInfo?.user_flag === "1" ? "已结账" : "未结账"}
                </Text>
              </View>
              <View onClick={() => changeFlag()}>点击切换</View>
            </View>
          )}
          <View className={styles["order-remark"]}>
            商家备注：
            <Text>{orderInfo?.remark === "" ? "无" : orderInfo?.remark}</Text>
          </View>
          <View className={styles["user-remark-container"]}>
            <View className={styles["remark-title"]}>个人备注：</View>
            <View className={styles["user-remark"]}>
              {isInputRemark ? (
                <View className={styles["user-input"]}>
                  <Input
                    value={remarkInput}
                    onInput={(e) => handleRemarkInput(e)}
                  ></Input>
                  <View
                    className={styles["remark-button"]}
                    onClick={() => saveRemark()}
                  >
                    保存
                  </View>
                </View>
              ) : (
                <View className={styles["user-text"]}>
                  <View>{orderInfo?.user_remark}</View>
                  <View
                    className={styles["remark-button"]}
                    onClick={() => handleUpdateRemark()}
                  >
                    {orderInfo?.user_remark === "" ? "添加" : "修改"}备注
                  </View>
                </View>
              )}
            </View>
          </View>
          <View className={styles["order-info"]}>
            <View>
              基础收益：<Text>{Cost}</Text>元
            </View>
            <View onClick={() => contactService(orderInfo?.order_number)}>
              联系客服<Text className="at-icon at-icon-phone"></Text>
            </View>
          </View>
        </View>
        {orderInfo?.order_status === 0 ? (
          <View className={styles["detail-buttons"]}>
            <Button onClick={() => backIndex()}>回到首页</Button>
            <Button onClick={() => modal()}>接单</Button>
          </View>
        ) : orderInfo?.order_status === 1 ? (
          <View className={styles["detail-buttons"]}>
            <Button onClick={() => backIndex()}>回到首页</Button>
            <Button onClick={() => toFinish()}>去完成</Button>
          </View>
        ) : orderInfo?.order_status === 2 ? (
          <View className={styles["done-order"]}>
            <View className={styles["done-progress"]}>
              <View>
                <Text>安装进度</Text>
              </View>
              <View>安装前现场照片：</View>
              <View>
                {orderInfo?.before_image.map((imgUrl, imgIndex) => {
                  return <Image src={imgUrl}></Image>;
                })}
              </View>
              <View>额外费用说明：</View>
              <View
                style={{
                  color:
                    orderInfo?.extra_cost === "" ? "#000" : "rgb(230, 18, 18)",
                }}
              >
                {orderInfo?.extra_cost === "" ? "无" : orderInfo?.extra_cost}
              </View>
            </View>
            <View className={styles["after-image"]}>
              <View>安装后现场照片：</View>
              <View>
                {orderInfo?.after_image.map((imgUrl, imgIndex) => {
                  return <Image src={imgUrl}></Image>;
                })}
              </View>
              <View>客户签名：</View>
              <Image
                className={styles["user-sign"]}
                src={orderInfo?.sign_image}
              ></Image>
            </View>
          </View>
        ) : orderInfo?.order_status === 3 ? (
          <View className={styles["cancel-reason"]}>
            <View>取消原因：</View>
            <View>{orderInfo?.abnormal}</View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
