import { Button, View, Text } from "@tarojs/components";
import VirtualList from "@tarojs/components/virtual-list";
import React, { useState } from "react";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import { AtMessage, AtModal, AtToast } from "taro-ui";
import { hidePhoneNumber } from "../../commonFunctions";
import requestUtil from "../../utils/requestUtil";
import styles from "./index.module.less";
import "../../common.less";

interface rowProps {
  id: string;
  data: any[];
  index: number;
}

export default function Index() {
  let Flag = Taro.getStorageSync("Flag");
  const Cost = Taro.getStorageSync("Cost")
  const [canOrderList, setCanOrderList] = useState([]);
  const [atModal, setAtModal] = useState<boolean>(false);
  const [itemId, setItemId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleReset = () => {
    Taro.redirectTo({
      url: `/pages/register/register`,
    });
  };

  const getCanOrder = async () => {
    setLoading(true);
    try {
      const res = await requestUtil.getCanOrder();
      setCanOrderList(res);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  const modal = (itemId: string) => {
    setItemId(itemId);
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

  const handleApply = async () => {
    try {
      const res = await requestUtil.applyOrder({
        id: itemId,
        name: Taro.getStorageSync("Name"),
        cost: String(Cost)
      });
      if (res === "操作成功") {
        Taro.navigateTo({
          url: `/pages/detail/detail?orderId=${itemId}`,
        });
        Taro.atMessage({
          message: "接单成功",
          type: "success",
        });
      }
    } catch (err) {}
  };

  usePullDownRefresh(() => {
    Flag = Taro.getStorageSync("Flag");
    Flag === 2 && getCanOrder();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const handelDetail = (orderId: string) => {
    Taro.navigateTo({
      url: `/pages/detail/detail?orderId=${orderId}`,
    });
  };

  useDidShow(() => {
    Flag === 2 && getCanOrder();
  });

  const Row = React.memo(({ index, data }: rowProps) => {
    const orderItem = data[index];
    return (
      <View className={styles["index-item-list"]}>
        <View className={styles["item-message"]}>
          <View className={styles["item-type-money"]}>
            <View
              style={{
                backgroundColor:
                  orderItem.kind === "AZ" ? "#FACE95" : "#27B3F2",
              }}
            >
              {orderItem.kind === "AZ" ? "安装" : "维修"}
            </View>
            <View>￥{Cost}</View>
          </View>
          <View className={styles["item-address"]}>
            <View className="at-icon at-icon-map-pin"></View>
            <View>{orderItem.address}</View>
          </View>
          <View className={styles["item-user-message"]}>
            <View className="at-icon at-icon-user"></View>
            <View>{orderItem.name}</View>
            <View>{hidePhoneNumber(orderItem.phone_number)}</View>
          </View>
          <View className={styles["item-lock-message"]}>
            <View className="at-icon at-icon-lock"></View>
            <View>{orderItem.lock_kind}</View>
            <View>{orderItem.is_get_lock}</View>
          </View>
        </View>
        <View className={styles["index-item-buttons"]}>
          <View className={styles["button-container"]}>
            <Button onClick={() => modal(orderItem.Id)}>接单</Button>
            <Button onClick={() => handelDetail(orderItem.Id)}>查看详情</Button>
          </View>
        </View>
      </View>
    );
  });

  return Flag === 1 ? (
    <View className={styles["index-checking"]}>
      <View className={styles["checking-container"]}>
        <View>接单易</View>
        <View className="at-icon at-icon-bell">提示</View>
        <View>
          您的信息处于审核状态中，审核成功后重新进入小程序即可正常接单
        </View>
      </View>
    </View>
  ) : Flag === 3 ? (
    <View className={styles["index-checking"]}>
      <View className={styles["checking-container"]}>
        <View>接单易</View>
        <View className="at-icon at-icon-bell">提示</View>
        <View>您的信息审核未通过，点击下方按钮重新填写审核信息</View>
        <Button className={styles["btn"]} onClick={() => handleReset()}>
          填写信息
        </Button>
      </View>
    </View>
  ) : loading ? (
    <AtToast
      isOpened
      text="{加载中}"
      icon="{loading}"
      status="loading"
    ></AtToast>
  ) : canOrderList.length === 0 ? (
    <View className={styles["index-empty"]}>
      目前还没有可以接单的单子，请耐心等待
    </View>
  ) : (
    <View className={styles["index-container"]}>
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
      <View className={styles["index-title"]}>
        <View className="at-icon at-icon-map-pin">
          <Text>{Taro.getStorageSync("Address")}</Text>
        </View>
        <View>待接单列表</View>
      </View>
      <View className={styles["index-tabs-container"]}>
        <View className={styles["index-order-list"]}>
          <VirtualList
            height={840}
            width="100%"
            itemData={canOrderList}
            itemCount={canOrderList.length}
            itemSize={200}
          >
            {Row}
          </VirtualList>
        </View>
      </View>
    </View>
  );
}
