const Api = require('../../utils/api');

// index.js
const app = getApp();
Page({
  data: {
    isLoading: true, // 判断是否尚在加载中
    article: {}, // 内容数据
  },
  onLoad: function (options) {
    this.getArticleDetail(options.id)

  },
  getArticleDetail(id) {
    wx.request({
      url: Api.fetchGetArticleDetail(),
      method: 'POST',
      data: { id: id },
      header: {
        'content-type': 'application/json',
        'cookie': wx.getStorageSync("cookie"),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then(res => {
        let richText = res.data.content_html;
        richText = richText.replace(/\<img/gi,'<img style="width:100%;height:auto;"')
        let result = app.towxml(richText, 'html', {
            base: 'https://xxx.com', // 相对资源的base路径
            //theme:'dark',					// 主题，默认`light`
            events: {
              // 为元素绑定的事件方法
              tap: (e) => {
                console.log('tap', e);
              },
            },
          });
          // 更新解析数据
          this.setData({
            article: result,
            isLoading: false,
          });
    })
  },
});
