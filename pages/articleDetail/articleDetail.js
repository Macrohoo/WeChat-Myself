const Api = require('../../utils/api');

// index.js
const app = getApp();
Page({
  data: {
    singleArticleId: '',  //就是options.id
    isLoading: true, // 判断是否尚在加载中
    article: {}, // 内容数据
    articleTitle: '',
    commentList: [],  //评论列表
    commentCount: 0,  //评论数量总计
    commentTemp:1,    //当前评论加载1页 
  },
  onLoad: function (options) {
    this.getArticleDetail(options.id);
    this.getSingleArticleCommentList(1, 5, 1, 3, options.id)
    this.setData({
      articleTitle: options.title,
      singleArticleId: options.id
    });
  },
  getArticleDetail(id) {
    wx.request({
      url: Api.fetchGetArticleDetail(),
      method: 'POST',
      data: { id: id },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then((res) => {
      let richText = res.data.content_html;
      if (richText !== null) {
        richText = richText.replace(/\<img/gi, '<img style="width:100%;height:auto;"');
      }
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
    });
  },
  getSingleArticleCommentList(currentPage, pageSize, child_currentPage, child_pageSize, article_id) {
    wx.request({
      url: Api.fetchGetSingleArticleCommentList(),
      method: 'POST',
      data: {
        currentPage: currentPage,
        pageSize: pageSize,
        child_currentPage: child_currentPage,
        child_pageSize: child_pageSize,        
        article_id: article_id,
      },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then(res => {
      let totalChildCount = 0
      let comment = []
      res.data.data.rows.forEach(element => {
        totalChildCount += element.child_count
        comment.push({
          ...element,
          hiddenText: "none",   //收起按钮的display
          replyLoadTempIn: 1,  //当前回复加载1页  需要被添加进comment中作为一个属性，解决各评论中的回复能被层层打开而不耦合
          loadMoreReplyFont: true,    //评论中第一层展开更多按钮是否显示
          firstlevel: "none",    //二层回复块是否展开
          loadMoreReplyFont2: element.child_count > 3 ? true : false  //评论中第二层展开更多按钮是否显示
          //注意(更多回复按钮或者更多评论回复按钮)，都需要loadMoreReplyFont/2和firstlevel一起控制，利用wx:if和style的双重控制
        })
      });
      // for(let i=0; i< res.data.data.rows.length; i++) {
      //   totalChildCount += res.data.data.rows[i].child_count
      // }
      this.setData({
        commentList: comment,
        commentCount: res.data.data.rows.length + totalChildCount
      })
      //console.log(this.data.commentList)
    })    
  },
  loadMoreReply(e) {
    // console.log(e.currentTarget)
    this.data.commentList[e.currentTarget.dataset.index].loadMoreReplyFont = false
    this.data.commentList[e.currentTarget.dataset.index].firstlevel = 'block'
    if(this.data.commentList[e.currentTarget.dataset.index].child.length > 3 || this.data.commentList[e.currentTarget.dataset.index].child_count <= 3 ) {
      this.data.commentList[e.currentTarget.dataset.index].hiddenText = 'block'
    }
    this.setData({
      commentList: this.data.commentList,  //一定要这一步才能做到数组的监听setData是关键,同时监听loadMoreReplyFont和firstlevel
    })
  },
  loadMoreReply2(e) {
    //在事件中，是拿不到getSingleArticleCommentList的，只能重新建立一个接口
    //console.log(e.currentTarget)
    if(this.data.commentList[e.currentTarget.dataset.index].replyLoadTempIn * 3 < this.data.commentList[e.currentTarget.dataset.index].child_count) {
      let oldComment = this.data.commentList
      wx.request({
        url: Api.fetchGetSingleArticleCommentList(),
        method: 'POST',
        data: {
          currentPage: this.data.commentTemp,
          pageSize: 5,
          child_currentPage: this.data.commentList[e.currentTarget.dataset.index].replyLoadTempIn + 1,
          child_pageSize: 3,        
          article_id: this.data.singleArticleId,
        },
        header: {
          'content-type': 'application/json',
          cookie: wx.getStorageSync('cookie'),
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
      }).then(res => {
        const nowCommentReply = res.data.data.rows[e.currentTarget.dataset.index].child
        let newCommentReply = oldComment[e.currentTarget.dataset.index].child.concat(nowCommentReply)
        oldComment[e.currentTarget.dataset.index].child = newCommentReply
        oldComment[e.currentTarget.dataset.index].firstlevel = 'block'
        oldComment[e.currentTarget.dataset.index].replyLoadTempIn += 1
        if ( (this.data.commentList[e.currentTarget.dataset.index].replyLoadTempIn + 1) * 3 >= this.data.commentList[e.currentTarget.dataset.index].child_count) {
          oldComment[e.currentTarget.dataset.index].loadMoreReplyFont2 = false
          oldComment[e.currentTarget.dataset.index].hiddenText = 'block'         
        }
        this.setData({
          commentList: oldComment
        })        
      })
    }else {
      this.data.commentList[e.currentTarget.dataset.index].loadMoreReplyFont2 = false
      this.setData({
        commentList: this.data.commentList
      })
    }
  },
  hiddenReply(e) {
    console.log(e.currentTarget)
    this.data.commentList[e.currentTarget.dataset.index].firstlevel = 'none'
    this.data.commentList[e.currentTarget.dataset.index].loadMoreReplyFont = true
    this.data.commentList[e.currentTarget.dataset.index].hiddenText = 'none'
    this.setData({
      commentList: this.data.commentList
    })        
  }
});
