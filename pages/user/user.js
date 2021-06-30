var app = getApp();
//import { getRequest, postRequest } from '../../utils/wxAjax';
//import { wxApiInterceptors } from '../../utils/wxAjax';
const Api = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    giveAuthorization: false,
    // wxLoginInfo: null //这个跟缓存那个内容一样
  },
  clearStorage() {
    wx.showLoading({
      title: '清理缓存中..',
      mask: true,
    });    
    wx.removeStorageSync('token');
    wx.removeStorageSync('hasUserInfo');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('giveAuthorization');
    wx.removeStorageSync('wxLoginCode')
    wx.removeStorageSync('logs')
    wx.hideLoading();
    wx.showToast({
      title: '缓存清理成功!',
      icon: 'success',
      duration: 1000,
    });
  },
  getPhoneLogin(e) {
    const phoneIv = e.detail.iv; //手机的加密数据都在这个指定的button api中
    const phoneEncryptedData = e.detail.encryptedData;
    wx.request({
      url: Api.fetchWxRegisterLogin(),
      method: 'POST',
      data: {
        js_code: wx.getStorageSync('wxLoginCode').code,
        phoneEncryptedData: phoneEncryptedData,
        phoneIv: phoneIv,
        userEncryptedData: app.globalData.userEncryptedData,
        userIv: app.globalData.userIv,
      },
    }).then((apires) => {
      console.log(apires);
      wx.showLoading({
        title: '登录中...',
        mask: true,
      });
      wx.setStorageSync('token', apires.data.data.access_token);
      wx.request({
        url: Api.fetchGetUserInfo(),
        method: 'GET',
        header: {
          'content-type': 'application/json',
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
      }).then((api2res) => {
        wx.setStorageSync('cookie', api2res.header['set-cookie']);
        app.globalData.id = api2res.data.id;
        this.setData({
          userInfo: api2res.data,
          hasUserInfo: true,
        });
        wx.setStorageSync('userInfo', api2res.data);
        wx.setStorageSync('hasUserInfo', true);
        wx.hideLoading();
        wx.showToast({
          title: '登陆成功!',
          icon: 'success',
          duration: 1000,
        });
        wx.reLaunch({
          url: '/pages/index/index'
        })        
      });
    });
  },
  justLogin() {
    wx.request({
      url: Api.fetchWxRegisterLogin(),
      method: 'POST',
      data: {
        js_code: wx.getStorageSync('wxLoginCode').code,
      },
    }).then((apires) => {
      wx.showLoading({
        title: '登录中...',
        mask: true,
      });
      wx.setStorageSync('token', apires.data.data.access_token);
      wx.request({
        url: Api.fetchGetUserInfo(),
        method: 'GET',
        header: {
          'content-type': 'application/json',
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
      }).then((api2res) => {
        wx.setStorageSync('cookie', api2res.header['set-cookie']);
        app.globalData.id = api2res.data.id;
        this.setData({
          userInfo: api2res.data,
          hasUserInfo: true,
        });
        wx.setStorageSync('userInfo', api2res.data);
        wx.setStorageSync('hasUserInfo', true);
        wx.hideLoading();
        wx.showToast({
          title: '登陆成功!',
          icon: 'success',
          duration: 1000,
        });
        wx.reLaunch({
          url: '/pages/index/index'
        })        
      });
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
    this.wxLogin();
    this.setData({
      //用缓存配合路由守卫去控制app中的全局变量是最好的
      hasUserInfo: wx.getStorageSync('hasUserInfo'),
      userInfo: wx.getStorageSync('userInfo'),
      giveAuthorization: wx.getStorageSync('giveAuthorization'),
    });
    if (
      (wx.getStorageSync('token').length == 0 || !wx.getStorageSync('token')) &&
      wx.getStorageSync('hasUserInfo') === true
    ) {
      this.justLogin();
    }
    this.getIp();
  },
  //获取jscode保证wx.login为最先
  wxLogin() {
    wx.login({
      success: (res) => {
        wx.setStorageSync('wxLoginCode', res);
      },
    });
  },
  getUser() {
    wx.getUserProfile({
      desc: '用于完善获取资料且唤醒授权窗口',
      success: (res) => {
        app.globalData.userEncryptedData = res.encryptedData;
        app.globalData.userIv = res.iv;
        wx.setStorageSync('giveAuthorization', true);
        this.setData({
          giveAuthorization: true,
        });
      },
    });
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
