const Auth = require('../../utils/auth')
const Api = require('../../utils/api');

Auth.pageLoginCheck({
  data: {
    motto: 'Hello World',
    topicArticles: []
  },
  getArticleList() {
    wx.request({
      url: Api.fetchGetArticleList(),
      method: 'GET',
      data:{
        currentPage: 1,
        pageSize: 10
      },
      header: {
        'content-type': 'application/json',
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },      
    }).then(res => {
      console.log(res)
      this.setData({
        topicArticles: res.data.rows
      })
      console.log(this.data.topicArticles)
    })
  },
  onLoad() {
    this.getArticleList()    
  },
  onShow: function () {
  },
  //触发下拉刷新
  onPullDownRefresh() {
    this.getArticleList()
  }
})