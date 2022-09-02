import React, { useState } from "react";
import { View, Button } from "@tarojs/components";
import VirtualList from "@tarojs/components/virtual-list";
import { AtTabs, AtTabsPane, AtSearchBar, AtMessage, AtToast } from "taro-ui";
import Taro, { useDidShow, usePullDownRefresh } from "@tarojs/taro";
import requestUtil from "../../utils/requestUtil";
import styles from "./myOrder.module.less";

export default function MyOrder() {
  const tabList = [
    { title: "进行中" },
    { title: "全部订单" },
    { title: "已完成" },
    { title: "已取消" },
  ];

  const [current, setCurrent] = useState<number>(0);
  const [dataList, setDataList] = useState<any>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearch, setIsSearch] = useState<boolean>(false);
  const [searchOrderList, setSearchOrderList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = (index: number) => {
    setCurrent(index);
  };

  const getMyOrder = async () => {
    setIsLoading(true);
    try {
      const res = await requestUtil.getMyOrder();
      const tabsList: any = [];
      tabsList[0] = res[1];
      tabsList[1] = res[0];
      tabsList[2] = res[2];
      tabsList[3] = res[3];
      setDataList(tabsList);
      setIsLoading(false);
    } catch (err) {}
  };

  const buttonContent = (status: number) => {
    if (status === 1) {
      return "去完成";
    } else {
      return "查看详情";
    }
  };

  const buttonClassName = (status: number) => {
    if (status === 1) {
      return "to-do-style";
    } else {
      return "to-check-style";
    }
  };

  const emptyContent = (index: number) => {
    if (index === 0) {
      return "没有正在进行中的单子，快去接单吧！";
    } else {
      return "这里什么也没有，快去接单吧！";
    }
  };

  const handleClickButton = (status: number, id: string) => {
    if (status === 1) {
      Taro.navigateTo({
        url: `/pages/progress/progress?orderId=${id}`,
      });
    } else {
      Taro.navigateTo({
        url: `/pages/detail/detail?orderId=${id}`,
      });
    }
  };

  const signType = (index: number) => {
    let type: string = "";
    switch (index) {
      case 1:
        type = "未完成";
        break;
      case 2:
        type = "已完成";
        break;
      case 3:
        type = "已取消";
      default:
        break;
    }
    return type;
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const onSearchClear = () => {
    setIsSearch(false);
    setSearchValue("");
  };

  const searchBack = () => {
    onSearchClear();
    getMyOrder();
  };

  const onSearchConfirm = async () => {
    const reg = /^1[3-9][0-9]{9}$/g;
    if (!reg.test(searchValue)) {
      return Taro.atMessage({
        message: "请输入正确的电话号码",
        type: "warning",
      });
    }
    setIsLoading(true);
    try {
      const res = await requestUtil.searchOrder({
        phone: searchValue,
      });
      setIsSearch(true);
      setSearchOrderList(res);
      setIsLoading(false);
    } catch (err) {}
  };

  usePullDownRefresh(() => {
    getMyOrder();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  useDidShow(() => {
    getMyOrder();
  });

  const Row = React.memo(({ index, data }: any) => {
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
            {current === 1 || isSearch ? (
              <View
                style={{
                  color:
                    orderItem?.order_status === 2
                      ? "#27B3F2"
                      : "rgb(230, 18, 18)",
                }}
              >
                {signType(orderItem?.order_status)}
              </View>
            ) : current === 2 ? (
              <View
                style={{
                  color:
                    orderItem?.user_flag === "1"
                      ? "rgb(82, 196, 26)"
                      : "rgb(222, 151, 9)",
                }}
              >
                {orderItem?.user_flag === "1" ? "已结账" : "未结账"}
              </View>
            ) : null}
          </View>
          <View className={styles["item-address"]}>
            <View className="at-icon at-icon-map-pin"></View>
            <View>{orderItem.address}</View>
          </View>
          <View className={styles["item-user-message"]}>
            <View className="at-icon at-icon-user"></View>
            <View>{orderItem.name}</View>
            <View>{orderItem.phone_number}</View>
          </View>
          <View className={styles["item-lock-message"]}>
            <View className="at-icon at-icon-lock"></View>
            <View>{orderItem.lock_kind}</View>
            <View>{orderItem.is_get_lock}</View>
          </View>
          <View className={styles["teacher-mark"]}>
            <View className="at-icon at-icon-bookmark"></View>
            <View
              style={{ color: orderItem?.user_remark !== "" ? "rgb(82, 196, 26)" : "rgb(222, 151, 9)" }}
              onClick={() =>
                handleClickButton(orderItem.order_status, orderItem.Id)
              }
            >
              {orderItem?.user_remark !== ""
                ? orderItem?.user_remark
                : "前往添加备注"}
            </View>
          </View>
        </View>
        <View className={styles["item-last"]}>
          <View>￥{Taro.getStorageSync("Cost")}</View>
          <Button
            onClick={() =>
              handleClickButton(orderItem.order_status, orderItem.Id)
            }
            className={styles[buttonClassName(orderItem.order_status)]}
          >
            {buttonContent(orderItem.order_status)}
          </Button>
        </View>
      </View>
    );
  });

  return (
    <View>
      <View className={styles["custom-header"]}>
        {isSearch ? (
          <View
            onClick={() => searchBack()}
            className="at-icon at-icon-chevron-left"
          >
            返回
          </View>
        ) : (
          <View></View>
        )}
        <View>我的订单</View>
        <View></View>
      </View>
      <AtMessage className={styles["at-message--warning"]} />
      <AtSearchBar
        showActionButton
        value={searchValue}
        onChange={(e) => onSearchChange(e)}
        onActionClick={() => onSearchConfirm()}
        placeholder="输入客户电话号码查找订单"
        onClear={() => onSearchClear()}
      />

      {isSearch ? (
        isLoading ? (
          <AtToast
            isOpened
            text="{加载中}"
            icon="{loading}"
            status="loading"
          ></AtToast>
        ) : (
          <View className={styles["index-tabs-container"]}>
            <View className={styles["index-order-list"]}>
              {searchOrderList.length === 0 ? (
                <View
                  className={styles["index-empty"]}
                  style={{ fontSize: "24rpx" }}
                >
                  未找到该用户的相关订单，请检查查询号码是否正确!
                </View>
              ) : (
                <VirtualList
                  height={
                    searchOrderList.length > 4
                      ? 1000
                      : searchOrderList.length * 250
                  }
                  width="100%"
                  itemData={searchOrderList}
                  itemCount={searchOrderList.length}
                  itemSize={250}
                >
                  {Row}
                </VirtualList>
              )}
            </View>
          </View>
        )
      ) : isLoading ? (
        <AtToast
          isOpened
          text="{加载中}"
          icon="{loading}"
          status="loading"
        ></AtToast>
      ) : (
        <AtTabs
          current={current}
          tabList={tabList}
          onClick={(index) => handleClick(index)}
        >
          {dataList.map((typeItem, index) => {
            return (
              <AtTabsPane current={current} index={index}>
                <View className={styles["index-tabs-container"]}>
                  <View className={styles["index-order-list"]}>
                    {typeItem.length === 0 ? (
                      <View className={styles["index-empty"]}>
                        {emptyContent(index)}
                      </View>
                    ) : (
                      <VirtualList
                        height={
                          typeItem.length > 4 ? 1000 : typeItem.length * 250
                        }
                        width="100%"
                        itemData={typeItem}
                        itemCount={typeItem.length}
                        itemSize={250}
                      >
                        {Row}
                      </VirtualList>
                    )}
                  </View>
                </View>
              </AtTabsPane>
            );
          })}
        </AtTabs>
      )}
    </View>
  );
}
