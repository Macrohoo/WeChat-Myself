import {getRequest, postRequest} from './utils/wxAjax'
const Api = require('./utils/api')
// app.js
App({
  onLaunch() {
    var that = this
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: '已经有新版本了哟~',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
    //微信登录写在小程序初始化时，小程序打开就会呼出登录
    wx.login({
      success: function(res) {
        wx.setStorageSync('wxLoginInfo', res)
        console.log({haha : wx.getStorageSync('wxLoginInfo')})
        wx.getUserInfo({
          success: function(res) {
            that.globalData.userInfo = res.userInfo
            that.globalData.hasUserInfo = true
            postRequest(Api.fetchOpenid(), {js_code: wx.getStorageSync('wxLoginInfo').code}).then(apires => {
              that.globalData.openid = apires.data.openid
              postRequest(Api.fetchWxLogin(), {openid: that.globalData.openid}).then(api2res => {
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
  globalData: {
    hasUserInfo: false,
    userInfo: null,
    openid: "",
    isGetUserInfo: false,
    isGetOpenid: false
  }
})
