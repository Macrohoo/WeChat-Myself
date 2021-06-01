import config from 'config.js'
var domain = config.getDomain;
var pageCount = config.getPageCount
var HOST_URI = 'http://' + domain

module.exports = {
    //js_code换取Openid
    fetchOpenid: function() {
        var url = HOST_URI + '/customer/wxlogin/openid'
        return url
    },

    //微信登录换取token
    fetchWxLogin: function() {
        var url = HOST_URI + '/customer/user/wxlogin'
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

    //文章详情回显
    fetchGetArticleDetail: function() {
        var url = HOST_URI + '/article/getArticle'
        return url
    }

}