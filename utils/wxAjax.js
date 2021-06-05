export default ((interceptors = {}) => {
    const oldWx = {...wx}
    const newWx = {}
    const newRequest = (params= {}) => {
        return new Promise((resolve, reject) => {
            async function resFn(res, cb) {
              const { statusCode } = res;
              if (interceptors.request) {
                const {
                  request: { response },
                } = interceptors;
                try {
                  res = (await response(res)) || res;
                } catch (e) {
                  reject(e);
                }
              }
              if (statusCode >= 400) {
                reject(res);
              }
              cb(res);
            }
            oldWx.request(Object.assign(params, {
                success: v => {
                    resFn(v, newRes => {
                        resolve(newRes)
                    })
                },
                fail: v => {
                    resFn(v, newRes => {
                        reject(newRes)
                    })
                }
            }))
        })
    }
    Object.keys(oldWx).forEach((name) => {
        let newApi;
        if (name === 'request') {
            newApi = newRequest;
        } else {
            newApi = oldWx[name]
        }
        newWx[name] = newApi;
    });
    wx = newWx;  
})



// function wxPromisify(fn) {
//   return function (obj = {}) {
//     return new Promise((resolve, reject) => {
//       obj.success = function (res) {
//         resolve(res);
//       };
//       obj.fail = function (err) {
//         reject(err);
//       };
//       fn(obj);
//     });
//   };
// }

// export function getRequest(url, data, token) {
//     var request = wxPromisify(wx.request)
//     return request({
//         url: url,
//         method: 'Get',
//         data: data,
//         header: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`
//         }
//     })
// }

// export function postRequest(url, data, token) {
//     var request = wxPromisify(wx.request)
//     return request({
//         url: url,
//         method: 'POST',
//         data: data,
//         header: {
//           "content-type": "application/json",
//           Authorization: `Bearer ${token}`
//         }
//     })
// }
