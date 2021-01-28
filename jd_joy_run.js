/**
宠汪汪邀请助力与赛跑助力脚本，感谢github@Zero-S1提供帮助
更新时间：2021-1-7（宠汪汪助力更新Token的配置正则表达式已改）
活动入口：京东APP我的-更多工具-宠汪汪
token时效很短，几个小时就失效了,闲麻烦的放弃就行
每天拿到token后，可一次性运行完毕即可。
互助码friendPin是京东用户名，不是昵称（可在京东APP->我的->设置 查看获得）
token获取途径：
1、微信搜索'来客有礼'小程序,登陆京东账号，点击底部的'我的'或者'发现'两处地方,即可获取Token，脚本运行提示token失效后，继续按此方法获取即可
2、或者每天去'来客有礼'小程序->宠汪汪里面，领狗粮->签到领京豆 也可获取Token(此方法每天只能获取一次)
脚本里面有内置提供的friendPin，如果你没有修改脚本或者BoxJs处填写自己的互助码，会默认给脚本内置的助力。
[MITM]
hostname = draw.jdfcloud.com

===========Surge=================
[Script]
宠汪汪邀请助力与赛跑助力 = type=cron,cronexp="15 10 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js
宠汪汪助力更新Token = type=http-response,pattern=^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/addUser\?code=, requires-body=1, max-size=0, script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js
宠汪汪助力获取Token = type=http-request,pattern=^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/user\/detail\?openId=, requires-body=1, max-size=0, script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js

===================Quantumult X=====================
[task_local]
# 宠汪汪邀请助力与赛跑助力
15 10 * * * https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js, tag=宠汪汪邀请助力与赛跑助力, img-url=https://raw.githubusercontent.com/58xinian/icon/master/jdcww.png, enabled=true
[rewrite_local]
# 宠汪汪助力更新Token
^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/addUser\?code= url script-response-body https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js
# 宠汪汪助力获取Token
^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/user\/detail\?openId= url script-request-header https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js

=====================Loon=====================
[Script]
cron "15 10 * * *" script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js, tag=宠汪汪邀请助力与赛跑助力
http-response ^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/addUser\?code= script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js, requires-body=true, timeout=3600, tag=宠汪汪助力更新Token
http-request ^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/user\/detail\?openId= script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_run.js, requires-body=true, timeout=3600, tag=宠汪汪助力获取Token
 **/
const isRequest = typeof $request != "undefined"
const $ = new Env('宠汪汪赛跑');
const JD_BASE_API = `https://draw.jdfcloud.com//pet`;
//此处填入你需要助力好友的京东用户名
//下面给出好友邀请助力的示例填写规则
let invite_pins = ["jd_6cd93e613b0e5,被折叠的记忆33,jd_704a2e5e28a66,jd_45a6b5953b15b,zooooo58,jd_66f5cecc1efcd,jd_41345a6f96aa5"];
//下面给出好友赛跑助力的示例填写规则
let run_pins = ["被折叠的记忆33,jd_6cd93e613b0e5,jd_66f5cecc1efcd,jd_sIhNpDXJehOr,jd_41345a6f96aa5,jd_704a2e5e28a66,zooooo58"];
// $.LKYLToken = '76fe7794c475c18711e3b47185f114b5' || $.getdata('jdJoyRunToken');
// $.LKYLToken = $.getdata('jdJoyRunToken');
const friendsArr = ["jd_DcDTMOblJHiM", "jd_553ea3a6ef2f4", "yhr_19820404", "13008094886_p", "13966269193_p", "jd_4e4d9825e5fb1", "jd_5ff306cf94512", "ququkoko", "jd_59a9823f35496", "529577509-275616", "18923155789_p", "jd_455da88071d1e", "dreamscometrue5120", "蒋周南19620607", "jd_620ceca400151", "杉雨2011", "MARYMY88", "13682627696_p", "jd_6777ee65f9fcc", "夏海东12315", "jd_437b4f3fa5d83", "zyjyc9998", "meoygua", "MLHK7288", "jd_42d9ce3001acd", "jd_57650a30ef6eb", "jd_44ca1016e0f96", "jd_74332d1d62a97", "jd_7dbe4f8a40a7d", "jd_4fa238e4e3039", "elbereth1122", "jd_4d9be23908e41", "jd_51f0d43d78900", "13588108107_p", "123by456", "09niuniuma", "143798682-947527", "jd_560c6f30e6951", "jd_54ddb8af5374a", "夏革平", "247466310", "wang2011", "chensue", "1362245003-624122", "wdGefYCBlyOuvz", "jd_412f7eb363cd8", "18311575050_p", "1307976-34738981", "wdgOGLtOJjjbnp", "klhzdx", "jd_5fdcdcb183d7d", "jd_5862fd8834680", "jd_6cd93e613b0e5", "jd_51a64a9da6b94", "302990512-553401", "jd_4078f69a72873", "jd_ewYCRdmukzQH", "13348822441_p", "hlcx86021", "390823571-784974", "jd_79af2bc7a56a3", "15053231812_p", "jd_6f53253d117c5", "jd_5bf29dffa62ea", "jd_47a1c4ad02103", "刘凤苓", "145391572-102667", "yanglan0409", "jd_4b8a70f3b06c3", "弑神X", "jd_59d962a076126", "sjw3000", "jd_4d4def8b59787", "L1518235423", "jd_579b891fbea9b", "frank818", "hellohuhua", "jd_4cf1918577871", "jd_akYbyiXqrIDC", "李纪红", "jd_54a4260ca986c", "jd_4cba35cfa8220", "13654075776_p", "13916051043", "jd_6f9b9a6769afb", "iamkgbfox", "jd_5fbda9be54d5b", "jd_76763ba485c5e", "jd_45a6b5953b15b", "jd_485c757b79422", "xiaojingang_0", "lanye1545", "chenzhiyun2002", "lmpbjs1988", "jd_SmPxpudoGYOb", "jwl19690905", "荷舞弄清影88", "jd_750d6a9734717", "jd_64e37854e713f", "jd_573c9832d8989", "wdkplHVQlgowTW", "wwk232323", "jd_6bfe51f915c90", "我手机号码", "13681610268_p", "ss836580793", "15868005933_p", "zooooo58", "陌上花开花又落", "jd_701f52f8badbb", "jd_462f9229c20e4", "jd_42193689987a0", "jd_7dc5829121bcc", "13656692651_phz", "jd_47f49f22f1dc3", "handechun959", "13775208986_p", "guoyizhang", "jd_677dd20bf2749", "被折叠的记忆33", "jd_FfAnqFVEoBul", "jd_4e59841cae4f9", "jd_5279d593e7803", "思绪随风2011", "jd_62e335d785872", "suyugen", "jd_4e68b48d16f7b", "jd_56b7a4e092e85", "cocoty", "jd_7b6d6e7dc98f1", "jd_63423cd594e8b", "greatyunyun", "4349小丢丢", "18027486801_p", "15207695569_p", "llbai11", "wdNRUvbJItetlvB", "jd_54154982c707f", "85192cool", "jd_60d497271825b", "greatyunyun9320", "ky252571504", "jd_74e60dbcae365", "wdiicnSbYSHWwE", "jd_529a0a309d418", "jd_7be92b11b7e8f", "13486659225_p", "jd_iFnquhpWWAzO", "jd_6e348ece13e20", "jd_6f5b49bb757cb", "znz传奇", "418001066_m", "jd_67ded5748c3ab", "361372-27819972", "jd_5fafb631c98af", "jd_76dd04e844d63", "小鹿Jenny", "00数字方程式", "jd_77a82b603c6c3", "勇敢的小泪", "jd_4481f68984466", "jd_758f5224ee957", "mwb1992062_m", "15975229552_p", "zdj8341", "pet_virtual_friend_胡皋三", "pet_virtual_friend_绿茶sama", "pet_virtual_friend_Ainio", "jd_4915949b7bfa1", "jd_7ca74ed9224ef", "jd_42764f5ea2341", "5317123-63418293", "jd_40a2d9485cbdb", "qazmcl1230", "jd_7ced325aba4fd", "jd_402fe7425fcaf", "95581245-627991", "luffy-314_m", "jd_BCXgLlmxHdiS", "jd_610b3d00928e5", "你要醒来", "338379384-148135", "pet_virtual_friend_乔治桑", "jd_54130a3e282ea", "jd_6169b3411ed5b", "jd_428d930ca56a5", "qq6924309", "pet_virtual_friend_路遇狗与少年", "jd_712bd3bfd55d6", "jd_4e97fe5ca4003", "tommy_he1", "13981372001_p", "129867657-673064", "jd_525d6e7a57e7c", "wdZuirGekSHKmF", "jd_75e1da74980ab", "jd_RVMXldNSQNOP", "jd_5f94da0265e0d", "jd_67ab629be7e61", "13887490621_p", "jd_4e0d529ba3c35", "jd_493918e314b50", "jd_71a220104187a", "jd_vVhhkdUpTkJQ", "gary388jingdong", "wdjQkAbFobMTyo", "cloud_kim", "jd_558ed75f52d39", "15555448319_p", "wdhxZuEvXhhvCf", "jd_72b940be8c0f4", "congcong炒葱葱", "jd_7eb0de64eb25a", "13209558123_p", "jd_53bf7cb6fb8e6", "jd_4fe620f72fa7c", "夏雨的爱情", "jd_47ba82eb392a5", "jd_LXnFHXoJwXkW", "62160785-578856", "醒醒该睡了", "jd_LOEWgvNwQIWD", "xiiirww", "pet_virtual_friend_特兰克斯", "pet_virtual_friend_Talon", "jd_4f7cd5b108733", "jd_NgNWXMVkJIvk", "jadonglin", "玩家卫弈", "liangxuejingdong", "jd_627171efb7c0a", "jd_53bc7a14f64d6", "15809290902_p", "jd_65a2ab73d9aa5", "jd_6edb943cacbfb", "jd_7f7eabc5caf7d", "jd_725e17effb6a9", "蔡辉煌", "voxb", "gdxx_hhw_m", "jd_78f0d6524a1dc", "jd_sDtnONLeHwfG", "xyyshy1983", "yinlang46", "ypqian", "15817094457_p", "fdxwb", "wuyaoxin2012", "明子溪", "henry1927_m", "chamy99", "jd_461e384274c34", "248358330-645106", "jd_4fd63de4a6033", "蜜糖向日葵", "wonghe", "36453197-121619", "琳琅满目cbb", "jd_5b7cc9e532426", "134795344-89911673", "15211488203_p", "jd_6f1f0722f8365", "jd_JmGCpqgpCtqG", "墨明棋妙陈", "pet_virtual_friend_1314爱澳", "1209815-33190621", "zhouhuayh", "jd_6d3cbb8b0751a", "jd_6e00e826f939b", "jd_704a2e5e28a66", "mztvip", "davidharry", "sara35424", "sun5025", "jd_62ce2385bb364", "352834026-406289", "pet_virtual_friend_丁座的真爱粉", "jd_582eecf8d27a9", "jd_49acdb02e8514", "13976911784_p", "jd_uGzohbhFpRuz", "wzywolfgang", "yjbonny", "沧海不轮回", "649297742_327799447", "倚兰椒", "琳琳8796", "snzh2013", "jd_73751adc04afd", "wdNnlMzPGJJKgqI", "yygt1158", "jd_53df36eb204a0", "花开花花落", "jd_611e082213c89", "jd_71e77d9235cf5", "jd_596fd9fea411f", "jd_7277d200aa1ac", "15230573701_p", "zb19881021", "692620136落", "168876810-159969", "zhushidan100", "上自习的猪", "15602231009_p", "jd_5213fd3fd5e09", "jd_6711f97ee4dfe", "44787591-640051", "MisterGlasses", "jd_7b22bbfe1e7e5", "138555963-81748582", "jd_QEVVkkDTQAlJ", "4932713-24535180", "jd_6dce98c07a644", "jd_DUtPtiiDamDr", "wangyneu", "wBm1TsDy3p_m", "jd_6acd3a6cc79cc","jd_444f5c020f31c","jd_71caf6b3ec4cb", "shin_dynasty", "carola82", "jd_AOhLSBLdSnux", "ningbormb"];

//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '';
const headers = {
  'Connection' : 'keep-alive',
  'Accept-Encoding' : 'gzip, deflate, br',
  'App-Id' : '',
  'Lottery-Access-Signature' : '',
  'Content-Type' : 'application/json',
  'reqSource' : 'weapp',
  'User-Agent' : $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0"),
  'Cookie' : '',
  'openId' : '',
  'Host' : 'draw.jdfcloud.com',
  'Referer' : 'https://servicewechat.com/wxccb5c536b0ecd1bf/633/page-frame.html',
  'Accept-Language' : 'zh-cn',
  'Accept' : '*/*',
  'LKYLToken' : ''
}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
} else {
  //支持 "京东多账号 Ck 管理"的cookie
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
  if ($.getdata('jd_joy_invite_pin')) {
    invite_pins = [];
    invite_pins.push($.getdata('jd_joy_invite_pin'));
  }
  if ($.getdata('jd2_joy_invite_pin')) {
    if (invite_pins.length > 0) {
      invite_pins.push($.getdata('jd2_joy_invite_pin'))
    } else {
      invite_pins = [];
      invite_pins.push($.getdata('jd2_joy_invite_pin'));
    }
  }
  if ($.getdata('jd_joy_run_pin')) {
    run_pins = []
    run_pins.push($.getdata('jd_joy_run_pin'));
  }
  if ($.getdata('jd2_joy_run_pin')) {
    if (run_pins.length > 0) {
      run_pins.push($.getdata('jd2_joy_run_pin'))
    } else {
      run_pins = [];
      run_pins.push($.getdata('jd2_joy_run_pin'));
    }
  }
}

//获取来客有礼Token
let count = 0;
async function getToken() {
  const url = $request.url;
  $.log(`${$.name}url\n${url}\n`)
  if (isURL(url, /^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/addUser\?code=/)) {
    const body = JSON.parse($response.body);
    const LKYLToken = body.data && body.data.token;
    if (LKYLToken) {
      $.log(`${$.name} token\n${LKYLToken}\n`);
      count = $.getdata('countFlag') ? $.getdata('countFlag') * 1 : 0;
      count ++;
      console.log(`count: ${count}`)
      $.setdata(`${count}`, 'countFlag');
      if ($.getdata('countFlag') * 1 === 3) {
        count = 0;
        $.setdata(`${count}`, 'countFlag');
        $.msg($.name, '更新Token: 成功', ``);
        console.log(`开始上传Token`)
        await $.http.get({url: `http://jd.turinglabs.net/api/v2/jd/joy/create/${LKYLToken}/`}).then((resp) => {
          if (resp.statusCode === 200) {
            let { body } = resp;
            console.log(`Token提交结果:${body}`)
            body = JSON.parse(body);
            console.log(`${body.message}`)
          }
        });
      }
      $.setdata(LKYLToken, 'jdJoyRunToken');
    }
    $.done({ body: JSON.stringify(body) })
  } else if (isURL(url, /^https:\/\/draw\.jdfcloud\.com(\/mirror)?\/\/api\/user\/user\/detail\?openId=/)){
    if ($request && $request.method !== 'OPTIONS') {
      const LKYLToken = $request.headers['LKYLToken'];
      //if ($.getdata('jdJoyRunToken')) {
        //if ($.getdata('jdJoyRunToken') !== LKYLToken) {

        //}
        //$.msg($.name, '更新获取Token: 成功', `\n${LKYLToken}\n`);
      //} else {
        //$.msg($.name, '获取Token: 成功', `\n${LKYLToken}\n`);
      //}
      $.setdata(LKYLToken, 'jdJoyRunToken');

      $.msg($.name, '获取Token: 成功', ``);

      // $.done({ body: JSON.stringify(body) })
      $.done({ url: url })
    }
  } else {
    $.done()
  }
}
function readToken() {
  return new Promise(resolve => {
    $.get({url: `http://jd.turinglabs.net/api/v2/jd/joy/read/1/`, 'timeout': 10000}, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(data)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
async function main() {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  const readTokenRes = await readToken();
  if (readTokenRes && readTokenRes.code === 200) {
    $.LKYLToken = readTokenRes.data[0] || $.getdata('jdJoyRunToken');
  } else {
    $.LKYLToken = $.getdata('jdJoyRunToken');
  }
  // $.LKYLToken = $.getdata('jdJoyRunToken');
  console.log(`打印token \n${$.LKYLToken}\n`)
  if (!$.LKYLToken) {
    $.msg($.name, '【提示】请先获取来客有礼宠汪汪token', "微信搜索'来客有礼'小程序\n点击底部的'发现'Tab\n即可获取Token");
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.inviteReward = 0;
      $.runReward = 0;
      console.log(`\n开始【京东账号${$.index}】${UserName}\n`);
      $.jdLogin = true;
      $.LKYLLogin = true;
      console.log(`=============【开始邀请助力】===============`)
      const inviteIndex = $.index > invite_pins.length ? (invite_pins.length - 1) : ($.index - 1);
      let new_invite_pins = invite_pins[inviteIndex].split(',');
      new_invite_pins = [...new_invite_pins, ...getRandomArrayElements(friendsArr, 6)];
      await invite(new_invite_pins);
      if ($.jdLogin && $.LKYLLogin) {
        console.log(`===========【开始助力好友赛跑】===========`)
        const runIndex = $.index > run_pins.length ? (run_pins.length - 1) : ($.index - 1);
        const new_run_pins = run_pins[runIndex].split(',');
        await run(new_run_pins);
      }
      await showMsg();
    }
  }
  $.done()
}
function showMsg() {
  return new Promise(async resolve => {
    if ($.inviteReward || $.runReward) {
      let message = '';
      if ($.inviteReward > 0) {
        message += `给${$.inviteReward / 30}人邀请助力成功,获得${$.inviteReward}积分\n`;
      }
      if ($.runReward > 0) {
        message += `给${$.runReward / 5}人赛跑助力成功,获得狗粮${$.runReward}g`;
      }
      if (message) {
        $.msg($.name, '', `京东账号${$.index} ${UserName}\n${message}`);
      }
    }
    resolve();
  })
}
//邀请助力
async function invite(invite_pins) {
  console.log(`账号${$.index} [${UserName}] 给下面名单的人进行邀请助力\n${invite_pins.map(item => item.trim())}\n`);
  for (let item of invite_pins.map(item => item.trim())) {
    console.log(`\n账号${$.index} [${UserName}] 开始给好友 [${item}] 进行邀请助力`)
    const data = await enterRoom(item);
    if (data) {
      if (data.success) {
        const { helpStatus } = data.data;
        console.log(`helpStatus ${helpStatus}`)
        if (helpStatus=== 'help_full') {
          console.log(`您的邀请助力机会已耗尽\n`)
          break;
        } else if (helpStatus=== 'cannot_help') {
          console.log(`已给该好友 ${item} 助力过或者此friendPin是你自己\n`)
          continue;
        } else if (helpStatus=== 'invite_full') {
          console.log(`助力失败，该好友 ${item} 已经满3人给他助力了,无需您再次助力\n`)
          continue;
        } else if (helpStatus=== 'can_help') {
          console.log(`开始给好友 ${item} 助力\n`)
          const LKYL_DATA = await helpInviteFriend(item);
          if (LKYL_DATA.errorCode === 'L0001' && !LKYL_DATA.success) {
            console.log('来客有礼宠汪汪token失效');
            $.setdata('', 'jdJoyRunToken');
            $.msg($.name, '【提示】来客有礼token失效，请重新获取', "微信搜索'来客有礼'小程序\n点击底部的'发现'Tab\n即可获取Token")
            $.LKYLLogin = false;
            break
          } else {
            $.LKYLLogin = true;
          }
        }
        $.jdLogin = true;
      } else {
        if (data.errorCode === 'B0001') {
          console.log('京东Cookie失效');
          $.msg($.name, `【提示】京东cookie已失效`, `京东账号${$.index} ${UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
          $.jdLogin = false;
          break
        }
      }
    }
  }
  // if ($.inviteReward > 0) {
  //   $.msg($.name, ``, `账号${$.index} [${UserName}]\n给${$.inviteReward/5}人邀请助力成功\n获得${$.inviteReward}积分`)
  // }
}
function enterRoom(invitePin) {
  return new Promise(resolve => {
    headers.Cookie = cookie;
    headers.LKYLToken = $.LKYLToken;
    headers['Content-Type'] = "application/json";
    const options = {
      url: `${JD_BASE_API}/enterRoom/h5?reqSource=weapp&invitePin=${encodeURI(invitePin)}&inviteSource=task_invite&shareSource=weapp&inviteTimeStamp=${Date.now()}`,
      body: '{}',
      headers
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          $.log(`${$.name} API请求失败`)
          $.log(JSON.stringify(err))
        } else {
          // console.log('进入房间', data)
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    });
  })
}
function helpInviteFriend(friendPin) {
  return new Promise((resolve) => {
    headers.Cookie = cookie;
    headers.LKYLToken = $.LKYLToken;
    const options = {
      url: `${JD_BASE_API}/helpFriend?friendPin=${encodeURI(friendPin)}`,
      headers
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.log('API请求失败')
          $.logErr(JSON.stringify(err));
        } else {
          $.log(`邀请助力结果：${data}`);
          data = JSON.parse(data);
          // {"errorCode":"help_ok","errorMessage":null,"currentTime":1600254297789,"data":29466,"success":true}
          if (data.success && data.errorCode === 'help_ok') {
            $.inviteReward += 30;
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    });
  })
}
//赛跑助力
async function run(run_pins) {
  console.log(`账号${$.index} [${UserName}] 给下面名单的人进行赛跑助力\n${(run_pins.map(item => item.trim()))}\n`);
  for (let item of run_pins.map(item => item.trim())) {
    console.log(`\n账号${$.index} [${UserName}] 开始给好友 [${item}] 进行赛跑助力`)
    const combatDetailRes = await combatDetail(item);
    const { petRaceResult } = combatDetailRes.data;
    console.log(`petRaceResult ${petRaceResult}`);
    if (petRaceResult === 'help_full') {
      console.log('您的赛跑助力机会已耗尽');
      break;
    } else if (petRaceResult === 'can_help') {
      console.log(`开始赛跑助力好友 ${item}`)
      const LKYL_DATA = await combatHelp(item);
      if (LKYL_DATA.errorCode === 'L0001' && !LKYL_DATA.success) {
        console.log('来客有礼宠汪汪token失效');
        $.setdata('', 'jdJoyRunToken');
        $.msg($.name, '【提示】来客有礼token失效，请重新获取', "微信搜索'来客有礼'小程序\n点击底部的'发现'Tab\n即可获取Token")
        $.LKYLLogin = false;
        break
      } else {
        $.LKYLLogin = true;
      }
    }
  }
  // if ($.runReward > 0) {
  //   $.msg($.name, ``, `账号${$.index} [${UserName}]\n给${$.runReward/5}人赛跑助力成功\n获得狗粮${$.runReward}g`)
  // }
}
function combatHelp(friendPin) {
  return new Promise(resolve => {
    headers.Cookie = cookie;
    headers.LKYLToken = $.LKYLToken;
    const options = {
      url: `${JD_BASE_API}/combat/help?friendPin=${encodeURI(friendPin)}`,
      headers
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.log('API请求失败')
          $.logErr(JSON.stringify(err));
        } else {
          $.log(`赛跑助力结果${data}`);
          data = JSON.parse(data);
          // {"errorCode":"help_ok","errorMessage":null,"currentTime":1600479266133,"data":{"rewardNum":5,"helpStatus":"help_ok","newUser":false},"success":true}
          if (data.errorCode === 'help_ok' && data.data.helpStatus === 'help_ok') {
            console.log(`助力${friendPin}成功\n获得狗粮${data.data.rewardNum}g\n`);
            $.runReward += data.data.rewardNum;
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    });
  })
}
function combatDetail(invitePin) {
  return new Promise(resolve => {
    headers.Cookie = cookie;
    headers.LKYLToken = $.LKYLToken;
    const options = {
      url: `${JD_BASE_API}/combat/detail/v2?help=true&inviterPin=${encodeURI(invitePin)}`,
      headers
    }
    $.get(options, (err, resp, data) => {
      try {
        if (err) {
          $.log('API请求失败')
          $.logErr(JSON.stringify(err));
        } else {
          data = JSON.parse(data);
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    });
  })
}
function isURL(domain, reg) {
  // const name = reg;
  return reg.test(domain);
}
function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
function getRandomArrayElements(arr, count) {
  let shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}

isRequest ? getToken() : main();
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============系统通知=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`${this.name}, 错误!`,t.stack):this.log("",`${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`${this.name}, 结束!  ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
