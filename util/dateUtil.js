/**
 * Created by heddy on 7/24/14.
 */
var stringUtil=require("./stringUtil");

Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

//获取当前时间的最简字符串
exports.getNowSimpleStr=function(){
    var date=new Date();
    var month=stringUtil.autoComple((date.getMonth()+1),2,'0');
    var year=date.getFullYear().toString();
    var date2=stringUtil.autoComple(date.getDate(),2,'0');
    var hour=stringUtil.autoComple(date.getHours(),2,'0');
    var minute=stringUtil.autoComple(date.getMinutes(),2,'0');
    var second=stringUtil.autoComple(date.getSeconds(),2,'0');
    var today=year+month+date2+hour+minute+second;
    return today;
}

//获取当前的最简日期字符串
exports.getNowDateStr=function(){
    var date=new Date();
    var month=stringUtil.autoComple((date.getMonth()+1),2,'0');
    var year=date.getFullYear().toString();
    var date2=stringUtil.autoComple(date.getDate(),2,'0');
    var today=year+"-"+month+"-"+date2;
    return today;
}

//获取当前的最简日期字符串
exports.getNowSimpleDateStr=function(){
    var date=new Date();
    var month=stringUtil.autoComple((date.getMonth()+1),2,'0');
    var year=date.getFullYear().toString();
    var date2=stringUtil.autoComple(date.getDate(),2,'0');
    var today=year+month+date2;
    return today;
}

//获取当前的最简日期字符串
exports.getNowSimplestDateStr=function(){
    var date=new Date();
    var month=stringUtil.autoComple((date.getMonth()+1),2,'0');
    var year=date.getFullYear().toString().substring(2,4);
    var date2=stringUtil.autoComple(date.getDate(),2,'0');
    var today=year+month+date2;
    return today;
}

//获取当前的最简时间字符串
exports.getNowSimpleTimeStr=function(){
    var date=new Date();
    var hour=stringUtil.autoComple(date.getHours(),2,'0');
    var minute=stringUtil.autoComple(date.getMinutes(),2,'0');
    var second=stringUtil.autoComple(date.getSeconds(),2,'0');
    var today=hour+minute+second;
    return today;
}

//获取今天的时间字符串
exports.getToday=function(){
    var date=new Date();
    var month=stringUtil.autoComple((date.getMonth()+1),2,'0');
    var year=date.getFullYear().toString();
    var date2=stringUtil.autoComple(date.getDate(),2,'0');
    var today=year+"/"+month+"/"+date2;
    return today;
}

//获取今天0点时间对象
exports.getTodayStart=function(){
    return new Date(exports.getToday()+" 00:00:00");
}

//获取今天23:59:59的时间对象
exports.getTodayEnd=function(){
    return new Date(exports.getToday()+" 23:59:59");
}

//获取今天的首尾时间对象
exports.getTodayStartEnd=function(){
    var today=exports.getToday();
//    today="2014/11/30";
    var start=new Date(today+" 00:00:00");
    var end=new Date(today+" 23:59:59");
    return [start,end];
}

//获取提前一段时间的日期
exports.getAheadDate=function(ahead){
    var year=ahead.year||0;
    var month=ahead.month||0;
    var day=ahead.day||0;
    var hour=ahead.hour||0;
    var minute=ahead.minute||0;

    minute=Math.floor(minute)+(hour-Math.floor(hour))*60;
    hour=Math.floor(hour)+(day-Math.floor(day))*24;
    day=Math.floor(day)+(month-Math.floor(month))*30;
    month=Math.floor(month)+(year-Math.floor(year))*12;
    year=Math.floor(year);

    minute=Math.floor(minute)+(hour-Math.floor(hour))*60;
    hour=Math.floor(hour)+(day-Math.floor(day))*24;
    day=Math.floor(day)+(month-Math.floor(month))*30;
    month=Math.floor(month);

    minute=Math.floor(minute)+(hour-Math.floor(hour))*60;
    hour=Math.floor(hour)+(day-Math.floor(day))*24;
    day=Math.floor(day);

    minute=Math.floor(minute)+(hour-Math.floor(hour))*60;
    hour=Math.floor(hour);

    minute=Math.floor(minute);

    console.log(year+" "+month+" "+day+ " "+hour+" "+minute);

    var date=new Date();

    if(year){
        date.setFullYear(date.getFullYear()-year);
    }
    if(month){
        date.setMonth(date.getMonth()-month);
    }
    if(day){
        date.setDate(date.getDate()-day);
    }
    if(hour){
        date.setHours(date.getHours()-hour);
    }
    if(minute){
        date.setMinutes(date.getMinutes()-minute);
    }

    return date;
}


exports.parseDate = function(str){
    if(typeof str == 'string'){
        var results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) *$/);
        if(results && results.length>3)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);
        if(results && results.length>6)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));
        results = str.match(/^ *(\d{4})-(\d{1,2})-(\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,9}) *$/);
        if(results && results.length>7)
            return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]),parseInt(results[7]));
    }
    return null;
}

//console.log(new Date());
//console.log(exports.getAheadDate({day:-1.5}))
//console.log(exports.getAheadDate({hour:-0.1}))
//console.log(exports.getNowSimpleDateStr());
//console.log(exports.getNowSimplestDateStr());
//console.log(exports.getNowDateStr());