const Auth = require('../../utils/auth');
const Api = require('../../utils/api');
const app = getApp();

Auth.pageLoginCheck({
  data: {
    motto: 'Hello World',
    stopclickpay: false,  //控制支付按钮被多次点
    //progress: null, //下载进度
  },
  //睡线程函数
  sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
    now = new Date();
    if (now.getTime() > exitTime) return;
    }
  },   
  copyLink() {
    wx.setClipboardData({
      data: `${Api.fetchDow击nload()}?querytime=${Math.round(new Date().getTime() / 1000) + 6 * 60}`,
      success: function (res) {
        wx.getClipboardData();
      },
    });
  },
  buyAide() {
    this.payWeChat(38, 38, '购买辅助', '1')
  },
  payWeChat(original_price, pay_total, product_description, pay_for) {
    wx.request({
      url: Api.fetchaddPayOrder(),
      method: 'POST',
      data: {
        payer_client_ip: app.globalData.payer_client_ip,
        original_price: original_price,
        pay_total: pay_total,
        product_description: product_description,
        pay_for: pay_for
      },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then(res => {
      this.setData({
        stopclickpay: true
      })      
      wx.request({
        url: Api.fetchPayWechatMini(),
        method: 'POST',
        data: {
          currency: res.data.data.currency,
          order_id: res.data.data.order_id,
          product_description: res.data.data.product_description,
          pay_total: res.data.data.pay_total,
          pay_for: pay_for
        },
        header: {
          'content-type': 'application/json',
          cookie: wx.getStorageSync('cookie'),
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
      }).then(res2 => {
        let that = this
        this.setData({
          prepayInfo: res2.data.data
        })
        wx.requestPayment({
          "package": this.data.prepayInfo.package,
          "timeStamp": this.data.prepayInfo.time_stamp,
          "nonceStr": this.data.prepayInfo.noncestr,
          "signType": this.data.prepayInfo.signtype,
          "paySign": this.data.prepayInfo.pay_sign,
          "success": function() {
            console.log("支付調起成功")
            wx.showToast({
              title: '支付成功!',
              icon: 'success',
              duration: 3000
            })
            that.sleep(3000)
            wx.request({
              url: Api.fetchInquirePayWechatMini(),
              method: 'GET',
              data: { out_trade_no: that.data.prepayInfo.order_id },
              header: {
                'content-type': 'application/json',
                cookie: wx.getStorageSync('cookie'),
                Authorization: `Bearer ${wx.getStorageSync('token')}`,
              },
            })
            that.setData({
              stopclickpay: false
            })            
          },
          "fail": function() {
            console.log("支付調起失败")
            wx.showToast({
              title: '支付調用失败!',
              icon: 'error',
              duration: 3000
            })
            that.setData({
              stopclickpay: false
            })                           
          },
          "complete": function() {
            that.sleep(3000)
            wx.request({
              url: Api.fetchInquirePayWechatMini(),
              method: 'GET',
              data: { out_trade_no: that.data.prepayInfo.order_id },
              header: {
                'content-type': 'application/json',
                cookie: wx.getStorageSync('cookie'),
                Authorization: `Bearer ${wx.getStorageSync('token')}`,
              },
            })
            that.setData({
              stopclickpay: false
            })            
          }
        })        
      }).catch(err =>{
        this.setData({
          stopclickpay: false
        })        
      })      
    }).catch(err => {
      this.setData({
        stopclickpay: false
      })
    })    
  },
  // download() {
  //   //总体来说这个接口只适用于文档类文件的打开，由于微信小程序文件系统本地隔离的限制，ZIP类文件都无法保存到具体移动端可见目录中。
  //   let downloadTask = wx.downloadFile({
  //     url: Api.fetchDownload(),
  //     success: res => {
  //       wx.openDocument({
  //         filePath: res.tempFilePath,
  //         success: res=> {
  //           wx.showToast({
  //             title: '请使用WPS类软件打开文件!',
  //             icon: 'success',
  //             duration: 1000
  //           })
  //         },
  //         fail: res => {
  //           wx.showToast({
  //             title: '打开文件失败!',
  //             icon: 'error',
  //             duration: 1000
  //           })
  //         }
  //       })
  //     },
  //     fail: function(err) {
  //       wx.showToast({
  //         title: '下载失败!',
  //         icon: 'error',
  //         duration: 1000
  //       })
  //     }
  //   });
  //   //下载进度条控制
  //   downloadTask.onProgressUpdate(res => {
  //     if (res.progress === 100) {
  //       this.setData({
  //         progress: 100
  //       })
  //     } else {
  //       this.setData({
  //         progress: res.progress
  //       })
  //     }
  //   });
  // },
  onLoad() {},
  onShow: function () {},
});
