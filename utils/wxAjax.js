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



export function getRequest() {
    var request = wxPromisify(wx.request)
    return request({
        url: url,
        method: 'Get',
        data: data,
        Headers: {
            'Content-Type': 'application/json'
        }
    })
}

export function postRequest() {
    var request = wxPromisify(wx.request)
    return request({
        url: url,
        method: 'POST',
        data: data,
        header: {
          "content-type": "application/json"
        }        
    })
}