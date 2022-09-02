export default defineAppConfig({
  pages: [
    'pages/login/login',
    'pages/index/index',
    'pages/myOrder/myOrder',
    'pages/register/register',
    'pages/detail/detail',
    'pages/progress/progress'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black',
    enablePullDownRefresh: true,
  },
  tabBar: {
    color: "#bfbfbf",
    selectedColor: "#515151",
    backgroundColor: "#FBFBFB",
    borderStyle: "white",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        iconPath: "./assets/icon/index.png",
        selectedIconPath: "./assets/icon/index-active.png",
      },
      {
        pagePath: "pages/myOrder/myOrder",
        text: "我的订单",
        iconPath: "./assets/icon/myOrder.png",
        selectedIconPath: "./assets/icon/myOrder-active.png",
      }
    ]
  }
})
