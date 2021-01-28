/*
jd免费水果 搬的https://github.com/liuxiaoyucc/jd-helper/blob/a6f275d9785748014fc6cca821e58427162e9336/fruit/fruit.js
更新时间:2020-08-25
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
// quantumultx
[task_local]
#jd免费水果
5 6-18/6 * * * https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_fruit.js, tag=东东农场, img-url=https://raw.githubusercontent.com/znz1992/Gallery/master/jdsg.png, enabled=true
// Loon
[Script]
cron "5 6-18/6 * * *" script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_fruit.js,tag=东东农场
// Surge
// 宠汪汪偷好友积分与狗粮 = type=cron,cronexp="5 6-18/6 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/kukudemajia/doudou/master/jd_joy_steal.js
互助码shareCode请先手动运行脚本查看打印可看到
一天只能帮助4个人。多出的助力码无效
注：如果使用Node.js, 需自行安装'crypto-js,got,http-server,tough-cookie'模块. 例: npm install crypto-js http-server tough-cookie got --save
*/

let name = '东东农场';
const retainWater = 100;//保留水滴大于多少g,默认100g;
const $ = new Env(name);
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';

//ios等软件用户直接用NobyDa的jd cookie
const cookie = jdCookieNode.CookieJD ? jdCookieNode.CookieJD : $.getdata('CookieJD');

//京东接口地址
const JD_API_HOST = 'https://api.m.jd.com/client.action';

let jdNotify = $.getdata('jdFruitNotify');
//助力好友分享码(最多4个,否则后面的助力失败),原因:京东农场每人每天只有四次助力机会
let shareCodes = [ // 这个列表填入你要助力的好友的shareCode
  '0a74407df5df4fa99672a037eec61f7e',
  'dbb21614667246fabcfd9685b6f448f3',
  '6fbd26cc27ac44d6a7fed34092453f77',
  '61ff5c624949454aa88561f2cd721bf6',
]
// 添加box功能
// 【用box订阅的好处】
// 1脚本也可以远程挂载了。助力功能只需在box里面设置助力码。
// 2所有脚本的cookie都可以备份，方便你迁移到其他支持box的软件。
let isBox = false //默认没有使用box
const boxShareCodeArr = ['jd_fruit1', 'jd_fruit2', 'jd_fruit3', 'jd_fruit4'];
isBox = boxShareCodeArr.some((item) => {
  const boxShareCode = $.getdata(item);
  return (boxShareCode !== undefined && boxShareCode !== null && boxShareCode !== '');
});
if (isBox) {
  shareCodes = [];
  for (const item of boxShareCodeArr) {
    if ($.getdata(item)) {
      shareCodes.push($.getdata(item));
    }
  }
}
const Task = step()
Task.next();

let farmTask = null, isFruitFinished = false;

// let farmInfo = null;

function* step() {
  let message = '';
  let subTitle = '', UserName = '';
  let option = {};
  if (!cookie) {
    $.msg(name, '【提示】请先获取cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    $.done();
    return
  }
  UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
  let farmInfo = yield initForFarm();
  if (farmInfo.farmUserPro) {
    option['media-url'] = farmInfo.farmUserPro.goodsImage;
    subTitle = `【${UserName}】${farmInfo.farmUserPro.name}`;
    console.log(`\n【您的互助码shareCode】 ${farmInfo.farmUserPro.shareCode}\n`);
    console.log(`\n【已成功兑换水果】${farmInfo.farmUserPro.winTimes}次\n`)
    if (farmInfo.treeState === 0) {
      //已下单购买, 但未开始种植新的水果
      $.msg(name, `【提醒】请重新种植水果`, `上轮水果${farmInfo.farmUserPro.name}已兑换成功\n请去京东APP或微信小程序选购并种植新的水果\n openApp.jdMobile://`, {"open-url": "openApp.jdMobile://"});
      $.done();
      return;
    } else if (farmInfo.treeState === 1){
      console.log(`\n${farmInfo.farmUserPro.name}种植中...\n`)
    } else if (farmInfo.treeState === 2) {
      option['open-url'] = "openApp.jdMobile://";
      $.msg(name, `【提醒】${farmInfo.farmUserPro.name}已可领取`, '请去京东APP或微信小程序查看', option);
      $.done();
      return;
    } else if (farmInfo.treeState === 3) {
      //已成熟可去兑换,但还没去下单购买
      option['open-url'] = "openApp.jdMobile://";
      $.msg(name, `【提醒】${farmInfo.farmUserPro.name}已可领取`, '请去京东APP或微信小程序查看', option);
      $.done();
      return;
    }
    farmTask = yield taskInitForFarm();
    // console.log(`当前任务详情: ${JSON.stringify(farmTask)}`);
    console.log(`开始签到`);
    if (!farmTask.signInit.todaySigned) {
      let signResult = yield signForFarm(); //签到
      if (signResult.code == "0") {
        message += `【签到成功】获得${signResult.amount}g\n`//连续签到${signResult.signDay}天
        // if (signResult.todayGotWaterGoalTask.canPop) {
        //   let goalResult = yield gotWaterGoalTaskForFarm();
        //   console.log(`被水滴砸中奖励:${JSON.stringify(goalResult)}`);
        //   if (goalResult.code === '0') {
        //     message += `【被水滴砸中】获取：${goalResult.addEnergy}g\n`
        //   }
        // }
      } else {
        message += `签到失败,详询日志\n`
        console.log(`签到结果:  ${JSON.stringify(signResult)}`);
      }
    } else {
      console.log(`今天已签到,连续签到${farmTask.signInit.totalSigned},下次签到可得${farmTask.signInit.signEnergyEachAmount}g`);
      // message += `今天已签到,连续签到${farmTask.signInit.totalSigned},下次签到可得${farmTask.signInit.signEnergyEachAmount}g\n`
    }
    // 被水滴砸中
    console.log(`被水滴砸中： ${farmInfo.todayGotWaterGoalTask.canPop ? '是' : '否'}`);
    if (farmInfo.todayGotWaterGoalTask.canPop) {
      let goalResult = yield gotWaterGoalTaskForFarm();
      //console.log(`被水滴砸中奖励:${JSON.stringify(goalResult)}`);
      if (goalResult.code === '0') {
        message += `【被水滴砸中】获得${goalResult.addEnergy}g\n`
      }
    }
    console.log(`签到结束,开始广告浏览任务`);
    if (!farmTask.gotBrowseTaskAdInit.f) {
      let adverts = farmTask.gotBrowseTaskAdInit.userBrowseTaskAds
      let browseReward = 0
      let browseSuccess = 0
      let browseFail = 0
      for (let advert of adverts) { //开始浏览广告
        if (advert.limit <= advert.hadFinishedTimes) {
          // browseReward+=advert.reward
          console.log(`${advert.mainTitle}+ ' 已完成`);//,获得${advert.reward}g
          continue;
        }
        console.log('正在进行广告浏览任务: ' + advert.mainTitle);
        let browseResult = yield browseAdTaskForFarm(advert.advertId, 0);
        if (browseResult.code == 0) {
          console.log(`${advert.mainTitle}浏览任务完成`);
          //领取奖励
          let browseRwardResult = yield browseAdTaskForFarm(advert.advertId, 1);
          if (browseRwardResult.code == '0') {
            console.log(`领取浏览${advert.mainTitle}广告奖励成功,获得${browseRwardResult.amount}g`)
            browseReward += browseRwardResult.amount
            browseSuccess++
          } else {
            browseFail++
            console.log(`领取浏览广告奖励结果:  ${JSON.stringify(browseRwardResult)}`)
          }
        } else {
          browseFail++
          console.log(`广告浏览任务结果:   ${JSON.stringify(browseResult)}`);
        }
      }
      if (browseFail > 0) {
        message += `【广告浏览】完成${browseSuccess}个,失败${browseFail},获得${browseReward}g\n`
      } else {
        message += `【广告浏览】完成${browseSuccess}个,获得${browseReward}g\n`
      }
    } else {
      console.log(`今天已经做过浏览任务`);
      // message += '今天已经做过浏览任务\n'
    }
    //定时领水
    if (!farmTask.gotThreeMealInit.f) {
      //
      let threeMeal = yield gotThreeMealForFarm();
      if (threeMeal.code == "0") {
        message += `【定时领水】获得${threeMeal.amount}g\n`
      } else {
        message += `【定时领水】失败,详询日志\n`
        console.log(`定时领水成功结果:  ${JSON.stringify(threeMeal)}`);
      }
    } else {
      // message += '当前不在定时领水时间断或者已经领过\n'
      console.log('当前不在定时领水时间断或者已经领过')
    }
    //打卡领水
    console.log('开始打卡领水活动（签到，关注，领券）')
    let clockInInit = yield clockInInitForFarm();
    // console.log(`clockInInit---${JSON.stringify(clockInInit)}`)
    if (clockInInit.code === '0') {
      // 签到得水滴
      if (!clockInInit.todaySigned) {
        console.log('开始今日签到');
        // request('clockInForFarm', {"type" : 1});
        let clockInForFarmRes = yield clockInForFarm();
        console.log(`打卡结果${JSON.stringify(clockInForFarmRes)}`);
        if (clockInForFarmRes.code === '0') {
          message += `【第${clockInForFarmRes.signDay}天签到】获得${clockInForFarmRes.amount}g\n`//连续签到${signResult.signDay}天
          if (clockInForFarmRes.signDay === 7) {
            //可以领取惊喜礼包
            console.log('开始领取--惊喜礼包38g水滴');
            let gotClockInGiftRes = yield gotClockInGift();
            if (gotClockInGiftRes.code === '0') {
              message += `【惊喜礼包】获得${gotClockInGiftRes.amount}g\n`
            }
          }
          // if (clockInForFarmRes.todayGotWaterGoalTask.canPop) {
          //   let goalResult = yield gotWaterGoalTaskForFarm();
          //   console.log(`被水滴砸中奖励:${JSON.stringify(goalResult)}`);
          //   if (goalResult.code === '0') {
          //     message += `【被水滴砸中】${goalResult.addEnergy}g\n`;
          //   }
          // }
        }
      }
      // 连续七天签到-惊喜礼包
      // if (!clockInInit.gotClockInGift && clockInInit.totalSigned === 7) {
      //   console.log('开始领取--惊喜礼包38g水滴');
      //   let gotClockInGiftRes = yield gotClockInGift();
      //   if (gotClockInGiftRes.code === '0') {
      //     message += `【惊喜礼包】获得${gotClockInGiftRes.amount}g\n`
      //   }
      // }
      // 限时关注得水滴
      if (clockInInit.themes && clockInInit.themes.length > 0) {
        for (let item of clockInInit.themes) {
          if (!item.hadGot) {
            console.log(`关注ID${item.id}`);
            let themeStep1 = yield clockInFollowForFarm(item.id, "theme", "1");
            console.log(`themeStep1--结果${JSON.stringify(themeStep1)}`);
            if (themeStep1.code === '0') {
              let themeStep2 = yield clockInFollowForFarm(item.id, "theme", "2");
              console.log(`themeStep2--结果${JSON.stringify(themeStep2)}`);
              if (themeStep2.code === '0') {
                console.log(`关注${item.name}，获得水滴${themeStep2.amount}g`);
              }
            }
          }
        }
      }
      // 限时领券得水滴
      if (clockInInit.venderCoupons && clockInInit.venderCoupons.length > 0) {
        for (let item of clockInInit.venderCoupons) {
          if (!item.hadGot) {
            console.log(`领券的ID${item.id}`);
            let venderCouponStep1 = yield clockInFollowForFarm(item.id, "venderCoupon", "1");
            console.log(`venderCouponStep1--结果${JSON.stringify(venderCouponStep1)}`);
            if (venderCouponStep1.code === '0') {
              let venderCouponStep2 = yield clockInFollowForFarm(item.id, "venderCoupon", "2");
              if (venderCouponStep2.code === '0') {
                console.log(`venderCouponStep2--结果${JSON.stringify(venderCouponStep2)}`);
                console.log(`从${item.name}领券，获得水滴${venderCouponStep2.amount}g`);
              }
            }
          }
        }
      }
    }
    console.log('\n开始打卡领水活动（签到，关注，领券）结束\n');
    // 水滴雨
    let executeWaterRain = !farmTask.waterRainInit.f;
    if (executeWaterRain) {
      console.log(`水滴雨任务，每天两次，最多可得10g水滴`);
      console.log(`两次水滴雨任务是否全部完成：${farmTask.waterRainInit.f ? '是' : '否'}`);
      if (farmTask.waterRainInit.lastTime) {
        if (new Date().getTime() < (farmTask.waterRainInit.lastTime + 3 * 60 * 60 * 1000)) {
          executeWaterRain = false;
          message += `【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请稍后再试\n`;
        }
      }
      if (executeWaterRain) {
        console.log(`开始水滴雨任务,这是第${farmTask.waterRainInit.winTimes + 1}次，剩余${2 - (farmTask.waterRainInit.winTimes + 1)}次`);
        let waterRain = yield waterRainForFarm();
        console.log('水滴雨waterRain', waterRain);
        if (waterRain.code === '0') {
          console.log('水滴雨任务执行成功，获得水滴：' + waterRain.addEnergy + 'g');
          message += `【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${waterRain.addEnergy}g水滴\n`
        }
      }
      // if (farmTask.waterRainInit.winTimes === 0) {
      //   console.log(`开始水滴雨任务,这是第${farmTask.waterRainInit.winTimes + 1}次，剩余${2 - (farmTask.waterRainInit.winTimes + 1)}次`);
      //   let waterRain = yield waterRainForFarm();
      //   console.log('水滴雨waterRain', waterRain);
      //   if (waterRain.code === '0') {
      //     console.log('水滴雨任务执行成功，获得水滴：' + waterRain.addEnergy + 'g');
      //     message += `【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${waterRain.addEnergy}g水滴\n`
      //   }
      // } else {
      //   //执行了第一次水滴雨。需等待3小时候才能再次执行
      //   if (new Date().getTime()  > (farmTask.waterRainInit.lastTime + 3 * 60 * 60 *1000)) {
      //     console.log(`开始水滴雨任务,这是第${farmTask.waterRainInit.winTimes + 1}次，剩余${2 - (farmTask.waterRainInit.winTimes + 1)}次`);
      //     let waterRain = yield waterRainForFarm();
      //     console.log('水滴雨waterRain', waterRain);
      //     if (waterRain.code === '0') {
      //       console.log('水滴雨任务执行成功，获得水滴：' + waterRain.addEnergy + 'g');
      //       message += `【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】获得${waterRain.addEnergy}g水滴\n`
      //     }
      //   } else {
      //     console.log(`【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请稍后再试\n`)
      //     message += `【第${farmTask.waterRainInit.winTimes + 1}次水滴雨】未到时间，请稍后再试\n`
      //   }
      // }
    } else {
      message += `【水滴雨】已全部完成，获得20g\n`
    }
    const masterHelpResult = yield masterHelpTaskInitForFarm();
    if (masterHelpResult.code === '0') {
      if (masterHelpResult.masterHelpPeoples && masterHelpResult.masterHelpPeoples.length >= 5) {
        // 已有五人助力。领取助力后的奖励
        if (!masterHelpResult.masterGotFinal) {
          const masterGotFinished = yield masterGotFinishedTaskForFarm();
          if (masterGotFinished.code === '0') {
            console.log(`已成功领取好友助力奖励：【${masterGotFinished.amount}】g水`);
            message += `【额外奖励】${masterGotFinished.amount}g水领取成功\n`;
          }
        } else {
          console.log("已经领取过5好友助力额外奖励");
          message += `【额外奖励】已被领取过\n`;
        }
      } else {
        console.log("助力好友未达到5个");
        message += `【额外奖励】领取失败,原因：助力好友未达5个\n`;
      }
      if (masterHelpResult.masterHelpPeoples && masterHelpResult.masterHelpPeoples.length > 0) {
        let str = '';
        masterHelpResult.masterHelpPeoples.map((item, index) => {
          if (index === (masterHelpResult.masterHelpPeoples.length - 1)) {
            str += item.nickName || "匿名用户";
          } else {
            str += (item.nickName || "匿名用户") + ',';
          }
          let date = new Date(item.time);
          let time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getMinutes();
          console.log(`\n京东昵称【${item.nickName || "匿名用户"}】 在 ${time} 给您助过力\n`);
        })
        message += `【助力您的好友】${str}\n`;
      }
    }
    //助力
    // masterHelpTaskInitForFarm
    console.log('开始助力好友')
    let salveHelpAddWater = 0;
    let remainTimes = 4;//今日剩余助力次数,默认4次（京东农场每人每天4次助力机会）。
    let helpSuccessPeoples = '';//成功助力好友
    for (let code of shareCodes) {
      if (code == farmInfo.farmUserPro.shareCode) {
        console.log('跳过自己的shareCode')
        continue
      }
      console.log(`开始助力好友: ${code}`);
      let helpResult = yield masterHelp(code)
      if (helpResult.code == 0) {
        if (helpResult.helpResult.code === '0') {
          //助力成功
          salveHelpAddWater += helpResult.helpResult.salveHelpAddWater;
          console.log(`【助力好友结果】: 已成功给【${helpResult.helpResult.masterUserInfo.nickName}】助力`);
          console.log(`给好友【${helpResult.helpResult.masterUserInfo.nickName}】助力获得${helpResult.helpResult.salveHelpAddWater}g水滴`)
          helpSuccessPeoples += (helpResult.helpResult.masterUserInfo.nickName || '匿名用户') + ',';
        } else if (helpResult.helpResult.code === '8') {
          console.log(`【助力好友结果】: 助力【${helpResult.helpResult.masterUserInfo.nickName}】失败，您今天助力次数已耗尽`);
        } else if (helpResult.helpResult.code === '9') {
          console.log(`【助力好友结果】: 之前给【${helpResult.helpResult.masterUserInfo.nickName}】助力过了`);
        } else if (helpResult.helpResult.code === '10') {
          console.log(`【助力好友结果】: 好友【${helpResult.helpResult.masterUserInfo.nickName}】已满五人助力`);
        }
        console.log(`【今日助力次数还剩】${helpResult.helpResult.remainTimes}次`);
        remainTimes = helpResult.helpResult.remainTimes;
        if (helpResult.helpResult.remainTimes === 0) {
          console.log(`您当前助力次数已耗尽，跳出助力`);
          break
        }
      }
    }
    let helpSuccessPeoplesKey = timeFormat() + farmInfo.farmUserPro.shareCode;
    if (!$.getdata(helpSuccessPeoplesKey)) {
      //把前一天的清除
      $.setdata('', timeFormat(Date.now() - 24 * 60 * 60 * 1000) + farmInfo.farmUserPro.shareCode);
      $.setdata('', helpSuccessPeoplesKey);
    }
    if (helpSuccessPeoples) {
      if ($.getdata(helpSuccessPeoplesKey)) {
        $.setdata($.getdata(helpSuccessPeoplesKey) + ',' + helpSuccessPeoples, helpSuccessPeoplesKey);
      } else {
        $.setdata(helpSuccessPeoples, helpSuccessPeoplesKey);
      }
    }
    helpSuccessPeoples = $.getdata(helpSuccessPeoplesKey);
    if (helpSuccessPeoples && helpSuccessPeoples.length > 0) {
      message += `【您助力的好友】${helpSuccessPeoples.substr(0, helpSuccessPeoples.length - 1)}\n`;
    }
    if (salveHelpAddWater > 0) {
      message += `【助力好友】获得${salveHelpAddWater}g\n`
    }
    message += `【今日剩余助力】${remainTimes}次\n`;
    console.log('助力好友结束，即将开始每日浇水任务');
    // console.log('当前水滴剩余: ' + farmInfo.farmUserPro.totalEnergy);
    // farmTask = yield taskInitForFarm();
    //天天抽奖得好礼
    let initForTurntableFarmRes = yield initForTurntableFarm();
    if (initForTurntableFarmRes.code === '0') {
      //领取定时奖励 //4小时一次
      let {timingIntervalHours, timingLastSysTime, sysTime, timingGotStatus, remainLotteryTimes, turntableInfos} = initForTurntableFarmRes;

      if (!timingGotStatus) {
        console.log(`是否到了领取免费赠送的抽奖机会----${sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)}`)
        if (sysTime > (timingLastSysTime + 60*60*timingIntervalHours*1000)) {
          let timingAwardRes = yield timingAwardForTurntableFarm();
          console.log(`领取定时奖励结果${JSON.stringify(timingAwardRes)}`);
          initForTurntableFarmRes = yield initForTurntableFarm();
          remainLotteryTimes = initForTurntableFarmRes.remainLotteryTimes;
        } else {
          console.log(`免费赠送的抽奖机会未到时间`)
        }
      } else {
        console.log('4小时候免费赠送的抽奖机会已领取')
      }
      if (initForTurntableFarmRes.turntableBrowserAds && initForTurntableFarmRes.turntableBrowserAds.length > 0) {
        console.log('开始浏览天天抽奖的逛会场任务')
        if (!initForTurntableFarmRes.turntableBrowserAds[0].status) {
          const browserForTurntableFarmRes = yield browserForTurntableFarm(initForTurntableFarmRes.turntableBrowserAds[0].adId);
          if (browserForTurntableFarmRes.code === '0' && browserForTurntableFarmRes.status) {
            const browserForTurntableFarm2Res = yield browserForTurntableFarm2(initForTurntableFarmRes.turntableBrowserAds[0].adId);
            if (browserForTurntableFarm2Res.code === '0') {
              initForTurntableFarmRes = yield initForTurntableFarm();
              remainLotteryTimes = initForTurntableFarmRes.remainLotteryTimes;
            }
          }
        } else {
          console.log('天天抽奖浏览任务已经做完')
        }
      }
      //天天抽奖助力
      console.log('开始天天抽奖--好友助力--每人每天只有三次助力机会.')
      for (let code of shareCodes) {
        if (code === farmInfo.farmUserPro.shareCode) {
          console.log('天天抽奖-不能自己给自己助力\n')
          continue
        }
        let lotteryMasterHelpRes = yield lotteryMasterHelp(code);
        // console.log('天天抽奖助力结果',lotteryMasterHelpRes.helpResult)
        if (lotteryMasterHelpRes.helpResult.code === '0') {
          console.log(`天天抽奖-助力${lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}成功\n`)
        } else if (lotteryMasterHelpRes.helpResult.code === '11') {
          console.log(`天天抽奖-不要重复助力${lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}\n`)
        } else if (lotteryMasterHelpRes.helpResult.code === '13') {
          console.log(`天天抽奖-助力${lotteryMasterHelpRes.helpResult.masterUserInfo.nickName}失败,助力次数耗尽\n`);
          break;
        }
        //lotteryMasterHelp
      }
      console.log(`---天天抽奖次数remainLotteryTimes----${remainLotteryTimes}次`)
      //抽奖
      if (remainLotteryTimes > 0) {
        console.log('开始抽奖')
        let lotteryResult = '';
        for (let i = 0; i < new Array(remainLotteryTimes).fill('').length; i++) {
          let lotteryRes = yield lotteryForTurntableFarm()
          console.log(`第${i + 1}次抽奖结果${JSON.stringify(lotteryRes)}`);
          if (lotteryRes.code === '0') {
            turntableInfos.map((item) => {
              if (item.type === lotteryRes.type) {
                console.log(`lotteryRes.type${lotteryRes.type}`);
                if (lotteryRes.type.match(/bean/g) && lotteryRes.type.match(/bean/g)[0] === 'bean') {
                  lotteryResult += `${item.name}个，`;
                } else if (lotteryRes.type.match(/water/g) && lotteryRes.type.match(/water/g)[0] === 'water') {
                  lotteryResult += `${item.name}g，`;
                } else {
                  lotteryResult += `${item.name}，`;
                }
              }
            })
            //没有次数了
            if (lotteryRes.remainLotteryTimes === 0) {
              break
            }
          }
        }
        if (lotteryResult) {
          console.log(`【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`)
          message += `【天天抽奖】${lotteryResult.substr(0, lotteryResult.length - 1)}\n`;
        }
      }  else {
        console.log('天天抽奖--抽奖机会为0次')
      }
    } else {
      console.log('初始化天天抽奖得好礼失败')
    }
    //浇水10次
    if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
      let waterCount = 0;
      isFruitFinished = false;
      for (; waterCount < farmTask.totalWaterTaskInit.totalWaterTaskLimit - farmTask.totalWaterTaskInit.totalWaterTaskTimes; waterCount++) {
        console.log(`第${waterCount + 1}次浇水`);
        let waterResult = yield waterGoodForFarm();
        console.log(`本次浇水结果:   ${JSON.stringify(waterResult)}`);
        if (waterResult.code === '0') {
          console.log(`剩余水滴${waterResult.totalEnergy}g`);
          if (waterResult.finished) {
            // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
            isFruitFinished = true;
            break
          } else {
            if (waterResult.waterStatus === 0 && waterResult.treeEnergy === 10) {
              console.log('果树发芽了,奖励30g水滴');
              let gotStageAwardForFarmRes1 = yield gotStageAwardForFarm('1');
              console.log(`浇水阶段奖励1领取结果 ${JSON.stringify(gotStageAwardForFarmRes1)}`);
              if (gotStageAwardForFarmRes1.code === '0') {
                message += `【果树发芽了】奖励${gotStageAwardForFarmRes1.addEnergy}`
              }
            } else if (waterResult.waterStatus === 1) {
              console.log('果树开花了,奖励40g水滴');
              let gotStageAwardForFarmRes2 = yield gotStageAwardForFarm('2');
              console.log(`浇水阶段奖励2领取结果 ${JSON.stringify(gotStageAwardForFarmRes2)}`);
              if (gotStageAwardForFarmRes2.code === '0') {
                message += `【果树开花了】奖励${gotStageAwardForFarmRes2.addEnergy}g\n`
              }
            } else if (waterResult.waterStatus === 2) {
              console.log('果树长出小果子啦, 奖励50g水滴');
              let gotStageAwardForFarmRes3 = yield gotStageAwardForFarm('3');
              console.log(`浇水阶段奖励3领取结果 ${JSON.stringify(gotStageAwardForFarmRes3)}`)
              if (gotStageAwardForFarmRes3.code === '0') {
                message += `【果树结果了】奖励${gotStageAwardForFarmRes3.addEnergy}g\n`
              }
            }
            if (waterResult.totalEnergy < 10) {
              console.log(`水滴不够，结束浇水`)
              break
            }
          }
        } else {
          console.log('浇水出现失败异常,跳出不在继续浇水')
          break;
        }
      }
      if (isFruitFinished) {
        option['open-url'] = "openApp.jdMobile://";
        $.msg(name, `【提醒】${farmInfo.farmUserPro.name}已可领取`, '请去京东APP或微信小程序查看', option);
        $.done();
        return;
      }
      farmTask = yield taskInitForFarm();
      // message += `【自动浇水】浇水${waterCount}次，今日浇水${farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`
    } else {
      console.log('今日已完成10次浇水任务');
    }
    //领取首次浇水奖励
    if (!farmTask.firstWaterInit.f && farmTask.firstWaterInit.totalWaterTimes > 0) {
      let firstWaterReward = yield firstWaterTaskForFarm();
      if (firstWaterReward.code === '0') {
        message += `【首次浇水奖励】获得${firstWaterReward.amount}g\n`
      } else {
        message += '【首次浇水奖励】领取奖励失败,详询日志\n'
        console.log(`领取首次浇水奖励结果:  ${JSON.stringify(firstWaterReward)}`);
      }
    }
    //领取10次浇水奖励
    if (!farmTask.totalWaterTaskInit.f && farmTask.totalWaterTaskInit.totalWaterTaskTimes >= farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
      let totalWaterReward = yield totalWaterTaskForFarm();
      if (totalWaterReward.code === '0') {
        // console.log(`领取10次浇水奖励结果:  ${JSON.stringify(totalWaterReward)}`);
        message += `【十次浇水奖励】获得${totalWaterReward.totalWaterTaskEnergy}g\n`//，
      } else {
        message += '【十次浇水奖励】领取奖励失败,详询日志\n'
        console.log(`领取10次浇水奖励结果:  ${JSON.stringify(totalWaterReward)}`);
      }
    } else if (farmTask.totalWaterTaskInit.totalWaterTaskTimes < farmTask.totalWaterTaskInit.totalWaterTaskLimit) {
      message += `【十次浇水奖励】任务未完成，今日浇水${farmTask.totalWaterTaskInit.totalWaterTaskTimes}次\n`
    }
    console.log('finished 水果任务完成!');

    farmInfo = yield initForFarm();
    // 所有的浇水(10次浇水)任务，获取水滴任务完成后，如果剩余水滴大于等于60g,则继续浇水(保留部分水滴是用于完成第二天的浇水10次的任务)
    let overageEnergy = farmInfo.farmUserPro.totalEnergy - retainWater;
    if (farmInfo.farmUserPro.totalEnergy >= (farmInfo.farmUserPro.treeTotalEnergy - farmInfo.farmUserPro.treeEnergy)) {
      //如果现有的水滴，大于水果可兑换所需的对滴(也就是把水滴浇完，水果就能兑换了)
      isFruitFinished = false;
      for (let i = 0; i < (farmInfo.farmUserPro.treeTotalEnergy - farmInfo.farmUserPro.treeEnergy) / 10; i++) {
        let resp = yield waterGoodForFarm();
        console.log(`本次浇水结果(水果马上就可兑换了):   ${JSON.stringify(resp)}`);
        if (resp.code === '0') {
          console.log('\n浇水10g成功\n');
          if (resp.finished) {
            // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
            isFruitFinished = true;
            break
          } else {
            console.log(`目前水滴【${resp.totalEnergy}】g,继续浇水，水果马上就可以兑换了`)
          }
        } else {
          console.log('浇水出现失败异常,跳出不在继续浇水')
          break;
        }
      }
      if (isFruitFinished) {
        option['open-url'] = "openApp.jdMobile://";
        $.msg(name, `【提醒】${farmInfo.farmUserPro.name}已可领取`, '请去京东APP或微信小程序查看', option);
        $.done();
        return;
      }
    } else if (overageEnergy >= 10) {
      console.log("目前剩余水滴：【" + farmInfo.farmUserPro.totalEnergy + "】g，可继续浇水");
      isFruitFinished = false;
      for (let i = 0; i < parseInt(overageEnergy / 10); i++) {
        let res = yield waterGoodForFarm();
        if (res.code === '0') {
          console.log('\n浇水10g成功\n')
          if (res.finished) {
            // 已证实，waterResult.finished为true，表示水果可以去领取兑换了
            isFruitFinished = true;
            break
          } else {
            if (res.waterStatus === 0 && res.treeEnergy === 10) {
              console.log('果树发芽了,奖励30g水滴');
              let gotStageAwardForFarmRes1 = yield gotStageAwardForFarm('1');
              console.log(`浇水阶段奖励1领取结果 ${JSON.stringify(gotStageAwardForFarmRes1)}`);
              if (gotStageAwardForFarmRes1.code === '0') {
                message += `【果树发芽了】奖励${gotStageAwardForFarmRes1.addEnergy}g\n`
              }
            } else if (res.waterStatus === 1) {
              console.log('果树开花了,奖励40g水滴');
              let gotStageAwardForFarmRes2 = yield gotStageAwardForFarm('2');
              console.log(`浇水阶段奖励2领取结果 ${JSON.stringify(gotStageAwardForFarmRes2)}`);
              if (gotStageAwardForFarmRes2.code === '0') {
                message += `【果树开花了】奖励${gotStageAwardForFarmRes2.addEnergy}g\n`
              }
            } else if (res.waterStatus === 2) {
              console.log('果树长出小果子啦, 奖励50g水滴');
              let gotStageAwardForFarmRes3 = yield gotStageAwardForFarm('3');
              console.log(`浇水阶段奖励3领取结果 ${JSON.stringify(gotStageAwardForFarmRes3)}`)
              if (gotStageAwardForFarmRes3.code === '0') {
                message += `【果树结果了】奖励${gotStageAwardForFarmRes3.addEnergy}g\n`
              }
            }
          }
        } else {
          console.log('浇水出现失败异常,跳出不在继续浇水')
          break;
        }
      }
      if (isFruitFinished) {
        option['open-url'] = "openApp.jdMobile://";
        $.msg(name, `【提醒】${farmInfo.farmUserPro.name}已可领取`, '请去京东APP或微信小程序查看', option);
        $.done();
        return;
      }
    } else {
      console.log("目前剩余水滴：【" + farmInfo.farmUserPro.totalEnergy + "】g,不再继续浇水,保留部分水滴用于完成第二天【十次浇水得水滴】任务")
    }

    farmInfo = yield initForFarm();
    message += `【水果进度】${((farmInfo.farmUserPro.treeEnergy / farmInfo.farmUserPro.treeTotalEnergy) * 100).toFixed(2)}%，已浇水${farmInfo.farmUserPro.treeEnergy / 10}次,还需${(farmInfo.farmUserPro.treeTotalEnergy - farmInfo.farmUserPro.treeEnergy) / 10}次\n`
    if (farmInfo.toFlowTimes > (farmInfo.farmUserPro.treeEnergy / 10)) {
      message += `【开花进度】再浇水${farmInfo.toFlowTimes - farmInfo.farmUserPro.treeEnergy / 10}次开花\n`
    } else if (farmInfo.toFruitTimes > (farmInfo.farmUserPro.treeEnergy / 10)) {
      message += `【结果进度】再浇水${farmInfo.toFruitTimes - farmInfo.farmUserPro.treeEnergy / 10}次结果\n`
    }
    // 预测n天后水果课可兑换功能
    let waterTotalT = (farmInfo.farmUserPro.treeTotalEnergy - farmInfo.farmUserPro.treeEnergy - farmInfo.farmUserPro.totalEnergy) / 10;//一共还需浇多少次水
    farmTask = yield taskInitForFarm();
    let waterEveryDayT = farmTask.totalWaterTaskInit.totalWaterTaskTimes;//今天到到目前为止，浇了多少次水
    message += `【今日共浇水】${waterEveryDayT}次\n`;
    let waterD = Math.ceil(waterTotalT / waterEveryDayT);
    // name += `——预测在${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日可兑换`;
    // if (waterEveryDayT !== 0) {
    //   subTitle += `，预计需${waterD}天可兑换`
    // } else {
    //   subTitle += `，预计需${Math.ceil(waterTotalT / 10)}天可兑换`
    // }
    message += `【剩余水滴】${farmInfo.farmUserPro.totalEnergy}g\n`;
    message += `【预测】${waterD === 1 ? '明天' : waterD === 2 ? '后天' : waterD + '天之后'}(${timeFormat(24 * 60 * 60 * 1000 * waterD + Date.now())}日)可兑换水果`
//        //集卡抽奖活动
//        console.log('开始集卡活动')
//
//        //初始化集卡抽奖活动数据
//        let turntableFarm = yield initForTurntableFarm()
//        if (turntableFarm.code == 0) {
//            //浏览爆品任务
//            if (!turntableFarm.turntableBrowserAdsStatus) {
//                let browserResult1 = yield browserForTurntableFarm(1);
//                console.log(`浏览爆品任务结果${JSON.stringify(browserResult1)}`)
//                if (browserResult1.code == 0) {
//                    let browserResult2 = yield browserForTurntableFarm(2);
//                    console.log(`领取爆品任务奖励结果${JSON.stringify(browserResult2)}`)
//                }
//            }
//            //领取定时奖励 //4小时一次 没判断时间
//            if (!turntableFarm.timingGotStatus) {
//                let timingAward = yield timingAwardForTurntableFarm();
//                console.log(`领取定时奖励结果${JSON.stringify(timingAward)}`)
//            }
//            turntableFarm = yield initForTurntableFarm()
//            console.log('开始抽奖')
//            //抽奖
//            if (turntableFarm.remainLotteryTimes > 0) {
//                let lotteryResult = "【集卡抽奖】获得"
//                for (let i = 0; i < turntableFarm.remainLotteryTimes; i++) {
//                    let lottery = yield lotteryForTurntableFarm()
//                    console.log(`第${i + 1}次抽奖结果${JSON.stringify(lottery)}`)
//
//                    if (lottery.code == 0) {
//                        if (lottery.type == "water") {
//                            lotteryResult += `水滴${lottery.addWater}g `
//                        } else if (lottery.type == "pingguo") {
//                            lotteryResult += "苹果卡 "
//                        } else if (lottery.type == "baixiangguo") {
//                            lotteryResult += "百香果卡 "
//                        } else if (lottery.type == "mangguo") {
//                            lotteryResult += "芒果卡 "
//                        } else if (lottery.type == "taozi") {
//                            lotteryResult += "桃子卡 "
//                        } else if (lottery.type == "mihoutao") {
//                            lotteryResult += "猕猴桃卡 "
//                        } else if (lottery.type == "pingguo") {
//                            lotteryResult += "苹果卡 "
//                        } else if (lottery.type == "coupon") {
//                            lotteryResult += "优惠券 "
//                        } else if (lottery.type == "coupon3") {
//                            lotteryResult += "8斤金枕榴莲 "
//                        } else if (lottery.type == "bean") {
//                            lotteryResult += `京豆${lottery.beanCount}个 `
//                        } else if (lottery.type == "hongbao1") {
//                            lotteryResult += `${lottery.hongBao.balance}元无门槛红包 `
//                        } else {
//                            lotteryResult += `未知奖品${lottery.type} `
//                        }
//                        //没有次数了
//                        if (lottery.remainLotteryTimes == 0) {
//                            break
//                        }
//                    }
//
//                }
//                message += lotteryResult
//            }
//            console.log('抽奖结束')
//
//        } else {
//            console.log(`初始化集卡抽奖活动数据异常, 数据: ${JSON.stringify(farmInfo)}`);
//            message += '【集卡抽奖】初始化集卡抽奖数据异常'
//        }
//        console.log('集卡活动抽奖结束')

    console.log('全部任务结束');
  } else {
    if (farmInfo.code === '3') {
      $.msg(name, '【提示】京东cookie已失效,请重新登录获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
      $.setdata('', 'CookieJD');//cookie失效，故清空cookie。
      $.done();
      return
    } else {
      console.log(`初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常,农场初始化数据: ${JSON.stringify(farmInfo)}`);
      message = '初始化农场数据异常, 请登录京东 app查看农场0元水果功能是否正常'
    }
  }
  if (!jdNotify || jdNotify === 'false') {
    $.msg(name, subTitle, message, option);
  }
  $.done();
}

/**
 * 天天抽奖拿好礼-助力(每人每天三次助力机会)
 */
function lotteryMasterHelp() {
  request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0] + '-3',
    babelChannel: "3",
    version: 4,
    channel: 1
  });
}
/**
 * 集卡抽奖
 */
async function lotteryForTurntableFarm() {
  await $.wait(2000);
  console.log('等待了5秒')
  request(arguments.callee.name.toString(), {type: 1, version: 4, channel: 1});
}

function timingAwardForTurntableFarm() {
  request(arguments.callee.name.toString(), {version: 4, channel: 1});
}

// 初始化集卡抽奖活动数据
function initForTurntableFarm() {
  request(arguments.callee.name.toString(), {version: 4, channel: 1});
}

function browserForTurntableFarm(type) {
  if (type === 1) {
    console.log('浏览爆品会场');
  }
  if (type === 2) {
    console.log('领取浏览爆品会场奖励');
  }
  const body = {"type":1,"adId": type,"version":4,"channel":1};
  console.log('type', type  + "");
  console.log(body)
  // request(arguments.callee.name.toString(), {type: type});
  request(arguments.callee.name.toString(), body);
  // 浏览爆品会场8秒
}
function browserForTurntableFarm2(type) {
  const body = {"type":2,"adId": type,"version":4,"channel":1};
  request('browserForTurntableFarm', body);
}
/**
 * 领取浇水过程中的阶段性奖励
 */
function gotStageAwardForFarm(type) {
  request(arguments.callee.name.toString(), {'type': type});
}

/**
 * 被水滴砸中
 * 要弹出来窗口后调用才有效, 暂时不知道如何控制
 */
function gotWaterGoalTaskForFarm() {
  request(arguments.callee.name.toString(), {type: 3});
}

//助力好友信息
function masterHelpTaskInitForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

//领取5人助力后的额外奖励
function masterGotFinishedTaskForFarm() {
  console.log("领取助力完成后的水滴")
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

function masterHelp() {
  request(`initForFarm`, {
    imageUrl: "",
    nickName: "",
    shareCode: arguments[0],
    babelChannel: "3",
    version: 2,
    channel: 1
  });
}

/**
 * 10次浇水
 */
function totalWaterTaskForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

function firstWaterTaskForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

// 浇水动作
function waterGoodForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

/**
 * 浏览广告任务
 * type为0时, 完成浏览任务
 * type为1时, 领取浏览任务奖励
 */
function browseAdTaskForFarm(advertId, type) {
  let functionId = arguments.callee.name.toString();
  request(functionId, {advertId, type});
}

//签到
function signForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

//定时领水
function gotThreeMealForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

// 初始化任务列表
function taskInitForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

/**
 * 初始化农场, 可获取果树及用户信息
 */
function initForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

/**
 * 水滴雨
 * @param function_id
 * @param body
 */
function waterRainForFarm() {
  let functionId = arguments.callee.name.toString();
  let body = {"type": 1, "hongBaoTimes": 100, "version": 3};
  request(functionId, body);
}

/**
 * 打卡领水
 */
function clockInInitForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId);
}

// 连续签到
function clockInForFarm() {
  let functionId = arguments.callee.name.toString();
  request(functionId, {"type": 1});
}

//关注，领券等
function clockInFollowForFarm(id, type, step) {
  let functionId = arguments.callee.name.toString();
  let body = {
    id,
    type,
    step
  }
  request(functionId, body);
}

// 领取连续签到7天的惊喜礼包
function gotClockInGift() {
  request('clockInForFarm', {"type": 2})
}
//获取好友列表
function friendListInitForFarm() {
  request('friendListInitForFarm')
}
function request(function_id, body = {}) {
  $.get(taskurl(function_id, body), (err, resp, data) => {
    try {
      if (err) {
        console.log('\n东东农场: API查询请求失败 !!!!')
      } else {
        data = JSON.parse(data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      sleep(data);
    }
  })
}

function sleep(response) {
  console.log('休息一下');
  setTimeout(() => {
    console.log('休息结束');
    Task.next(response)
  }, 1000);
}

function taskurl(function_id, body = {}) {
  return {
    url: `${JD_API_HOST}?functionId=${function_id}&appid=wh5&body=${escape(JSON.stringify(body))}`,
    headers: {
      Cookie: cookie,
      UserAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1`,
    }
  }
}

function taskPostUrl(function_id, body = {}) {
  return {
    url: JD_API_HOST,
    body: `functionId=${function_id}&body=${JSON.stringify(body)}&appid=wh5`,
    headers: {
      Cookie: cookie,
    }
  }
}

function timeFormat(time) {
  let date;
  if (time) {
    date = new Date(time)
  } else {
    date = new Date();
  }
  return date.getFullYear() + '-' + ((date.getMonth() + 1) >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() >= 10 ? date.getDate() : '0' + date.getDate());
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}