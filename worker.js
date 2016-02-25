// 切换 repo 需要重置 sum
var sum = 0;

/**
 *
 * @param func 要绑定的 fetch 函数
 * @returns {Function}
 */
var bindFetchNext = func=> {
  return res=> {
    var LINK = res.headers.get('Link');
    if (LINK) {
      var matched = LINK.match(/<([^<>]+)>; rel="next"/);
      if (matched) {
        // 默认间隔 0.1 秒后再发送请求
        setTimeout(()=> {
          func.call(null, matched[1]);
        }, 100)
      }
    }
    return res;
  }
}

/**
 * 每次调用获取最多 100 个 Star 了某个项目的用户列表
 * @param url
 */
var traverseStargazers = url=> {
  fetch(url, {headers: {'Accept': 'application/vnd.github.v3.star+json'}})
    .then(bindFetchNext(traverseStargazers))
    .then(res=>res.json())
    .then(res=> {
      self.postMessage({
        type: 'ADD_DATA',
        payload: res.map(item=> ({
          x: item.starred_at,
          y: ++sum,
          type: 'point',
          content: `<a target="_blank" href="${item.user.html_url}">${item.user.login.slice(0, 8)}...</a>`,
          start: item.starred_at
        }))
      })
    })
}

/**
 * 用于处理主线程发过来的 message
 *
 * @param e
 */
var messageHandler = e=> {
  var repo = e.data;
  sum = 0;
  fetch('https://api.github.com/repos/' + repo)
    .then(res=>res.json())
    .then(res=> {
      self.postMessage({
        type: 'SET_WINDOW',
        payload: res.created_at
      });
      traverseStargazers('https://api.github.com/repos/' + repo + '/stargazers?per_page=100');
    })
}

self.addEventListener('message', messageHandler);