/**
 * Created by yan on 16-2-25.
 */

var sum = 0;

var bindFetchNext = (func)=> {
  return res=> {
    var LINK = res.headers.get('Link');
    if (LINK) {
      var matched = LINK.match(/<([^<>]+)>; rel="next"/);
      if (matched) {
        setTimeout(()=> {
          func.call(null, matched[1]);
        }, 100)

      }
    }
    return res;
  }
}

var traverseStargazers = function (url) {
  fetch(url,
    {headers: {'Accept': 'application/vnd.github.v3.star+json'}})
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

self.addEventListener('message', function (e) {
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
});