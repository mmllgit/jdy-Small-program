import {
  View,
  Image,
  Text,
  Button,
  Checkbox,
  Input,
  ITouchEvent,
  BaseEventOrig,
  InputProps,
} from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useRouter } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import { qiniuBaseUrl } from "../../utils/baseUrl";
import {
  AtImagePicker,
  AtMessage,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtModalAction,
  AtToast,
} from "taro-ui";
import { Signature } from "../../components";
import requestUtil from "../../utils/requestUtil";
import styles from "./progress.module.less";
import { GenNonDuplicateID, handleCopy } from "../../commonFunctions";

export default function Progress() {
  const cost = Taro.getStorageSync("Cost");
  const router = useRouter();
  const { orderId } = router.params;
  const extraFareRef = useRef();
  const reasonRef = useRef();
  const cancelRef = useRef();
  const [lockImage, setLockImage] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<any>();
  const [beforeFiles, setBeforeFiles] = useState<any[]>([]);
  const [afterFiles, setAfterFiles] = useState<any[]>([]);
  const [isExtra, setIsExtra] = useState<boolean>(false);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isShowCost, setIsShowCost] = useState<boolean>(true);
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

  const handleBeforeOnChange = (files: any[]) => {
    const len = files.length;
    if (beforeFiles.length > files.length) {
      return setBeforeFiles(files);
    }
    if (beforeFiles.length === 3) {
      return Taro.atMessage({
        message: "安装前照片最多上传三张",
        type: "warning",
      });
    }
    const uniqueId =
      "tmp" +
      "." +
      GenNonDuplicateID() +
      "." +
      files[len - 1].url.split(".")[1];
    try {
      Taro.uploadFile({
        url: qiniuBaseUrl,
        filePath: files[len - 1].url,
        name: "file",
        formData: {
          token: Taro.getStorageSync("AccessToken"),
          key: uniqueId,
        },
        success(res) {
          const { key, error } = JSON.parse(res.data);
          if (key) {
            Taro.atMessage({
              message: `上传安装前第${len}张照片成功`,
              type: "success",
            });
            files[len - 1].data = uniqueId;
            setBeforeFiles(files);
          } else {
            Taro.atMessage({
              message: error,
              type: "warning",
            });
          }
        },
        fail() {},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleAfterOnChange = (files: any[]) => {
    const len = files.length;
    if (afterFiles.length > files.length) {
      return setAfterFiles(files);
    }
    if (afterFiles.length === 3) {
      return Taro.atMessage({
        message: "安装后照片最多上传三张",
        type: "warning",
      });
    }
    const uniqueId =
      "tmp" +
      "." +
      GenNonDuplicateID() +
      "." +
      files[len - 1].url.split(".")[1];
    try {
      Taro.uploadFile({
        url: qiniuBaseUrl,
        filePath: files[len - 1].url,
        name: "file",
        formData: {
          token: Taro.getStorageSync("AccessToken"),
          key: uniqueId,
        },
        success(res) {
          const { key, error } = JSON.parse(res.data);
          if (key) {
            Taro.atMessage({
              message: `上传安装后第${len}张照片成功`,
              type: "success",
            });
            files[len - 1].data = uniqueId;
            setAfterFiles(files);
          } else {
            Taro.atMessage({
              message: error,
              type: "warning",
            });
          }
        },
        fail() {},
      });
    } catch (err) {
      console.log(err);
    }
  };

  const openModal = () => {
    setModal(true);
  };

  const handelModalCancel = () => {
    setModal(false);
  };

  const handleModalConfirm = () => {
    cancelOrder();
  };

  const cancelOrder = async () => {
    if (!(cancelRef.current as any).props.value) {
      return Taro.atMessage({
        message: "请填写取消原因",
        type: "warning",
      });
    }
    try {
      const res = await requestUtil.cancelOrder({
        id: orderId!,
        abnormal: (cancelRef.current as any).props.value,
      });
      if (res === "操作成功") {
        setModal(false);
        Taro.atMessage({
          message: "取消成功",
          type: "success",
        });
        Taro.redirectTo({
          url: `/pages/detail/detail?orderId=${orderId}`,
        });
      }
    } catch (err) {}
  };

  const getImageUrlStr = (files: any[]) => {
    let imageUrlStr = "";
    let i = 0;
    for (const item of files) {
      if (i === 0) {
        imageUrlStr = item.data;
      } else {
        imageUrlStr += `,${item.data}`;
      }
      i++;
    }
    return imageUrlStr;
  };

  const endOrder = async () => {
    if (
      beforeFiles.length === 0 ||
      afterFiles.length === 0 ||
      signatureUrl === "" ||
      (isExtra &&
        ((extraFareRef.current as any).props.value === "" ||
          (reasonRef.current as any).props.value === ""))
    ) {
      return Taro.atMessage({
        message: "请先完善信息",
        type: "warning",
      });
    }
    const before_image = getImageUrlStr(beforeFiles);
    const after_image = getImageUrlStr(afterFiles);
    const data = {
      id: orderId!,
      before_image,
      after_image,
      sign_image: signatureUrl,
    };
    if (isExtra) {
      data["extra_cost"] = `金额:${
        (extraFareRef.current as any).props.value
      },原因:${(reasonRef.current as any).props.value}`;
    }
    try {
      const res = await requestUtil.finishOrder(data);
      if (res === "操作成功") {
        Taro.atMessage({
          message: "结束订单成功",
          type: "success",
        });
        Taro.redirectTo({
          url: `/pages/detail/detail?orderId=${orderId}`,
        });
      }
    } catch (err) {}
  };

  const handleNoClick = () => {
    setIsExtra(!isExtra);
  };

  const getSignatureUrl = (signatureUrl: string) => {
    setSignatureUrl(signatureUrl);
  };

  // //点击地址复制
  // const handleCopy = () => {
  //   hand()
  // };

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

  useEffect(() => {
    getDetail();
  }, []);

  return loading ? (
    <AtToast
      isOpened={true}
      text={"加载中"}
      icon={"loading"}
      status={"loading"}
    ></AtToast>
  ) : (
    <View className={styles["detail-container"]}>
      <AtMessage></AtMessage>
      <AtModal isOpened={modal}>
        <AtModalHeader>是否取消订单？</AtModalHeader>
        <AtModalContent>
          <View className={styles["cancel-form"]}>
            <Text>*</Text>取消订单需填写取消原因
          </View>
          <Input className={styles["cancel-input"]} ref={cancelRef}></Input>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={() => handelModalCancel()}>取消</Button>
          <Button onClick={() => handleModalConfirm()}>确定</Button>
        </AtModalAction>
      </AtModal>
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
            <View style={{ color: "red" }}>
              <Text onClick={() => handleCopy(orderInfo?.phone_number)}>
                {orderInfo?.phone_number}
              </Text>
              <Button onClick={() => makePhoneCall(orderInfo?.phone_number)}>
                立即拨打，预约时间
              </Button>
            </View>
          </View>
        </View>
        <View className={styles["detail-order-message"]}>
          <View className={styles["order-start"]}>
            接单时间：
            <Text>{orderInfo?.start_order_time}</Text>
          </View>
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
              基础收益：
              <Text>{isShowCost ? cost : "**"}</Text>元
              <Text
                style={{ color: "rgba(198, 195, 195, 0.851)" }}
                onClick={() => setIsShowCost(!isShowCost)}
              >{`(点击${isShowCost ? "隐藏" : "显示"}金额)`}</Text>
            </View>
            <View onClick={() => contactService(orderInfo?.order_number)}>
              联系客服<Text className="at-icon at-icon-phone"></Text>
            </View>
          </View>
        </View>
        <View>
          <View className={styles["before-install-container"]}>
            <View className={styles["install-title"]}>
              <Text>安装进度</Text>
            </View>
            <View className={styles["before-tip"]}>安装前</View>
            <View className={styles["before-install"]}>
              <View className={styles["before-install-tips"]}>
                <View>
                  <Text>*</Text>请上传1~3张安装前的照片
                </View>
                <View>{beforeFiles.length}/3</View>
              </View>
              <AtImagePicker
                multiple={false}
                count={1}
                files={beforeFiles}
                onChange={(files) => handleBeforeOnChange(files)}
              />
              <View className={styles["extra-query-container"]}>
                <View className={styles["extra-query"]}>
                  <View className={styles["query-title"]}>
                    是否需要增加额外费用？
                  </View>
                  <Checkbox
                    className={styles["checkbox"]}
                    onClick={() => handleNoClick()}
                    value="0"
                    checked={!isExtra}
                  >
                    否
                  </Checkbox>
                  <Checkbox
                    className={styles["checkbox"]}
                    onClick={() => handleNoClick()}
                    value="1"
                    checked={isExtra}
                  >
                    是
                  </Checkbox>
                </View>
                {isExtra ? (
                  <View className={styles["extra-form"]}>
                    <View>
                      <Text>金额</Text>
                      <Input ref={extraFareRef} placeholder="请输入"></Input>
                      <Text>元</Text>
                    </View>
                    <View>
                      <Text>原因</Text>
                      <Input ref={reasonRef} placeholder="请输入"></Input>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <View className={styles["after-install-container"]}>
            <View className={styles["after-install"]}>安装后</View>
            <View className={styles["after-install-tips"]}>
              <View>
                <Text>*</Text>请上传1~3张安装后的照片
              </View>
              <View>{afterFiles.length}/3</View>
            </View>
            <AtImagePicker
              multiple={false}
              count={1}
              files={afterFiles}
              onChange={(files) => handleAfterOnChange(files)}
            />
            <View className={styles["user-sign"]}>
              <Text>*</Text>客户签字
              <Text className="at-icon at-icon-edit"></Text>
            </View>
            <View className={styles["user-sign-tip"]}>
              注：签字即代表安装验收合格，请仔细检查后签写！
            </View>
            <Signature getSignatureUrl={getSignatureUrl} />
          </View>
          <View className={styles["detail-buttons"]}>
            <Button onClick={() => openModal()}>取消订单</Button>
            <Button onClick={() => endOrder()}>结束订单</Button>
          </View>
        </View>
      </View>
    </View>
  );
}
