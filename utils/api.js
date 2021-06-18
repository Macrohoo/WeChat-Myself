import config from 'config.js'
var domain = config.getDomain;
var pageCount = config.getPageCount
var HOST_URI = 'http://' + domain

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

    //获取文章列表
    fetchGetArticleList: function() {
        var url = HOST_URI + '/article/articleList'
        return url
    },

    //获取具体标签文章列表
    fetchGetArticleInLabel() {
        var url = HOST_URI + '/article/articleInLabel'
        return url        
    },

    //文章详情回显
    fetchGetArticleDetail: function() {
        var url = HOST_URI + '/article/getArticle'
        return url
    },

    //某篇文章的评论列表(篾条文章第一层评论附带5条reply)
    fetchGetSingleArticleCommentList: function() {
        var url = HOST_URI + '/comment/singleArticleCommentList'
        return url        
    },

    //文章评论中对某评论的回复列表
    fetchGetCommentReplyList: function() {
        var url = HOST_URI + '/comment/commentReplyList'
        return url          
    }

}