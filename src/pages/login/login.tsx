import { useState } from "react";
import Taro, { useDidShow } from "@tarojs/taro";
import { Button, View } from "@tarojs/components";
import styles from "./login.module.less";
import requestUtil from "../../utils/requestUtil";
import { AtMessage, AtToast } from "taro-ui";

export default function login() {
  const [loading, setLoading] = useState<boolean>(false);

  const pushLogin = () => {
    setLoading(true)
    Taro.setStorageSync("firstFlag", 1);
    Taro.login({
      async success(resCode) {
        const { code } = resCode;
        try {
          const res = await requestUtil.pushLogin({
            code,
          });
          const { Flag, OpenID, Token, Address, Name, Cost, AccessToken } = res;
          Taro.atMessage({
            message: res,
            type: "success",
          });
          Taro.setStorageSync("Token", Token);
          Taro.setStorageSync("Address", Address);
          Taro.setStorageSync("Name", Name);
          Taro.setStorageSync("Cost", Cost);
          Taro.setStorageSync("Flag", Flag);
          Taro.setStorageSync("AccessToken", AccessToken);
          Taro.setStorageSync("OpenID", OpenID);
          if (Flag === 0) {
            Taro.redirectTo({
              url: `/pages/register/register`,
            });
          } else {
            Taro.switchTab({
              url: `/pages/index/index`,
            });
          }
          setLoading(false);
        } catch (err) {
          console.log(err);
        }
      },
    });
  };

  useDidShow(() => {
    setLoading(true);
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          setLoading(false);
          Taro.showModal({
            title: "更新提示",
            content: "接单易新版本已经准备好，重启以使用新版本",
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            },
          });
        });
      } else if(Taro.getStorageSync("firstFlag")){
        return pushLogin();
      } else {
        setLoading(false)
      }
    })
  });

  return loading ? (
    <AtToast
      isOpened={true}
      text={"加载中"}
      icon={"loading"}
      status={"loading"}
    ></AtToast>
  ) : (
    <View className={styles["login-container"]}>
      <AtMessage></AtMessage>
      <Button className={styles["login-button"]} onClick={() => pushLogin()}>
        一键登录授权
      </Button>
    </View>
  );
}
