export default (interceptors = {}) => {
  const oldWx = { ...wx };
  const newWx = {};
  const newRequest = (params = {}) => {
    return new Promise((resolve, reject) => {
      async function resFn(res, cb) {
        const { statusCode } = res;
        if (interceptors.request) {
          const {
            request: { response },
          } = interceptors;
          try {
            res = await response(res);
          } catch (e) {
            reject(e);
          }
        }
        if (statusCode >= 400) {
          reject(res);
        }
        cb(res);
      }
      oldWx.request(
        Object.assign(params, {
          //程序中逻辑是先走拦截器函数调用，此时结果并还没有被期约成resolve还是reject。如果你不做期约处理，那么像status>=400的状态码就会也被resolve出来。
          //所以要么在success中的cb参数回调函数中区分错误状态码reject。要么像这里那样在resFn调用函数中对错误状态码reject。要么也可以把这个处理去掉，在拦截器调用时Promise.reject出来。
          success: (v) => {
            resFn(v, (newRes) => {
              resolve(newRes)
            });
          },
          fail: (v) => {
            resFn(v, (newRes) => {
              reject(newRes);
            });
          },
        })
      );
    });
  };
  Object.keys(oldWx).forEach((name) => {
    let newApi;
    if (name === 'request') {
      newApi = newRequest;
    } else {
      newApi = oldWx[name];
    }
    newWx[name] = newApi;
  });
  wx = newWx;
};

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
