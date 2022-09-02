import { useState, useRef } from "react";
import {
  View,
  Text,
  Input,
  Picker,
  BaseEventOrig,
  InputProps,
  PickerRegionProps,
  Button,
} from "@tarojs/components";
import { AtImagePicker, AtMessage, AtModal, message } from "taro-ui";
import Taro from "@tarojs/taro";
import requestUtil from "../../utils/requestUtil";
import { qiniuBaseUrl } from "../../utils/baseUrl";
import { GenNonDuplicateID } from "../../commonFunctions";
import styles from "./register.module.less";
import "../../common.less";

export default function FrontPage() {
  const nameRef = useRef<BaseEventOrig<InputProps.inputEventDetail>>();
  const phoneRef = useRef<BaseEventOrig<InputProps.inputEventDetail>>();
  const [onFiles, setOnFiles] = useState<any[]>([]);
  const [onImageUrl, setOnImageUrl] = useState<string>("");
  const [underFiles, setUnderFiles] = useState<any[]>([]);
  const [underImageUrl, setUnderImageUrl] = useState<string>("");
  const [regionArray, setRegionArray] = useState<string[]>([]);
  const [regionString, setRegionString] = useState<string>("请选择");
  const [modal, setModal] = useState<boolean>(false);

  const handlePickerChange = (
    e: BaseEventOrig<PickerRegionProps.ChangeEventDetail>
  ) => {
    console.log(nameRef);
    setRegionArray(e.detail.value);
    const region = e.detail.value;
    if (region[0] === region[1]) {
      setRegionString(region[0]);
    } else {
      setRegionString(region[0] + region[1]);
    }
  };

  const handleOnChange = async (files) => {
    if (files.length === 2) {
      Taro.atMessage({
        message: "正面照只需上传一张",
        type: "warning",
      });
    } else if (files.length === 1) {
      setOnFiles(files);
      const uniqueId =
        "sta" + "." + GenNonDuplicateID() + "." + files[0].url.split(".")[1];
      try {
        Taro.uploadFile({
          url: qiniuBaseUrl,
          filePath: files[0].url,
          name: "file",
          formData: {
            token: Taro.getStorageSync("AccessToken"),
            key: uniqueId,
          },
          success(res) {
            const { key, error } = JSON.parse(res.data);
            if (key) {
              Taro.atMessage({
                message: "正面照上传成功",
                type: "success",
              });
              setOnImageUrl(uniqueId);
            } else {
              Taro.atMessage({
                message: error,
                type: "warning",
              });
            }
          },
          fail(err) {
            console.log(err);
          },
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      setOnFiles(files);
    }
  };

  const handleUnderChange = (files) => {
    if (files.length === 2) {
      Taro.atMessage({
        message: "反面照只需上传一张",
        type: "warning",
      });
    } else if (files.length === 1) {
      setUnderFiles(files);
      const uniqueId =
        "sta" + "." + GenNonDuplicateID() + "." + files[0].url.split(".")[1];
      try {
        Taro.uploadFile({
          url: qiniuBaseUrl,
          filePath: files[0].url,
          name: "file",
          formData: {
            token: Taro.getStorageSync("AccessToken"),
            key: uniqueId,
          },
          success(res) {
            const { key, error } = JSON.parse(res.data);
            if (key) {
              Taro.atMessage({
                message: "反面照上传成功",
                type: "success",
              });
              setUnderImageUrl(uniqueId);
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
    } else {
      setUnderFiles(files);
    }
  };

  const handleConfirm = () => {
    setModal(false);
    Taro.setStorageSync("Flag", 1);
    Taro.switchTab({
      url: "/pages/index/index",
    });
    Taro.requestSubscribeMessage({
      tmplIds: ["7UXX2ufJwUMGlzjpKJskoTxLwSqEvCubVDIsHP-VpdY"],
      success(res) {
        Taro.atMessage({
          message: "订阅成功",
          type: "success",
        });
      },
    });
  };

  const handleCommit = async () => {
    const name = (nameRef.current as any).props.value;
    const phone_number = (phoneRef.current as any).props.value;
    const reg = /^1[3-9][0-9]{9}$/g;
    if (
      !name ||
      regionString === "请选择" ||
      !phone_number ||
      !onImageUrl ||
      !underImageUrl
    ) {
      return Taro.atMessage({
        message: "请先完善信息",
        type: "warning",
      });
    }
    if (!reg.test(phone_number)) {
      return Taro.atMessage({
        message: "请输入正确的电话号码",
        type: "warning",
      });
    }
    try {
      const res = await requestUtil.register({
        open_id: Taro.getStorageSync("OpenID"),
        name,
        address: regionString,
        phone_number,
        identity_front_image: onImageUrl,
        identity_back_image: underImageUrl,
      });
      if (res) {
        setModal(true);
      }
    } finally {
    }
  };

  return (
    <View className={styles["register-container"]}>
      <AtModal
        isOpened={modal}
        title="提交成功"
        confirmText="确认"
        onConfirm={handleConfirm}
        content="审核完成后即可正常接单，请注意消息通知！"
      ></AtModal>
      <AtMessage></AtMessage>
      <View className={styles["register-title"]}>个人信息注册</View>
      <View className={styles["register-form"]}>
        <View className={styles["register-input"]}>
          <View className={styles["input-title"]}>
            <Text>*</Text>姓名
          </View>
          <Input ref={nameRef} placeholder="请填写姓名"></Input>
        </View>
        <View className={styles["register-region"]}>
          <View>
            <Text>*</Text>工作省份
          </View>
          <Picker
            value={regionArray}
            mode="region"
            onChange={(e) => handlePickerChange(e)}
          >
            <Text>{regionString}</Text>
          </Picker>
        </View>
        <View className={styles["register-input"]}>
          <View className={styles["input-title"]}>
            <Text>*</Text>手机号码
          </View>
          <Input ref={phoneRef} placeholder="请填写手机号码"></Input>
        </View>
        <View className={styles["register-photo"]}>
          <View className={styles["register-card"]}>
            <Text>*</Text>身份证照片上传
          </View>
          <View className={styles["register-image"]}>
            <View className={styles["card-title"]}>正面（国徽面）</View>
            <AtImagePicker
              multiple={false}
              count={1}
              files={onFiles}
              onChange={(files) => handleOnChange(files)}
            />
          </View>
          <View className={styles["register-image"]}>
            <View className={styles["card-title"]}>反面（人像面）</View>
            <AtImagePicker
              files={underFiles}
              onChange={(files) => handleUnderChange(files)}
              count={1}
            />
          </View>
        </View>
        <Button className={styles["btn"]} onClick={() => handleCommit()}>
          提交
        </Button>
      </View>
    </View>
  );
}
