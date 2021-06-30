//var app = getApp()

const Auth = {}

function getPageInstance() {
    var pages = getCurrentPages()
    return pages[pages.length -1]
}

//手动简易中间件路由守卫
Auth.pageLoginCheck = function(pageObj) {
    if(pageObj.onLoad) {
        let _onLoad = pageObj.onLoad
        pageObj.onLoad = function (options) {
            if(wx.getStorageSync('token')) {
                let currentInstance = getPageInstance();
                _onLoad.call(currentInstance, options)
            } else {           
                wx.reLaunch({
                    url: '/pages/user/user'
                })
            }
        }
    }
    return Page(pageObj)
}

//wxLogin登录方法换取openid换取三要素之一的js_code
Auth.wxLogin = function() {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function(res) {
                resolve(res);
            },
            fail: function(err) {
                reject(err);
            }
        })
    })
}

module.exports = Auth