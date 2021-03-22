// pages/user/user.js
var app = getApp()
import {getRequest, postRequest} from '../../utils/wxAjax'
const Api = require('../../utils/api')
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
        //console.log({haha : wx.getStorageSync('wxLoginInfo')})
        wx.getUserInfo({
          success: function(res) {
            app.globalData.userInfo = res.userInfo
            app.globalData.hasUserInfo = true
            that.setData({
              userInfo: res.userInfo,
              hasUserInfo: true
            })            
            postRequest(Api.fetchOpenid(), {js_code: wx.getStorageSync('wxLoginInfo').code}).then(apires => {
              app.globalData.openid = apires.data.openid
              postRequest(Api.fetchWxLogin(), {openid: app.globalData.openid}).then(api2res => {
                //console.log(api2res)
                wx.setStorageSync('token', api2res.data.data.access_token)
                //console.log(wx.getStorageSync('token'))
                getRequest(Api.fetchGetUserInfo(), null, wx.getStorageSync('token')).then(api3res => {
                  console.log(api3res)
                })
              })
            })
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