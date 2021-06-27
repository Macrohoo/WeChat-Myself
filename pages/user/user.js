var app = getApp();
//import { getRequest, postRequest } from '../../utils/wxAjax';
//import { wxApiInterceptors } from '../../utils/wxAjax';
const Api = require('../../utils/api');
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    waitingLoad: false,  //遮罩层
    // wxLoginInfo: null //这个跟缓存那个内容一样
  },
  getUserInfo() {
    var that = this;
    wx.getUserProfile({
      desc: '用于完善获取资料且唤醒授权窗口',
      success: function (res) {
        console.log(res);
        app.globalData.userInfo = res.userInfo;
        app.globalData.hasUserInfo = true;
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
        wx.setStorageSync('userInfo', res.userInfo)
        wx.setStorageSync('hasUserInfo', true)
        wx.showLoading({
          title: '登录中...',
          mask: true
        })       
        wx.login({
          success: function (res) {
            wx.setStorageSync('wxLoginInfo', res);
            //console.log({haha : wx.getStorageSync('wxLoginInfo')})
            wx.request({
              url: Api.fetchWxRegisterLogin(),
              method: 'POST',
              data: {
                js_code: wx.getStorageSync('wxLoginInfo').code,
                userInfo: app.globalData.userInfo,
              },
            }).then((apires) => {
              wx.setStorageSync('token', apires.data.data.access_token);
              wx.request({
                url: Api.fetchGetUserInfo(),
                method: 'GET',
                header: {
                  'content-type': 'application/json',
                  Authorization: `Bearer ${wx.getStorageSync('token')}`,
                },
              }).then((api2res) => {
                console.log(api2res);
                wx.setStorageSync('cookie', api2res.header['set-cookie']);
                app.globalData.id = api2res.data.id
                wx.hideLoading()
                wx.showToast({
                  title: '登陆成功!',
                  icon: 'success',
                  duration: 1000
                })                               
              });
            });
          },
        });
      },
    });
  },
  getIp() {
    wx.request({
      url: 'http://pv.sohu.com/cityjson?ie=utf-8',
      method: 'GET',
    }).then((res) => {
      let str = res.data.slice(20, -2).replace(/\"/g, '');
      app.globalData.payer_client_ip = str;
      //console.log(app.globalData.payer_client_ip);
    });
  },
  onLoad: function () {
    this.setData({
      //用缓存配合路由守卫去控制app中的全局变量是最好的
      hasUserInfo: wx.getStorageSync('hasUserInfo'),
      userInfo: wx.getStorageSync('userInfo'),
    });
    this.getIp();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
