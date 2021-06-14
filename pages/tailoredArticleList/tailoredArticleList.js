const Api = require('../../utils/api');

Page({
  data: {
    topicArticles: [],
    loadtemp: 1,
    allArticleCount: 0,
    loadMoreFont: true,
    searchKey: ''
  },
  getTailoredArticleList(x, y, z) {
    wx.request({
      url: Api.fetchGetArticleInLabel(),
      method: 'GET',
      data:{
        currentPage: x,
        pageSize: y,
        article_label: z
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
    const url = '../articleDetail/articleDetail?id=' + id;
    wx.navigateTo({
      url: url
    })    
  },
  loadMore() {
    if(this.data.loadtemp * 10 < this.data.allArticleCount) {
        this.getTailoredArticleList(this.data.loadtemp + 1, 10, this.data.tailoredContent)
        const nowtemp = this.data.loadtemp + 1
        this.setData({
            loadtemp: nowtemp
        })
        if(this.data.loadtemp * 10 >= this.data.allArticleCount) {
            this.setData({
                loadMoreFont: false
            })
        }
    }else {
        this.setData({
            loadMoreFont: false
        })
    }
  },
  onLoad(options) {
    this.getTailoredArticleList(options.currentPage, options.pageSize, options.article_label)
    this.setData({
        searchKey: options.article_label
    })
  },
});