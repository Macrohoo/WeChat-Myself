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
        'cookie': wx.getStorageSync("cookie"),
        Authorization: `Bearer ${wx.getStorageSync('token')}`
      },      
    }).then(res => {
      console.log(res)
      this.setData({
        topicArticles: res.data.data.rows
      })
    })
  },
  redictDetail(e) {
    console.log(e.currentTarget)
    const id = e.currentTarget.id
    const url = '../articleDetail/articleDetail?id=' + id;
    wx.navigateTo({
      url: url
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