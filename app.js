// import {getRequest, postRequest} from './utils/wxAjax'
// const Api = require('./utils/api')
// app.js
import wxApiInterceptors from './utils/wxAjax';

wxApiInterceptors({
  request: {
    response(res) {
      if(res.statusCode == 200 && res.data.code == 11000) {
        wx.setStorageSync('token', res.data.data.access_token)
        wx.reLaunch({
          url: '/pages/user/user'
        })        
      } else if (res.statusCode == 401 && res.data.code == 10000) {
        wx.removeStorageSync('token')
        getApp().globalData.hasUserInfo = false
        getApp().globalData.userInfo = null
        wx.reLaunch({
          url: '/pages/user/user'
        })
      } else {
        return Promise.resolve(res)
      }
    }
  }
})

App({
  //引入towxml3.0
  towxml:require('./towxml/index'),
  onLaunch() {
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
  },
  globalData: {
    id: "",
    hasUserInfo: false,
    userInfo: null,
    isGetUserInfo: false,
    hasToken: false,
    payer_client_ip: ""
  }
})
