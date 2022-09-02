import Taro from "@tarojs/taro";
export const handleCopy = (data: string) => {
  Taro.setClipboardData({
    data,
  });
};
