const Auth = {}


//检查登录态是否过期
Auth.checkLogin = function(appPage) {
    let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
    //wxLoginInfo中只会放入js_code
    wx.checkSession({
        success: function() {
            if (!wxLoginInfo.js_code) {
                Auth.wxLogin().then(res => {
                    appPage.setData({
                        wxLoginInfo: res
                    })
                    wx.setStorageSync('wxLoginInfo', res);
                })
            }
        },
        fail: function() {
            Auth.wxLogin().then(res => {
                appPage.setData({
                    wxLoginInfo: res
                })
                wx.setStorageSync('wxLoginInfo', res);
            })
        }
    })
}



//wxLogin登录方法换取openid换取三要素之一的js_code
Auth.wxLogin = function() {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function(res) {
                let args = {};
                args.js_code = res.code;
                resolve(args);
            },
            fail: function(err) {
                reject(err);
            }
        })
    })
}

module.exports = Auth