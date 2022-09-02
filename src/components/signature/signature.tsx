import React, { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { View, Button, Canvas, CanvasTouchEvent } from "@tarojs/components";
import styles from "./signature.module.less";
import { qiniuBaseUrl } from "../../utils/baseUrl";
import { GenNonDuplicateID } from "../../commonFunctions/randomId";

interface IProps {
  getSignatureUrl: Function;
}

export const Signature: React.FC<IProps> = ({ getSignatureUrl }: IProps) => {
  const ctx: Taro.CanvasContext = Taro.createCanvasContext("canvas");
  ctx.setStrokeStyle("#000");
  ctx.setFillStyle("#fff");
  ctx.setLineWidth(4);
  ctx.setLineCap("round");
  ctx.setLineJoin("round");
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);
  const [isPaint, setIsPaint] = useState<boolean>(false);
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [isFinish, setIsFinish] = useState<boolean>(false);

  const canvasStart = (e: CanvasTouchEvent) => {
    setStartX(e.changedTouches[0].x);
    setStartY(e.changedTouches[0].y);
    ctx.beginPath();
  };

  const canvasMove = (e: CanvasTouchEvent) => {
    if (startX !== 0) {
      setIsPaint(true);
    }
    const x = e.changedTouches[0].x;
    const y = e.changedTouches[0].y;
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.draw(true);
    setStartX(x);
    setStartY(y);
  };

  // 取消
  const clearDraw = () => {
    setStartX(0);
    setStartY(0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.draw(true);
    setIsPaint(false);
    getSignatureUrl("");
  };

  const createImg = () => {
    if (!isPaint) {
      Taro.atMessage({
        message: "签名内容不能为空！",
        type: "error",
      });
      return false;
    }

    // 生成图片
    Taro.canvasToTempFilePath({
      canvasId: "canvas",
      success: (res) => {
        const { tempFilePath } = res;
        const uniqueId =
          "tmp" + "." + GenNonDuplicateID() + "." + tempFilePath.split(".")[1];
        Taro.uploadFile({
          url: qiniuBaseUrl,
          filePath: tempFilePath,
          name: "file",
          formData: {
            token: Taro.getStorageSync("AccessToken"),
            key: uniqueId,
          },
          success(res) {
            const { key, error } = JSON.parse(res.data);
            if (key) {
              Taro.atMessage({
                message: "上传签名成功",
                type: "success",
              });
              getSignatureUrl(uniqueId);
              setIsFinish(true);
            } else {
              Taro.atMessage({
                message: error,
                type: "warning",
              });
            }
          },
          fail() {},
        });
      },
      fail(err) {
        console.log(err);
      },
    });
  };

  // 获取 canvas 的尺寸（宽高）
  const getCanvasSize = () => {
    const query = Taro.createSelectorQuery().select("#canvas");
    setTimeout(() => {
      query
        .boundingClientRect((res) => {
          const { width, height } = res;
          setCanvasWidth(width);
          setCanvasHeight(height);
        })
        .exec();
    }, 1000);
  };

  const resetSignature = () => {
    setStartX(0);
    setStartY(0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.draw(true);
    setIsPaint(false);
    setIsFinish(false);
    getSignatureUrl("");
  };

  useEffect(() => {
    getCanvasSize();
  }, []);

  return (
    <View className={styles["signature"]}>
      <View className={styles["canvas-box"]}>
        <Canvas
          id="canvas"
          canvasId="canvas"
          className={styles["canvas"]}
          disableScroll={true}
          onTouchStart={(e) => canvasStart(e)}
          onTouchMove={(e) => canvasMove(e)}
        ></Canvas>
      </View>
      <View className={styles["buttons"]}>
        {!isFinish && (
          <Button className={styles["cancel"]} onClick={() => clearDraw()}>
            清除
          </Button>
        )}
        {!isFinish && (
          <Button className={styles["confirm"]} onClick={() => createImg()}>
            完成签名
          </Button>
        )}
        {isFinish && (
          <Button className={styles["reset"]} onClick={() => resetSignature()}>
            重新签名
          </Button>
        )}
      </View>
    </View>
  );
};
