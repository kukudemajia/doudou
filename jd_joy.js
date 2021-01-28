/*
jd宠汪汪 搬的https://github.com/uniqueque/QuantumultX/blob/4c1572d93d4d4f883f483f907120a75d925a693e/Script/jd_joy.js
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
IOS用户支持京东双账号,NodeJs用户支持N个京东账号
更新时间：2021-1-26
活动入口：京东APP我的-更多工具-宠汪汪
建议先凌晨0点运行jd_joy.js脚本获取狗粮后，再运行此脚本(jd_joy_steal.js)可偷好友积分，6点运行可偷好友狗粮
feedCount:自定义 每次喂养数量; 等级只和喂养次数有关，与数量无关
推荐每次投喂10个，积累狗粮，然后去玩聚宝盆赌
Combine from Zero-S1/JD_tools(https://github.com/Zero-S1/JD_tools)
==========Quantumult X==========
[task_local]
#京东宠汪汪
15 0-23/2 * * * https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy.js, tag=京东宠汪汪, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true

============Loon===========
[Script]
cron "15 0-23/2 * * *" script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy.js,tag=京东宠汪汪

============Surge==========
[Script]
京东宠汪汪 = type=cron,cronexp="15 0-23/2 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy.js

===============小火箭==========
京东宠汪汪 = type=cron,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy.js, cronexpr="15 0-23/2 * * *", timeout=3600, enable=true
*/

const $ = new Env('宠汪汪');
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
let message = '', subTitle = '';
let FEED_NUM = ($.getdata('joyFeedCount') * 1) || 10;   //每次喂养数量 [10,20,40,80]
let teamLevel = `2`;//参加多少人的赛跑比赛，默认是双人赛跑，可选2，10,50。其他不可选，其中2代表参加双人PK赛，10代表参加10人突围赛，50代表参加50人挑战赛，如若想设置不同账号参加不同类别的比赛则用&区分即可(如：`2&10&50`)
//是否参加宠汪汪双人赛跑（据目前观察，参加双人赛跑不消耗狗粮,如需参加其他多人赛跑，请关闭）
// 默认 'true' 参加双人赛跑，如需关闭 ，请改成 'false';
let joyRunFlag = true;
let jdNotify = true;//是否开启静默运行，默认true开启
let joyRunNotify = true;//宠汪汪赛跑获胜后是否推送通知，true推送，false不推送通知
const JD_API_HOST = 'https://jdjoy.jd.com/pet'
const weAppUrl = 'https://draw.jdfcloud.com//pet';
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
      message = '';
      subTitle = '';
      await jdJoy();
      await showMsg();
      // await joinTwoPeopleRun();
    }
  }
})()
    .catch((e) => {
      $.log('', `