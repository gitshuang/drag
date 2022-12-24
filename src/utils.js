import { createActions as createReduxActions } from 'redux-actions';

export const noop = () => { };

const getLocaleIndex = () => {
  // const pathname = window.location.pathname;
  const lanArr = ["en_US", "zh_TW", "fr_FR", "de_DE", "ja_JP"];
  if (window.diworkContext && typeof window.diworkContext === 'function') {
    const context = getContext();
    const { locale } = context;
    const index = lanArr.findIndex(value => {
      return value === locale;
    });
    return index;
  }
  if (window.managerContext) {
    const { locale } = window.managerContext;
    const index = lanArr.findIndex(value => {
      return value === locale;
    });
    return index;
  }
  return -1;
}

export const mergeReducers = (...reducers) =>
  (state, action) => reducers.reduce(
    (prevState, reducer) => Object.assign(prevState, reducer(state, action)),
    {},
  );

export const createTypes = (...types) => {
  return types.reduce((obj, type) => {
    obj[type] = type;
    return obj;
  }, {});
};

export const createActions = (namespaceObj, ...args) => {
  let namespace = [];
  if (typeof namespaceObj === 'object' && namespaceObj.namespace) {
    let [actionMap, ...identityActions] = args;
    namespace = namespaceObj.namespace.split('.');
    const result = {};
    const space = namespace.reduce((obj, name) => {
      name = name.toUpperCase();
      obj[name] = {};
      return obj[name];
    }, result);
    if (typeof actionMap === 'object') {
      Object.assign(space, actionMap);
    } else {
      identityActions = [actionMap].concat(identityActions);
    }
    identityActions.reduce((obj, identity) => {
      obj[identity] = undefined;
      return obj;
    }, space);
    const actions = createReduxActions(result);
    return namespace.reduce((action, space) => {
      return action[space] ? action[space] : action;
    }, actions);
  } else {
    args = [namespaceObj].concat(args);
    return createReduxActions(...args);
  }
}

export const logout = () => {
  // 退出之前清下tabs_data
  if (window.sessionStorage.getItem('TABS_DATA')) {
    window.sessionStorage.removeItem('TABS_DATA');
  }
  const value = Date.now();
  window.localStorage.setItem("_LOSEPAYLOAD_", value);
  const { defaultDesktop, productLine } = getContext();
  if (defaultDesktop === "portal" && productLine === "diwork") {
    const ajaxUrl = `${getHost('u8cportal')}/user/logOut?v=1.0`;
    deleteRequest(ajaxUrl).then((payload) => {
      window.location.href = payload.url;
    }, (err) => {
      console.log(err);
    })
  } else {
    const {
      location: {
        origin
      }
    } = window;
    window.location.href = `/logout?service=${encodeURIComponent(`${origin ? origin : ''}/`)}`;
  }
}


export const getHost = (key = 'api') => {
  const hosts = {
    api: {
      development: process.env.HOST || '',
      daily: process.env.HOST || '',
      combine: process.env.HOST || '',
      pre: process.env.HOST || '',
      production: process.env.HOST || '',
    },
    workbench: {
      development: 'http://workbench.yyuap.com',
      combine: 'https://diwork-daily.yyuap.com',
      production: 'https://www.diwork.com',
    },
    ys: {
      development: 'http://u8c-test.yyuap.com',
      combine: 'https://u8c-daily.yyuap.com',
      pre: 'https://yonsuite-pre.diwork.com',
      production: 'https://yonsuite.diwork.com',
    },
    // 门户地址
    yzone: {
      development: 'http://web.yyuap.com:91/portal/home/index',
      combine: 'https://ec-u8c-daily.yyuap.com/portal/home/index',
      production: 'https://ec.diwork.com/portal/home/index',
    },
    // 门户地址 - ys
    yzoneYs: {
      development: 'http://web.yyuap.com:91/portal_index',
      combine: 'https://u8c-daily.yyuap.com/portal_index',
      pre: 'https://yonsuite-pre.diwork.com/portal_index',
      production: 'https://yonsuite.diwork.com/portal_index',
    },
    // 门户首页
    portalIndex: {
      development: 'http://web.yyuap.com:91',
      combine: 'https://nec-u8c-daily.yyuap.com',
      pre: 'https://nec-yonsuite-pre.diwork.com',
      production: 'https://nec.diwork.com',
    },
    portal: {
      development: 'http://web.yyuap.com:91',
      daily: 'https://ec-daily.yyuap.com',
      combine: 'https://ec-u8c-daily.yyuap.com',
      pre: 'https://ec-yonsuite-pre.diwork.com',
      production: 'https://ec.diwork.com',
    },
    // 门户请求地址
    u8cportal: {
      development: 'http://dwweb.api.yyuap.com:6062',
      daily: 'https://dwweb-api.yyuap.com',
      combine: 'https://dwweb-api-u8c-daily.yyuap.com',
      pre: "https://y3me-pre.diwork.com/portal_index",
      production: 'https://dwweb-api.diwork.com',
    },

    // 帐号 登录
    login: {
      development: 'https://idtest.yyuap.com',
      daily: "https://sso-daily.yyuap.com",
      combine: "https://u8c-sso-daily.yyuap.com",
      pre: 'https://sso-y3me-pre.diwork.com',
      production: 'https://euc.diwork.com',
    },
    // 帐号管理、注册
    euc: {
      development: 'https://idtest.yyuap.com',
      daily: "https://user-daily.yyuap.com",
      combine: "https://u8c-user-daily.yyuap.com",
      pre: 'https://user-y3me-pre.diwork.com',
      production: 'https://euc.diwork.com',
    },
    // 员工信息
    user: {
      development: 'http://hrcloud.yyuap.com',
      daily: 'https://hr-daily.yyuap.com',
      combine: 'https://hr-u8c-daily.yyuap.com',
      pre: '',
      production: 'https://hr.diwork.com',
    },
    // 应用市场
    market: {
      development: 'https://uastest.yyuap.com',
      daily: 'https://market-daily.yyuap.com',
      combine: 'https://u8cmaket-daily.yyuap.com',
      pre: 'https://market-pre.diwork.com',
      production: 'https://market.yonyoucloud.com',
    },
    // 荣耀    2
    honor: {
      development: '//wsbs.app.yyuap.com',
      daily: '//wsbs-daily.yyuap.com',
      combine: '//wsbs-daily.yyuap.com',
      pre: '',
      production: '//wsbs.diwork.com',
    },
    // 工单
    ticket: {
      development: 'http://ticket-v2.dev.app.yyuap.com',
      daily: 'http://ticket-v2.dev.app.yyuap.com',
      combine: 'http://ticket-v2.dev.app.yyuap.com',
      pre: 'http://ticket-v2.dev.app.yyuap.com',
      production: 'https://wo.diwork.com',
    },
    // 参照
    ref: {
      development: 'http://workbench.yyuap.com',
      daily: 'https://ms-daily.yyuap.com',
      combine: 'https://u8cms-daily.yyuap.com',
      pre: 'https://ms-y3me-pre.diwork.com',
      production: 'https://ms.diwork.com',
    },
    // 参照组织
    org: {
      development: 'http://workbenchdev.yyuap.com/fe',
      daily: 'https://cdn.yonyoucloud.com/pro/diwork',
      integrate: 'https://cdn.yonyoucloud.com/pro/diwork',
      combine: 'https://cdn.yonyoucloud.com/pro/diwork',
      pre: 'https://cdn.yonyoucloud.com/pro/diwork',
      production: 'https://cdn.yonyoucloud.com/pro/diwork',
    },
    // 帮助中心-ys
    helpYs: {
      development: 'http://helpcenter-fe.test.app.yyuap.com',
      combine: 'https://helpcenter-daily.yyuap.com',
      pre: 'https://helpcenter-y3me-pre.diwork.com',
      production: 'https://helpcenter-yonsuite.diwork.com',
    },
    // 帮助中心-diwork
    helpDiwork: {
      development: '',
      combine: 'https://helpcenter-daily-bip.yyuap.com',
      pre: 'https://helpcenter-y3me-pre-bip.diwork.com',
      production: 'https://helpcenter-yonsuite-bip.diwork.com',
    },
    // 我的首选 - 友互通语言设置
    lang: {
      development: 'https://uastest.yyuap.com',
      daily: 'https://u8c-apptenant-daily.yyuap.com',
      combine: 'https://u8c-apptenant-daily.yyuap.com',
      pre: 'https://apptenant-y3me-pre.diwork.com',
      production: 'https://apcenter.diwork.com',
    }
    // 门户个人信息
    // info: {
    //   production: 'https://ec.diwork.com/static/home.html#/myspeech/personInfo?target=pc',
    //   development: 'http://web.yyuap.com:91/static/home.html#/myspeech/personInfo?target=pc',
    //   daily: 'https://ec-daily.yyuap.com/static/home.html#/myspeech/personInfo?target=pc',
    //   integrate: 'https://ec-daily.yyuap.com/static/home.html#/myspeech/personInfo?target=pc',
    //   combine: 'https://ec-u8c-daily.yyuap.com/static/home.html#/myspeech/personInfo?target=pc',
    //   pre: 'https://ec-yonsuite-pre.diwork.com/static/home.html#/myspeech/personInfo?target=pc'
    // },
    // // 门户发言
    // speak: {
    //   production: 'https://ec.diwork.com/static/home.html#/myspeech/index?index=0&target=pc',
    //   development: 'http://web.yyuap.com:91/static/home.html#/myspeech/index?index=0&target=pc',
    //   daily: 'https://ec-daily.yyuap.com/static/home.html#/myspeech/index?index=0&target=pc',
    //   integrate: 'https://ec-daily.yyuap.com/static/home.html#/myspeech/index?index=0&target=pc',
    //   combine: 'https://ec-u8c-daily.yyuap.com/static/home.html#/myspeech/index?index=0&target=pc',
    //   pre: 'https://ec-yonsuite-pre.diwork.com/static/home.html#/myspeech/index?index=0&target=pc',
    // },
    // u8c 向导参数设置
    // paramsetting: {
    //   production: '',
    //   development: 'http://u8c-config-test.yyuap.com/platform/paramsSetting?optionId=common_option',
    //   daily: 'https://u8c-config-daily.yyuap.com/platform/paramsSetting?optionId=common_option',
    //   integrate: 'https://u8c-config-daily.yyuap.com/platform/paramsSetting?optionId=common_option',
    //   combine: 'https://u8c-config-daily.yyuap.com/platform/paramsSetting?optionId=common_option',
    //   pre: '',
    // },
    // u8c: {
    //   production: 'https://u8c.diwork.com',
    //   development: 'http://u8c-test.yyuap.com',
    //   daily: 'https://workbench-daily.yyuap.com',
    //   integrate: 'https://y3me-daily.yyuap.com',
    //   combine: 'https://u8c-daily.yyuap.com',
    //   pre: 'https://yonsuite-pre.diwork.com',
    // },
    //开放平台
    // platform: {
    //   production: 'https://open.diwork.com',   //diwork 正式
    //   development: 'http://open-test.app.yyuap.com',
    //   daily: 'https://open-daily.yyuap.com',   //diwork daily
    //   integrate: 'https://open-daily.yyuap.com',   //diwork daily
    //   combine: 'https://open-u8cdaliy.yonyoucloud.com', //u8cdaily
    //   pre: 'http://diwok-open-web.pre.app.yyuap.com',   //u8c 预发
    // },
    // //开发者信息路径
    // developerPath: {
    //   production: 'dpApplication.html',   //diwork 正式
    //   development: 'dpApplication.html',
    //   daily: 'dpApplication.html',   //diwork daily
    //   integrate: 'dpApplication.html',   //diwork daily
    //   combine: 'yonsuite.html#/appdev', //u8cdaily
    //   pre: 'yonsuite.html#/appdev',   //u8c 预发
    // },
    //订单查询
    // orderSearch: {
    //   development: 'http://workbench.yyuap.com',
    //   daily: 'https://workbench-daily.yyuap.com',
    //   production: 'https://www.diwork.com',
    //   combine: 'https://u8c-daily.yyuap.com',
    //   pre: 'https://y3me-pre.diwork.com',
    //   integrate: 'https://workbench-daily.yyuap.com'
    // }
    // 工单和用友云官网  u8c没有  2
    // order: {
    //   production: 'https://ticket.yonyoucloud.com',
    //   development: 'https://ticket.yonyoucloud.com',
    //   daily: 'https://ticket.yonyoucloud.com',
    //   integrate: 'https://ticket.yonyoucloud.com',
    //   combine: 'https://ticket.yonyoucloud.com',
    //   pre: '',
    // },
    // 工单和用友云官网 u8c没有  2
    // cloundyy: {
    //   production: 'https://www.yonyoucloud.com',
    //   development: 'https://cloudtest.yyuap.com',
    //   daily: 'https://www.yonyoucloud.com',
    //   integrate: 'https://www.yonyoucloud.com',
    //   combine: 'https://www.yonyoucloud.com',
    //   pre: '',
    // },
    // 空间管理
    // manageTeamEnter: {
    //   production: 'https://nec.diwork.com/static/home.html#/spaceList/joined?target=pc',
    //   development: 'http://web.yyuap.com:91/static/home.html#/spaceList/joined?target=pc',
    //   daily: 'https://ec-daily.yyuap.com/static/home.html#/spaceList/joined?target=pc',
    //   integrate: 'https://ec-daily.yyuap.com/static/home.html#/spaceList/joined?target=pc',
    //   combine: 'https://ec-u8c-daily.yyuap.com/static/home.html#/spaceList/joined?target=pc',
    //   pre: '',
    // },
    // 上传
    // upload: {
    //   production: 'https://bd.diwork.com/manager/file/upload/oss/workbench-image-path-applicationIcon',
    //   development: 'http://workbenchdev.yyuap.com/manager/file/upload/oss/workbench-image-path-applicationIcon',
    //   daily: 'http://workbenchdev.yyuap.com/manager/file/upload/oss/workbench-image-path-applicationIcon',
    //   integrate: 'http://workbenchdev.yyuap.com/manager/file/upload/oss/workbench-image-path-applicationIcon',
    //   combine: 'https://u8c-daily.com/manager/file/upload/oss/workbench-image-path-applicationIcon',
    //   pre: 'https://y3me-pre.diwork.com/manager/file/upload/oss/workbench-image-path-applicationIcon'
    // },
  };

  if (key == 'ref') {
    let profile = "";
    if (window.diworkContext) {
      profile = window.diworkContext().profile
    } else if (window.managerContext) {
      profile = window.managerContext.profile
    }
    if (profile == 'iteration') {
      return 'http://yonsuite-iter.yyuap.com'
    }
  }
  return hosts[key][process.env.NODE_ENV] || "";
};
//ie11的window.ActiveXObject返回undefined，
export const IS_IE = !!window.ActiveXObject || "ActiveXObject" in window;

const fetchTools = {
  params(params) {
    try {
      return Object.keys(params).map((key) => {
        let param = params[key];
        switch (typeof param) {
          case 'object':
            param = escape(JSON.stringify(param));
            break;
          case 'undefined':
            param = '';
            break;
          default:
            break;
        }
        return `${key}=${param}`;
      }).join('&');
    } catch (e) {
      console.log('error in urlParams');
      return '';
    }
  },
  fetch(url, options, withEc) {
    return fetch(url, options).then((response) => {
      if (response.ok) {
        return response.text().then((text) => {
          if (text) {
            let result = {
              status: 0,
              msg: '接口请求失败',
            };
            try {
              result = JSON.parse(text);
            } catch (e) {
              return Promise.reject(new Error('接口返回数据无法解析'));
            }
            const { status, data, msg, errorCode, needrelogin } = result;
            let _data = {};
            // 获取隔离的接口没有status,data这一项
            if ((url.indexOf("/ref/diwork/iref_ctr/refInfo") > -1)) {
              return Promise.resolve(result);
              // } else if (status && status !== '0' || withEc && (result.code === 0 || result.code ===100010001 || result.code === 8000030001)) {
            }
            if (status && status !== '0' || withEc && result.code === 0) { // withEc && result.code === 0 为了兼容友空间数据返回格式
              // 获取语种索引
              const index = getLocaleIndex();
              // 赋值_data
              if (index > -1 && typeof data === "object") {
                _data = _diff(index + 2, data, "set");
              } else {
                _data = data;
              }
              return Promise.resolve(_data);
            }
            if (needrelogin) {
              return Promise.resolve(result);
            }
            if (errorCode) {
              if (errorCode == "000001") {
                logout();
                return;
              }
              if (errorCode == "888888") {
                return Promise.resolve(result);
              }
            }
            return Promise.reject(msg);
          }
          return Promise.reject(new Error('接口未返回数据'));
        });
      }
      return Promise.reject(new Error('请求失败'));
    });
  },
  options(method = 'get', options = {}, withEc) {
    const headers = withEc ?
      {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      } :
      {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'isAjax': 1,
      }
    // 判断当前登录的是portal 则增加header头
    const { defaultDesktop } = getContext();
    // !withEc 主要是为了判断他们自己跨域请求的， 不增加判断是否工作台还是权限， 是因为权限获取不到getContext
    if (defaultDesktop === "portal" && !withEc) {
      headers.isPortal = true;
    }
    return {
      method: method.toUpperCase(),
      credentials: 'include',
      cache: 'no-cache',
      headers: headers,
      ...options,
    };
  },
  url(url) {
    if (!url) {
      throw new Error('has no url!');
    } else if (url.indexOf('http') !== 0) {
      const { defaultDesktop } = getContext();
      // 当前如果是友空间， 则固定url   workbench.yyuap.com +
      url = defaultDesktop === "portal" && window.location.port !== "3000" ? `${getHost('workbench')}${url}` : `${getHost()}${url}`;
    }
    return url;
  },
};

export function post(oriUrl, oriParams = {}, isExt) {
  const {
    fetch,
    options: optionsMaker,
    url,
  } = fetchTools;
  let data = {};
  const index = getLocaleIndex();
  // TOdo忘记后边判断是为了啥了。 先注释， isExt 当初也是为了多语言， 现在暂时换成 支持门户
  // if (index > -1 && typeof oriParams === "object" || isExt) {
  if (index > -1) {
    data = _diff(index + 2, oriParams, "get");
  } else {
    data = oriParams;
  }
  const options = optionsMaker('post', {}, isExt);
  // 当不是门户发起的请求， content-type
  if (!isExt) {
    options.headers['Content-Type'] = 'application/json;charset=UTF-8';
  }

  try {
    // 是不是门户发起的请求， body
    if (isExt) {
      let reset = '';
      for (let it in data) {
        reset += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      options.body = reset;
    } else {
      options.body = JSON.stringify(data);
    }
  } catch (e) {
    return Promise.reject(e);
  }
  return fetch(url(oriUrl), options, isExt);
}

export function deleteRequest(oriUrl, oriParams = {}) {
  const {
    fetch,
    options: optionsMaker,
    url,
  } = fetchTools;
  const options = optionsMaker('delete', {}, true);

  try {
    // 是不是门户发起的请求， body
    let reset = '';
    for (let it in oriParams) {
      reset += encodeURIComponent(it) + '=' + encodeURIComponent(oriParams[it]) + '&'
    }
    options.body = reset;
  } catch (e) {
    return Promise.reject(e);
  }
  return fetch(url(oriUrl), options, true);
}

export function postFileCros(oriUrl, file) {
  const {
    params,
    fetch,
    options: optionsMaker,
    url,
  } = fetchTools;
  const options = optionsMaker('post', {
    mode: 'cors',
  });
  delete options.headers;
  try {
    options.body = file;
  } catch (e) {
    return Promise.reject(e);
  }
  console.log(options);
  return fetch(url(oriUrl), options);
}

export function get(oriUrl, oriParams = {}, withEc) {
  const {
    params,
    fetch,
    options,
    url: urlMaker,
  } = fetchTools;

  const data = params(oriParams);
  let url = urlMaker(oriUrl);
  // 这里是授权参照的请求接口 不需要manager
  if (oriUrl === "/ref/diwork/iref_ctr/refInfo" || oriUrl.indexOf('/ref/diwork/iref_ctr/refInfo') > -1) {
    url = oriUrl;
    let arr = data.split('&');
    let objData = {};
    for (let index = 0; index < arr.length; ++index) {
      let curr = arr[index].split('=');
      objData[curr[0]] = curr[1];
    }
    return jsonp({ url, data: objData });
  }
  if (data) {
    url = `${url}?${data}`;
  }
  let fh = url.indexOf("?") == -1 ? "?" : "&";
  url += fh + "tm=" + new Date().getTime();
  return fetch(url, options("get", {}, withEc), withEc);
}

function jsonp(options) {
  return new Promise((resolve, reject) => {
    let callbackID = `jsonp_${Date.now()}`,
      container = document.getElementsByTagName('head')[0],
      scriptNode = document.createElement("script"),
      data = options.data || {},
      url = options.url,
      params = [];
    data["callback"] = callbackID
    for (let key in data) {
      params.push(key + "=" + data[key]);
    }

    url += (/\?/.test(url)) ? '&' : '?';
    url += params.join('&');
    scriptNode.id = callbackID;
    scriptNode.src = url;
    function removeNode() {
      window[callbackID] = undefined;
      let script = document.getElementById(callbackID)
      container.removeChild(script)
    }
    scriptNode.onerror = function () {
      reject();
      removeNode()
    }
    window[callbackID] = function (response) {
      resolve(response);
      removeNode()
    }
    scriptNode.type = "text/javascript";
    try {
      container.appendChild(scriptNode)
    } catch (err) {
      reject(err)
    }
  })
}


export function mapStateToProps(...keys) {
  if (keys.length) {
    return (state, ownProps) => {
      const rootState = state;
      let { namespace } = keys.slice(-1)[0];
      if (namespace) {
        namespace = namespace.split('.');
        state = namespace.reduce(
          (subState, space) => {
            let stateByNamespace = subState[space];
            if (!stateByNamespace) {
              stateByNamespace = subState;
            }
            return stateByNamespace;
          },
          state,
        );
      }

      return keys.reduce((obj, key) => {
        if (typeof key === 'string') {
          obj[key] = state[key];
        } else if (
          typeof key === 'object' &&
          typeof key.key === 'string' &&
          typeof key.value === 'function'
        ) {
          obj[key.key] = key.value(state, ownProps, rootState);
        }
        return obj;
      }, {});
    };
  } else {
    return () => ({});
  }
}

export function guid() {
  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  return `LS-${(S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4())}`;
}

export function findPath(datas, childrenKey, compareKey, compareValue) {
  const paths = [];
  function loop(children) {
    for (let i = 0, l = children.length; i < l; i++) {
      let result = false;
      const child = children[i];
      paths.push(child);
      if (child[childrenKey]) {
        result = loop(child[childrenKey]);
      }
      let value;
      try {
        value = compareKey.split('.').reduce((obj, key) => {
          return obj[key]
        }, child);
      } catch (e) {
        console.log(e);
      }
      if (value === compareValue) {
        result = true;
      }
      if (result) {
        return result;
      } else {
        paths.pop();
      }
    }
    return false;
  }
  loop(datas);
  return paths;
}

export function avoidSameName(namaArr, name) {
  const reg = new RegExp(`^${name}(\\((\\d+)\\)){0,1}$`);
  let num = 0;
  namaArr.forEach((item) => {
    if (reg.test(item)) {
      let curNum = item.match(reg)[2];
      if (curNum) {
        curNum = parseInt(curNum, 10) + 1;
        if (curNum > num) {
          num = curNum;
        }
      } else if (!num) {
        num = 1;
      }
    }
  });
  if (num) {
    return `${name}(${num})`;
  } else {
    return name;
  }
}

export function getContext() {
  if (window.diworkContext && typeof window.diworkContext === 'function') {
    const result = window.diworkContext();
    if (result.productLine.indexOf("u8c") > -1) {
      result.productLine = "u8c";
    }
    return result;
  } else {
    return {};
  }
}


/**
 * 汉子超过3位截取，其他字符8位数
 * @param {*} str
 */
export function getStrLenSubstr(str, zh_len, cn_len, sl) {
  if (!str) return "";
  let newStr = "";
  var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
  if (reg.test(str)) {
    if (str.length == zh_len) {
      newStr = str;
    } else {
      newStr = str.length > zh_len ? str.substring(0, zh_len) + (sl ? "" : "...") : str;
    }
  } else {
    if (str.length == cn_len) {
      newStr = str;
    } else {
      newStr = str.length > cn_len ? str.substring(0, cn_len) + (sl ? "" : "...") : str;
    }
    // newStr = str.substring(0,cn_len)+(sl?"":"...");
  }
  return newStr;
}

export function browserRedirect() {
  var sUserAgent = navigator.userAgent.toLowerCase();
  var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
  var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
  var bIsMidp = sUserAgent.match(/midp/i) == "midp";
  var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
  var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
  var bIsAndroid = sUserAgent.match(/android/i) == "android";
  var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
  var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";

  if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM))  //判断是否有非pc的值存在
  {
    // alert("pc");
    //没有，则显示为pc
    return ("pc");
  } else {
    if (bIsIpad.length != 0) { return ("ipad"); }
    if (bIsIphoneOs.length != 0) { return ("iphone os"); }
    if (bIsMidp.length != 0) { return ("midp"); }
    if (bIsUc7.length != 0) { return ("rv:1.2.3.4"); }
    if (bIsUc.length != 0) { return ("ucweb"); }
    if (bIsAndroid.length != 0) { return ("android"); }
    if (bIsCE.length != 0) { return ("windows ce"); }
    if (bIsWM.length != 0) { return ("windows mobile"); }
    //显示对应的产品名称
  }
}

export function postMessageToWin(win, data) {
  if (win && data) {
    win.postMessage(JSON.stringify(data), '*');
  }
}
// 获取location 参数
export function GetQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]); return null;
}

export function getNewEvent(name) {
  if (IS_IE) {
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, true, true, undefined);
    return evt;
  } else {
    return new Event(name, {
      bubbles: true,
    });
  }
}

export function equals(x, y) {
  var f1 = x instanceof Object;
  var f2 = y instanceof Object;
  if (!f1 || !f2) {
    return x === y
  }
  if (Object.keys(x).length !== Object.keys(y).length) {
    return false
  }
  var newX = Object.keys(x);
  for (var p in newX) {
    p = newX[p];
    var a = x[p] instanceof Object;
    var b = y[p] instanceof Object;
    if (a && b) {
      let equal = equals(x[p], y[p])
      if (!equal) {
        return equal
      }
    } else if (x[p] != y[p]) {
      return false;
    }
  }
  return true;
}


const _diff = (_index, _data, type) => {
  const data = JSON.parse(JSON.stringify(_data));
  const loop = (data) => {
    if (typeof data === "object" && Array.isArray(data) && data.length) {
      data.forEach(item => {
        if (item && typeof item === "object" && (item.length !== 0 || Object.keys(item).length)) {
          loop(item);
        }
      });
    } else if (typeof data === "object" && Object.keys(data).length) {
      // 获取 JSON VALUE  数组   [a,a1,b,c]
      const dataKeys = Object.keys(data);
      dataKeys.forEach((item, index) => {
        const currKey = item + 'Ext' + _index;
        const currKey2 = item + _index;
        if (dataKeys.includes(currKey)) {
          const currItem = data[currKey];
          if (!currItem) {
            return;
          }
          // 判断是设置 新属性  还是读取新属性的
          if (type == "set") {
            data.TEMPORARY = data[item];
            data[item] = currItem;
          } else {
            data[currKey] = data[item];
            data[item] = data.TEMPORARY;
            delete data.TEMPORARY;
          }
        } else if (dataKeys.includes(currKey2)) {
          const currItem = data[currKey2];
          if (!currItem) {
            return;
          }
          if (type == "set") {
            data.TEMPORARY = data[item];
            data[item] = currItem;
          } else {
            data[currKey2] = data[item];
            data[item] = data.TEMPORARY;
            delete data.TEMPORARY;
          }
        }
        const currData = data[item];
        if (!currData) return;
        if (typeof currData === "object" && (currData.length !== 0 || Object.keys(currData).length)) {
          loop(currData);
        }
      });
    }
    return data;
  }
  return loop(data);
}

export function addWidthAndHeight(a) {
  switch (a.size) {
    case 1:
      a.height = 1;
      a.width = 1;
      break;
    case 2:
      a.height = 1;
      a.width = 2;
      break;
    case 3:
      a.height = 2;
      a.width = 2;
      break;
    case 4:
      a.height = 1;
      a.width = 3;
      break;
    case 5:
      a.height = 2;
      a.width = 3;
      break;
    case 6:
      a.height = 1;
      a.width = 4;
      break;
    case 7:
      a.height = 2;
      a.width = 4;
      break;
    case 8:
      a.height = 2;
      a.width = 6;
      break;
    case 9:
      a.height = 4;
      a.width = 6;
      break;
    default:
      a.height = 1;
      a.width = 1;
  }
}
