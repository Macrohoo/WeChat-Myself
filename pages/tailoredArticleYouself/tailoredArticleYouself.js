const Api = require('../../utils/api');

Page({
  data: {
    topicArticles: [],
    loadtemp: 1,
    allArticleCount: 0,
    loadMoreFont: true,
    searchKey: '您发表的文章',
  },
  getTailoredArticleList(x, y) {
    wx.request({
      url: Api.fetchGetArticleYouself(),
      method: 'GET',
      data: {
        currentPage: x,
        pageSize: y,
      },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then((res) => {
      const newGetArticle = res.data.data.rows;
      const oldGetArticle = this.data.topicArticles;
      this.setData({
        topicArticles: oldGetArticle.concat(newGetArticle),
        allArticleCount: res.data.data.count,
      });
      if (res.data.data.count <= 10) {
        this.setData({
          loadMoreFont: false,
        });
      }
    });
  },
  redictDetail(e) {
    const id = e.currentTarget.id;
    const title = e.currentTarget.dataset.title;
    const authorid = e.currentTarget.dataset.authorid;
    const url = `../articleDetail/articleDetail?id=${id}&title=${title}&authorid=${authorid}`;
    wx.navigateTo({
      url: url,
    });
  },
  loadMore() {
    if (this.data.loadtemp * 10 < this.data.allArticleCount) {
      this.getTailoredArticleList(this.data.loadtemp + 1, 10);
      const nowtemp = this.data.loadtemp + 1;
      this.setData({
        loadtemp: nowtemp,
      });
      if (this.data.loadtemp * 10 >= this.data.allArticleCount) {
        this.setData({
          loadMoreFont: false,
        });
      }
    } else {
      this.setData({
        loadMoreFont: false,
      });
    }
  },
  onLoad(options) {
    this.getTailoredArticleList(options.currentPage, options.pageSize);
  },
});
