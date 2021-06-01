// pages/user/user.js
var app = getApp();
//import { getRequest, postRequest } from '../../utils/wxAjax';
//import { wxApiInterceptors } from '../../utils/wxAjax';
const Api = require('../../utils/api');
//const Auth = require('../../utils/auth')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    // wxLoginInfo: null //这个跟缓存那个内容一样
  },
  getUserInfo() {
    var that = this;
    wx.getUserProfile({
      desc: '用于完善获取资料且唤醒授权窗口',
      success: function (res) {
        app.globalData.userInfo = res.userInfo;
        app.globalData.hasUserInfo = true;
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
        wx.login({
          success: function (res) {
            wx.setStorageSync('wxLoginInfo', res);
            //console.log({haha : wx.getStorageSync('wxLoginInfo')})
            wx.request({
              url: Api.fetchOpenid(),
              method: 'POST',
              data: { js_code: wx.getStorageSync('wxLoginInfo').code },
            }).then((apires) => {
              wx.request({
                url: Api.fetchWxLogin(),
                method: 'POST',
                data: { openid: apires.data.openid },
              }).then((api2res) => {
                wx.setStorageSync('token', api2res.data.data.access_token);
                wx.request({
                  url: Api.fetchGetUserInfo(),
                  method: 'GET',
                  header: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${wx.getStorageSync('token')}`,
                  },
                }).then((api3res) => {
                  console.log(api3res);
                  wx.setStorageSync('cookie', api3res.header['set-cookie']);
                });
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
      console.log(app.globalData.payer_client_ip);
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo,
    });
    this.getIp();
    //console.log(this.data.userInfo)
    //console.log(app.globalData.userInfo);
    //console.log(app.globalData.hasUserInfo)
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
