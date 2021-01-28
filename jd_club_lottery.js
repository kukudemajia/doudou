/*
* @Author: LXK9301
* @Date: 2020-11-03 20:35:07
* @Last Modified by: LXK9301
* @Last Modified time: 2020-11-23 12:27:09
*/
/*
活动入口：京东APP首页-领京豆-摇京豆
更新时间:2020-10-12
Modified from https://github.com/Zero-S1/JD_tools/blob/master/JD_vvipclub.py
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============QuantumultX==============
[task_local]
#摇京豆
5 0 * * * https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_club_lottery.js, tag=摇京豆, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdyjd.png, enabled=true
=================Loon===============
[Script]
cron "5 0 * * *" script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_club_lottery.js,tag=摇京豆
=================Surge==============
[Script]
摇京豆 = type=cron,cronexp="5 0 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_club_lottery.js

============小火箭=========
摇京豆 = type=cron,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_club_lottery.js, cronexpr="5 0 * * *", timeout=3600, enable=true
*/

const $ = new Env('摇京豆');
const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {};
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.freeTimes = 0;
      $.prizeBeanCount = 0;
      $.totalBeanCount = 0;
      $.isLogin = true;
      $.nickName = '';
      await TotalBean();
      console.log(`\n开始【京东账号${$.index}】${$.nickName || $.UserName}\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await clubLottery();
      await showMsg();
    }
  }
})()
    .catch((e) => {
      $.log('', `