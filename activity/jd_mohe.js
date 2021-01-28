/*
热8超级盲盒，可抽奖获得京豆，建议在凌晨0点时运行脚本，白天抽奖基本没有京东
活动地址: https://blindbox.jd.com
活动时间到18号
支持京东双账号
更新时间：2020-08-17
脚本兼容: QuantumultX, Surge,Loon, JSBox, Node.js
// quantumultx
[task_local]
#热8超级盲盒
1 0,1-23/3 * * * https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_mohe.js, tag=热8超级盲盒, enabled=true
// Loon
[Script]
cron "1 0,1-23/3 * * *" script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_mohe.js,tag=热8超级盲盒
// Surge
热8超级盲盒 = type=cron,cronexp=1 0,1-23/3 * * *,wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_mohe.js
 */
const $ = new Env('热8超级盲盒');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('../jdCookie.js') : '';

//直接用NobyDa的jd cookie
let cookie = jdCookieNode.CookieJD ? jdCookieNode.CookieJD : $.getdata('CookieJD');
const cookie2 = jdCookieNode.CookieJD2 ? jdCookieNode.CookieJD2 : $.getdata('CookieJD2');
let UserName = '';
const JD_API_HOST = 'https://blindbox.jd.com';
let shareId = '';
!(async () => {
  if (!cookie) {
    $.msg('【京东账号一】热8超级盲盒', '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
  } else {
    UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
    // await shareUrl();
    // await addShare();
    await getCoin();//领取每三小时自动生产的热力值
    await Promise.all([
      task0(),
      task1(),
    ])
    await taskList();
    await getAward();//抽奖
    if ($.time('yyyy-MM-dd') === '2020-08-19') {
      $.msg($.name, '活动已结束', `请禁用或删除脚本\n如果帮助到您可以点下STAR鼓励我一下,谢谢\n咱江湖再见\nhttps://github.com/LXK9301/jd_scripts\n`, {"open-url": "https://github.com/LXK9301/jd_scripts"});
    } else {
      $.msg($.name, '', `【京东账号一】${UserName}\n任务已做完.\n 抽奖详情查看 https://blindbox.jd.com\n`, {"open-url": "https://blindbox.jd.com"});
    }
  }
  await $.wait(1000);
  if (cookie2) {
    cookie = cookie2;
    UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1]);
    console.log(`\n开始【京东账号二】${UserName}\n`)
    await getCoin();//领取每三小时自动生产的热力值
    await Promise.all([
      task0(),
      task1(),
    ])
    await taskList();
    await getAward();//抽奖
    $.msg($.name, '', `【京东账号二】${UserName}\n任务已做完.\n 抽奖详情查看 https://blindbox.jd.com\n`, {"open-url": "https://blindbox.jd.com"});
  }
})()
    .catch((e) => {
      $.log('', ` ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
      $.done();
    })


async function task0() {
  const confRes = await conf();
  if (confRes.code === 200) {
    const { brandList, skuList } = confRes.data;
    if (skuList && skuList.length > 0) {
      for (let item of skuList) {
        if (item.state === 0) {
          let homeGoBrowseRes = await homeGoBrowse(0, item.id);
          console.log('商品', homeGoBrowseRes);
          await $.wait(1000);
          const taskHomeCoin0Res = await taskHomeCoin(0, item.id);
          console.log('商品领取金币', taskHomeCoin0Res);
          // if (homeGoBrowseRes.code === 200) {
          //   await $.wait(1000);
          //   await taskHomeCoin(0, item.id);
          // }
        } else {
          console.log('精选好物任务已完成')
        }
      }
    }
  }
}
async function task1() {
  const confRes = await conf();
  if (confRes.code === 200) {
    const { brandList, skuList } = confRes.data;
    if (brandList && brandList.length > 0) {
      for (let item of brandList) {
        if (item.state === 0) {
          let homeGoBrowseRes = await homeGoBrowse(1, item.id);
          // console.log('店铺', homeGoBrowseRes);
          await $.wait(1000);
          const taskHomeCoin1Res = await taskHomeCoin(1, item.id);
          console.log('店铺领取金币', taskHomeCoin1Res);
          // if (homeGoBrowseRes.code === 200) {
          //   await $.wait(1000);
          //   await taskHomeCoin(1, item.id);
          // }
        } else {
          console.log('精选店铺-任务已完成')
        }
      }
    }
  }
}
function addShare(id) {
  console.log(`shareId${shareId}`);
  return new Promise((resolve) => {
    const url = `addShare?shareId=${shareId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        data = JSON.parse(data);
        // console.log('ddd----ddd', data)

      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function conf() {
  return new Promise((resolve) => {
    const url = `conf`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('ddd----ddd', data)
        data = JSON.parse(data);
        // console.log('ddd----ddd', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function homeGoBrowse(type, id) {
  return new Promise((resolve) => {
    const url = `homeGoBrowse?type=${type}&id=${id}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskHomeCoin(type, id) {
  return new Promise((resolve) => {
    const url = `taskHomeCoin?type=${type}&id=${id}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function getCoin() {
  return new Promise((resolve) => {
    const url = `getCoin?t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        if (data.code === 1001) {
          console.log(data.msg);
          $.msg($.name, '领取失败', `${data.msg}`);
          $.done();
        } else {
          console.log(`成功领取${data.data}热力值`)
          resolve(data);
        }
      } catch (e) {
        $.logErr(e, resp);
      }
    })
  })
}
function taskList() {
  return new Promise((resolve) => {
    const url = `taskList?t=${Date.now()}`;
    $.get(taskurl(url), async (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        console.log(`请继续等待,正在做任务,不要退出哦`)
        // console.log(`成功领取${data.data}热力值`)
        if (data.code === 200) {
          const { task4, task6, task2, task1 } = data.data;
          if (task4.finishNum < task4.totalNum) {
            await browseProduct(task4.skuId);
            await taskCoin(task4.type);
          }
          //浏览会场
          if (task1.finishNum < task1.totalNum) {
            await strollActive((task1.finishNum + 1));
            await taskCoin(task1.type);
          }
          if (task2.finishNum < task2.totalNum) {
            await strollShop(task2.shopId);
            await taskCoin(task2.type);
          }
          if (task6.finishNum < task6.totalNum) {
            await strollMember(task6.venderId);
            await taskCoin(task6.type);
          }
          if (task4.state === 2 && task1.state === 2 && task2.state === 2 && task6.state === 2) {
            console.log('taskList的任务全部做完了---')
          } else {
            await taskList();
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//浏览商品(16个)
function browseProduct(skuId) {
  return new Promise((resolve) => {
    const url = `browseProduct?0=${skuId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
// 浏览会场(10个)
function strollActive(index) {
  return new Promise((resolve) => {
    const url = `strollActive?0=${index}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//关注或浏览店铺(9个)
function strollShop(shopId) {
  return new Promise((resolve) => {
    const url = `strollShop?shopId=${shopId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
// 加入会员(7)
function strollMember(venderId) {
  return new Promise((resolve) => {
    const url = `strollMember?venderId=${venderId}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}

function taskCoin(type) {
  return new Promise((resolve) => {
    const url = `taskCoin?type=${type}&t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
async function getAward() {
  const coinRes = await coin();
  if (coinRes.code === 200) {
    const { total, need } = coinRes.data;
    if (total > need) {
      const times = Math.floor(total / need);
      for (let i = 0; i < times; i++) {
        await $.wait(2000);
        let lotteryRes = await lottery();
        if (lotteryRes.code === 200) {
          console.log(`====抽奖结果====,${JSON.stringify(lotteryRes.data)}`);
          console.log(lotteryRes.data.name);
          console.log(lotteryRes.data.beanNum);
        } else if (lotteryRes.code === 4001) {
          console.log(`抽奖失败,${lotteryRes.msg}`);
          break;
        }
      }
    } else {
      console.log(`目前热力值${total},不够抽奖`)
    }
  }
}
//获取有多少热力值
function coin() {
  return new Promise((resolve) => {
    const url = `coin?t=${Date.now()}`;
    $.get(taskurl(url), (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
//抽奖API
function lottery() {
  return new Promise((resolve) => {
    const options = {
      'url': `${JD_API_HOST}/prize/lottery?t=${Date.now()}`,
      'headers': {
        "accept": "*/*",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie,
        "referer": "https://blindbox.jd.com/",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.get(options, (err, resp, data) => {
      try {
        // console.log('homeGoBrowse', data)
        data = JSON.parse(data);
        // console.log('homeGoBrowse', data)
        // console.log(`成功领取${data.data}热力值`)
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(data);
      }
    })
  })
}
function taskurl(url) {
  return {
    'url': `${JD_API_HOST}/active/${url}`,
    'headers': {
      "accept": "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
      "content-type": "application/x-www-form-urlencoded",
      "cookie": cookie,
      "referer": "https://blindbox.jd.com/",
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
    }
  }
}
// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============系统通知=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`${this.name}, 错误!`,t.stack):this.log("",`${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`${this.name}, 结束!  ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}