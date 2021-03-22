function wxPromisify(fn) {
   return function (obj = {}) {
       return new Promise((resolve, reject)=> {
           obj.success = function(res) {
               resolve(res)
           }
           obj.fail = function(err) {
               reject(err)
           }
           fn(obj)
       })
   } 
}



export function getRequest(url, data, token) {
    var request = wxPromisify(wx.request)
    return request({
        url: url,
        method: 'Get',
        data: data,
        header: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
}

export function postRequest(url, data, token) {
    var request = wxPromisify(wx.request)
    return request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`
        }        
    })
}