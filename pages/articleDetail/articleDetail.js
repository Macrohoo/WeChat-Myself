const Api = require('../../utils/api');
const app = getApp();

Page({
  data: {
    valueInput: '', //为了清空输入框
    sayTo: '',
    singleArticleId: '',  //就是options.id
    articleAuthorId: '',  //文章作者id
    isLoading: true, // 判断是否尚在加载中
    article: {}, // 内容数据
    articleTitle: '',
    commentList: [],  //评论列表  (暂时未实现评论后即使显示，可以通过评论回复后直接对commentList做虚拟修改实现，不需要去获取接口数据)
    likeList: [], //点赞人列表
    commentCount: 0,  //评论数量总计
    commentTemp:1,    //当前评论加载1页
    commentMoreShow: false, //控制comment-more是否显示
    commentMoreLoad: true, //解决comment-more只会执行一次的问题
    focus: false,   //在准确回复评论的时候用来聚焦输入框用！
    replyUserInfo: {}, //关于当前用户，回复人，评论人暂存信息
    replyInfo: {},  //回复暂存信息
    loadMoreFont: true, //控制loadMoreComment
    payshow: false,
    prepayInfo: {}, //支付调用参数
    stopclickpay: false //控制红包被多次点击

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
  //支付
  paytap(e) {
    if(e.currentTarget.id == 'pay2') {
      this.payWeChat(2, 2, '打赏2元')         
    } else if(e.currentTarget.id == 'pay5') {
      this.payWeChat(5, 5, '打赏5元')
    } else if(e.currentTarget.id == 'pay10') {
      this.payWeChat(10, 10, '打赏10元')
    }
  },
  clickpay() {
    this.setData({
      payshow: true
    })
  },
  payClose() {
    this.setData({ payshow: false });
  },  
  onLoad: function (options) {
    this.getArticleDetail(options.id);
    this.getSingleArticleCommentList(1, 5, 1, 3, options.id)
    this.getArticleLikes(options.id)
    this.setData({
      articleTitle: options.title,
      singleArticleId: options.id,
      articleAuthorId: options.authorid
    });
  },
  payWeChat(original_price, pay_total, product_description) {
    wx.showLoading({
      title: '调用支付接口中...',
      mask: true
    })    
    wx.request({
      url: Api.fetchaddPayOrder(),
      method: 'POST',
      data: {
        payer_client_ip: app.globalData.payer_client_ip,
        original_price: original_price,
        pay_total: pay_total,
        product_description: product_description
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
          pay_total: res.data.data.pay_total
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
        wx.hideLoading()        
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
        wx.hideLoading()
        this.setData({
          stopclickpay: false
        })        
      })      
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        stopclickpay: false
      })
    })    
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
      const oldGetComment = this.data.commentList
      let newGetComment = []
      res.data.data.rows.forEach(element => {
        newGetComment.push({
          ...element,
          hiddenText: "none",   //收起按钮的display
          replyLoadTempIn: 1,  //当前回复加载1页  需要被添加进comment中作为一个属性，解决各评论中的回复能被层层打开而不耦合
          loadMoreReplyFont: true,    //评论中第一层展开更多按钮是否显示
          firstlevel: "none",    //二层回复块是否展开
          loadMoreReplyFont2: element.child_count > 3 ? true : false  //评论中第二层展开更多按钮是否显示
          //注意(更多回复按钮或者更多评论回复按钮)，都需要loadMoreReplyFont/2和firstlevel一起控制，利用wx:if和style的双重控制
        })
      });
      this.setData({
        commentList: oldGetComment.concat(newGetComment),
        commentCount: res.data.data.count
      })
      if(res.data.data.count <= 5) {
        this.setData({
          loadMoreFont: false
        })
      }    
    })    
  },
  getArticleLikes(article_id) {
    wx.request({
      url: Api.fetchGetArticleLike(),
      method: 'GET',
      data: {      
        id: article_id,
      },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then(res => {
      this.setData({
        likeList: res.data.data
      })
    })
  },
  clickLike() {
    wx.request({
      url: Api.fetchAdcArticleLike(),
      method: 'POST',
      data: {      
        article_id: this.data.singleArticleId,
      },
      header: {
        'content-type': 'application/json',
        cookie: wx.getStorageSync('cookie'),
        Authorization: `Bearer ${wx.getStorageSync('token')}`,
      },
    }).then(res => {
      wx.showToast({
        title: res.data.message,
        icon: 'success',
        duration: 2000
      })
      this.getArticleLikes(this.data.singleArticleId)           
    })
  },
  loadMoreComment() {
    if(this.data.commentTemp * 5 < this.data.commentCount) {
      this.getSingleArticleCommentList(this.data.commentTemp + 1, 5, 1, 3, this.data.singleArticleId)     
      const nowtemp = this.data.commentTemp + 1
      if((this.data.commentTemp + 1) * 5 >= this.data.commentCount) {
        this.setData({
          loadMoreFont: false
        })
      }
      this.setData({
        commentTemp: nowtemp
      })        
    }else {
      this.setData({
          loadMoreFont: false
      })
    }
  },
  loadMoreReply(e) {
    //console.log(this.data.commentList)
    this.data.commentList[e.currentTarget.dataset.index].loadMoreReplyFont = false
    this.data.commentList[e.currentTarget.dataset.index].firstlevel = 'flex'
    if(this.data.commentList[e.currentTarget.dataset.index].child.length > 3 || this.data.commentList[e.currentTarget.dataset.index].child_count <= 3 ) {
      this.data.commentList[e.currentTarget.dataset.index].hiddenText = 'flex'
    }
    this.setData({
      commentList: this.data.commentList,  //一定要这一步才能做到数组的监听setData是关键,同时监听loadMoreReplyFont和firstlevel
    })
  },
  loadMoreReply2(e) {
    //不能用getSingleArticleCommentList的，重新建立一个接口
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
        const nowCommentReply = res.data.data.rows[e.currentTarget.dataset.index - (this.data.commentTemp -1)*5].child
        let newCommentReply = oldComment[e.currentTarget.dataset.index].child.concat(nowCommentReply)
        oldComment[e.currentTarget.dataset.index].child = newCommentReply
        oldComment[e.currentTarget.dataset.index].firstlevel = 'flex'
        oldComment[e.currentTarget.dataset.index].replyLoadTempIn += 1
        this.setData({
          commentList: oldComment
        })
        if ( (this.data.commentList[e.currentTarget.dataset.index].replyLoadTempIn + 1) * 3 >= this.data.commentList[e.currentTarget.dataset.index].child_count) {
          oldComment[e.currentTarget.dataset.index].loadMoreReplyFont2 = false
          oldComment[e.currentTarget.dataset.index].hiddenText = 'flex'         
        }
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
  },
  //显示或隐藏功能菜单
  ShowHideMenu() {
    this.setData({
      commentMoreShow: !this.data.commentMoreShow,
      commentMoreLoad: false,
    })
  },
  //返回个人中心
  goUser() {
    wx.reLaunch({
      url: '/pages/user/user'
  })    
  },
  //输入框聚焦时触发时的事件
  onRepleyFocus() {
    if(Object.keys(this.data.replyUserInfo).length === 0) {
      //这说明输入聚焦框是直接回复文章作者的操作
      this.data.replyUserInfo.authorId = this.data.articleAuthorId
      this.data.replyUserInfo.articleId = this.data.singleArticleId
      this.setData({
        replyUserInfo: this.data.replyUserInfo
      })
    }
    console.log(this.data.replyUserInfo)
  },
  //点击评论或回复内容时
  toReplyInfo(e) {
    this.setData({
      replyUserInfo: {}
    })
    //console.log(e.currentTarget.dataset)
    if(e.currentTarget.dataset.endex >= 0) {
      //console.log(e.currentTarget.dataset.endex)
      //点击到的是二级回复的情况
      this.data.replyUserInfo.toUserId = this.data.commentList[e.currentTarget.dataset.index].commenter_id
      this.data.replyUserInfo.commentId = this.data.commentList[e.currentTarget.dataset.index].id
      this.data.replyUserInfo.toReplyUserId = this.data.commentList[e.currentTarget.dataset.index].child[e.currentTarget.dataset.endex].from_user_id
      this.setData({
        replyUserInfo: this.data.replyUserInfo,
        focus: true,
        sayTo: this.data.commentList[e.currentTarget.dataset.index].child[e.currentTarget.dataset.endex].from_author
      })
      //console.log(this.data.replyUserInfo)
    } else {
      //点击到的是一级回复
      this.data.replyUserInfo.toUserId = this.data.commentList[e.currentTarget.dataset.index].commenter_id
      this.data.replyUserInfo.commentId = this.data.commentList[e.currentTarget.dataset.index].id
      this.setData({
        replyUserInfo: this.data.replyUserInfo,
        focus: true,
        sayTo: this.data.commentList[e.currentTarget.dataset.index].commenter
      }) 
      //console.log(this.data.replyUserInfo)           
    }
  },
  //清空重置评论
  commentReset() {
    this.setData({
      sayTo: '',
      valueInput: ''
    })
  },
  //发表评论或回复评论
  formReplySubmit(e) {
    let content;
    if (e.currentTarget.id == 'comment-input' && e.detail.value.length !== 0) {
      content = e.detail.value;  //这里是input表单触发submit事件
      this.data.replyInfo = JSON.parse(JSON.stringify(this.data.replyUserInfo))
      this.data.replyInfo.content = content
      this.setData({
        replyInfo: this.data.replyInfo
      })
      if(this.data.replyInfo.toUserId === undefined) {
        this.setData({
          sayTo: '',
          valueInput: ''
        })        
        //发表评论
        wx.request({
          url: Api.fetchAddComment(),
          method: 'POST',
          data: {
            content: this.data.replyInfo.content,
            article_id: this.data.replyInfo.articleId,
            author_id: this.data.replyInfo.authorId
          },
          header: {
            'content-type': 'application/json',
            cookie: wx.getStorageSync('cookie'),
            Authorization: `Bearer ${wx.getStorageSync('token')}`,
          },
        }).then(res => {
          if (!res.data.data) {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'error',
              duration: 2000
            })             
          }         
        })        
      } else {
        //回复评论
        this.setData({
          sayTo: '',
          valueInput: ''
        })        
        wx.request({
          url: Api.fetchReplyComment(),
          method: 'POST',
          data: {
            content: this.data.replyInfo.content,
            to_user_id: this.data.replyInfo.toUserId,
            comment_id: this.data.replyInfo.commentId,
            to_reply_user_id: this.data.replyInfo.toReplyUserId
          },
          header: {
            'content-type': 'application/json',
            cookie: wx.getStorageSync('cookie'),
            Authorization: `Bearer ${wx.getStorageSync('token')}`,
          },
        }).then(res => {
          if (!res.data.data) {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'error',
              duration: 2000
            })             
          }         
        })         
      }
    } else if (e.currentTarget.id == 'comment-form' && e.detail.value.inputComment.length !== 0){
      content = e.detail.value.inputComment;
      this.data.replyInfo = JSON.parse(JSON.stringify(this.data.replyUserInfo))
      this.data.replyInfo.content = content
      this.setData({
        replyInfo: this.data.replyInfo
      })
      if(this.data.replyInfo.toUserId === undefined) {
        this.setData({
          sayTo: '',
          valueInput: ''
        })
        //发表评论
        wx.request({
          url: Api.fetchAddComment(),
          method: 'POST',
          data: {
            content: this.data.replyInfo.content,
            article_id: this.data.replyInfo.articleId,
            author_id: this.data.replyInfo.authorId
          },
          header: {
            'content-type': 'application/json',
            cookie: wx.getStorageSync('cookie'),
            Authorization: `Bearer ${wx.getStorageSync('token')}`,
          },
        }).then(res => {
          if (!res.data.data) {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'error',
              duration: 2000
            })             
          }         
        })        
      } else {
        //回复评论
        this.setData({
          sayTo: '',
          valueInput: ''
        })        
        wx.request({
          url: Api.fetchReplyComment(),
          method: 'POST',
          data: {
            content: this.data.replyInfo.content,
            to_user_id: this.data.replyInfo.toUserId,
            comment_id: this.data.replyInfo.commentId,
            to_reply_user_id: this.data.replyInfo.toReplyUserId
          },
          header: {
            'content-type': 'application/json',
            cookie: wx.getStorageSync('cookie'),
            Authorization: `Bearer ${wx.getStorageSync('token')}`,
          },
        }).then(res => {
          if (!res.data.data) {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.data.message,
              icon: 'error',
              duration: 2000
            })             
          }         
        })         
      }      
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });
    } 
  }
});
