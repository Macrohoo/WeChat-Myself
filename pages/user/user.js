// pages/user/user.js
var app = getApp()
//const Auth = require('../../utils/auth')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    openid:'',
    hasUserInfo: false
  },
  getUserInfo(){
    var that = this
    //调用微信登录
    wx.login({
      success: function(res) {
        wx.setStorageSync('wxLoginInfo', res)
        wx.getUserInfo({
          success: function(res) {
            app.globalData.userInfo = res.userInfo
            that.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })
            console.log(that.data)
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      hasUserInfo: app.globalData.hasUserInfo,
      userInfo: app.globalData.userInfo
    })
    //console.log(this.data.userInfo)
    console.log(app.globalData.userInfo)
    //console.log(app.globalData.hasUserInfo)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})