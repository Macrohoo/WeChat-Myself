// index.js
const Api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    displaySwiper: 'none',
    showerror: 'none',
    topSwiperList: [],
    topicArticles: [],
    loadtemp: 1,   //当前加载1页
    allArticleCount: 0,
    loadMoreFont: true
  },
  formSubmit(e) {
    let url = '../list/list';   //这里错误的还需要改 
    let key;
    if (e.currentTarget.id == 'search-input') {
      key = e.detail.value;  //这里是input表单触发submit事件
    } else {
      key = e.detail.value.input; //form表单触发submit事件，但注意这里是catchsubmit冒泡拦截，event.detail = {value : {'name': 'value'} , formId: ''}，这里name是input
    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url,
      });
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });
    }
  },
  getTopSwiper() {
    wx.request({
      url: Api.fetchGetArticleLabel(),
      method: 'GET',
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    })
      .then((response) => {
        if (response.statusCode == '200' && response.data.length > 0) {
          this.setData({
            topSwiperList: response.data,
            displaySwiper: 'block',
          });
        } else {
          this.setData({
            displaySwiper: 'none',
          });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setData({
          showerror: 'block'
        });
      });
  },
  getArticleList(currentPage, pageSize) {
    wx.request({
      url: Api.fetchGetArticleList(),
      method: 'GET',
      data:{
        currentPage: currentPage,
        pageSize: pageSize
      },
      header: {
        'content-type': 'application/json',
        'cookie': wx.getStorageSync("cookie"),
        Authorization: `Bearer ${wx.getStorageSync('token')}`
      },      
    }).then(res => {
      console.log(res)
      const newGetArticle = res.data.data.rows
      const oldGetArticle = this.data.topicArticles
      this.setData({
        topicArticles: oldGetArticle.concat(newGetArticle),
        allArticleCount: res.data.data.count
      })
      if(res.data.data.count <= 10) {
        this.setData({
            loadMoreFont: false
        })
      }
    })
  },
  redictDetail(e) {
    console.log(e.currentTarget)
    const id = e.currentTarget.id
    const title = e.currentTarget.dataset.title
    const authorid = e.currentTarget.dataset.authorid
    const url = `../articleDetail/articleDetail?id=${id}&title=${title}&authorid=${authorid}`
    wx.navigateTo({
      url: url
    })    
  },
  loadMore() {
    console.log("haha")
    if(this.data.loadtemp * 10 < this.data.allArticleCount) {
        this.getArticleList(this.data.loadtemp + 1, 10)
        const nowtemp = this.data.loadtemp + 1
        if((this.data.loadtemp + 1) * 10 >= this.data.allArticleCount) {
          this.setData({
              loadMoreFont: false
          })
        }
        this.setData({
          loadtemp: nowtemp
        })        
    }else {
        this.setData({
            loadMoreFont: false
        })
    }
  },    
  // payMent() {
  //     wx.requestPayment
  //     (
  //         {
  //             "package": "prepay_id=wx30173711335925e1821486414b85990000",
  //             "timeStamp": "1622367429",
  //             "nonceStr": "1622367428811",
  //             "signType": "RSA",
  //             "paySign": "Th1rdpy5HrQMKQWJTyvgpCKc8VzLCDKPMPtXvRSTptfVHxsH4/vi6QX4GlhRpoeMijqOYL/0ZqSgO/LQppwRzAcYmZNqwycF9ajBGRmzESGFMtghzDjkR7ItAOrmbD9dT3HcjwnES2uwkIarTqiFjIgHDTwKLIUCAi9Mm+iXY7TQNpwbA5G6AZJ7RYu4p8ZjfMfKrJWYUiQw+cJtn4e574LFUGHkW3t4OOgiy8sOZHvRgkCWr0QKFk/hLqZ+msPuVLdgO4495zi5gxCiAdMIKol7/+HgFcMEBZGCg9gN4WAnP6Kn+Hm8kB+P5+lVifjQs5f6V3b4DLxof/71V/qKCg==",
  //             "success":function(res){
  //                 console.log("支付調起成功")
  //             },
  //             "fail":function(res){
  //                 console.log("支付調起失败")
  //             },
  //             "complete":function(res){}
  //         }
  //     )
  // },
  onLoad() {
    this.getTopSwiper();
    this.getArticleList(1, 10)
  },
});
