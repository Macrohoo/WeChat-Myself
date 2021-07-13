import config from 'config.js'
var domain = config.getDomain;
var HOST_URI = domain

module.exports = {
    //微信注册/登录接口(后台通过js_code换取Openid)换取token
    fetchWxRegisterLogin: function() {
        var url = HOST_URI + '/customer/user/wxRegisterLogin'
        return url
    },

    //获取当前用户信息且session绑定
    fetchGetUserInfo: function() {
        var url = HOST_URI + '/user/getUserInfo'
        return url
    },

    //获取文章标签列表
    fetchGetArticleLabel() {
        var url = HOST_URI + '/articlelabel/getArticleLabel'
        return url
    },

    ////获取轮播图标签add_num前四
    fetchGetBannerLabel() {
        var url = HOST_URI + '/articlelabel/getBannerLabel'
        return url
    },

    //获取文章列表
    fetchGetArticleList: function() {
        var url = HOST_URI + '/article/articleList'
        return url
    },

    //点赞用户信息获取接口
    fetchGetArticleLike: function() {
        var url = HOST_URI + '/article/articleLike'
        return url        
    },

    //点赞或取消点赞接口
    fetchAdcArticleLike: function() {
        var url = HOST_URI + '/article/adcArticleLike'
        return url        
    },

    //获取具体标签文章列表
    fetchGetArticleInLabel() {
        var url = HOST_URI + '/article/articleInLabel'
        return url        
    },

    //查询热门文章
    fetchGetArticleHot() {
        var url = HOST_URI + '/article/articleHot'
        return url 
    },

    //搜你感兴趣的文章
    fetchGetArticleInterested() {
        var url = HOST_URI + '/article/articleInterested'
        return url         
    },

    //搜你的文章
    fetchGetArticleYouself() {
        var url = HOST_URI + '/article/articleYouself'
        return url         
    },    

    //文章详情回显
    fetchGetArticleDetail: function() {
        var url = HOST_URI + '/article/getArticle'
        return url
    },

    //某篇文章的评论列表(文章第一层评论附带5条reply)
    fetchGetSingleArticleCommentList: function() {
        var url = HOST_URI + '/comment/singleArticleCommentList'
        return url        
    },

    //文章评论中对某评论的回复列表
    // fetchGetCommentReplyList: function() {
    //     var url = HOST_URI + '/comment/commentReplyList'
    //     return url          
    // }

    //发表评论
    fetchAddComment: function() {
        var url = HOST_URI + '/comment/addComment'
        return url         
    },

    //回复评论
    fetchReplyComment: function() {
        var url = HOST_URI + '/comment/replyComment'
        return url          
    },

    //创建小程序支付订单
    fetchaddPayOrder: function() {
        var url = HOST_URI + '/payment/addPayOrder'
        return url        
    },

    //统一微信小程序下单拿prepay_id 且关闭已超时订单
    fetchPayWechatMini: function() {
        var url = HOST_URI + '/payment/payWechatMini'
        return url 
    },

    //查询微信小程序订单状态(并且如果订单支付成功，修改支付状态到数据库)
    fetchInquirePayWechatMini: function() {
        var url = HOST_URI + '/payment/inquirePayWechatMini'
        return url
    },

    //文件下载
    fetchDownload: function() {
        var url = HOST_URI + '/flie/downloadFile'
        return url        
    },

    //添加IMEI返回激活码
    fetchaddGameRawData: function() {
        var url = HOST_URI + '/gamemonitor/addGameRawData'
        return url
    }
}