/**
 * Created by Legend on 2015-06-26.
 * 银联支付，一些工具方法。
 */
var node_env = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';
var unionpayConfig = require('../config/unionpayConfig.json')[node_env];
var dateUtil = require("../util/dateUtil");
var objectUtil = require("../util/objectUtil");
var crypto = require('crypto');
var urlencode = require('urlencode');
var querystring = require('querystring');
var async = require('async');
var fs=require("fs");
var httpsRequest = require('../util/httpsRequest');
var iconv=require("iconv-lite");

var privateKey = fs.readFileSync('../security/paymentKeys/unprivate.pem'); //商户测试私钥,使用openssl从pfx文件中生成并去除密码
var publicKey = fs.readFileSync('../security/paymentKeys/verify_sign_acp.cer'); //银联测试公钥

function sign(data){
    data=createLinkString(data,true);
    var gbkBytes = iconv.encode(data,'utf-8');
    data=gbkBytes;
    var sha1 = crypto.createHash('sha1');
    sha1.update(data);
    var ss1=sha1.digest('hex');
    var sign = crypto.createSign("RSA-SHA1");
    sign.update(ss1);
    var signcode=sign.sign(privateKey, "base64");
    return signcode;
}

exports.testSign=function(data){
    var gbkBytes = iconv.encode(data,'utf-8');
    data=gbkBytes;
    var sha1 = crypto.createHash('sha1');
    sha1.update(data);
    var ss1=sha1.digest('hex');
    var sign = crypto.createSign("RSA-SHA1");
    sign.update(ss1);
    var signcode=sign.sign(privateKey, "base64");
    return signcode;
}

exports.sign=sign;

//注册支付流水号
exports.regist = function (data, cb) {
    if(!data.orderId||data.txnAmt<=0){
        cb("参数出错",null);
        return;
    }
    data.merId = data.merId || unionpayConfig.merId;
    data.encoding = data.encoding || unionpayConfig.encoding;
    data.certId = data.certId || unionpayConfig.certId;
    data.txnType = "01";
    data.txnSubType = "01";
    data.bizType = "000201";
    data.txnTime=dateUtil.getNowSimpleStr();
    data.frontUrl = unionpayConfig.frontUrl;
    data.backUrl = unionpayConfig.backUrl;
    data.signMethod = unionpayConfig.signMethod;
    data.channelType = unionpayConfig.channelType;
    data.accessType = unionpayConfig.accessType;
    data.currencyCode = unionpayConfig.currencyCode;
    data.orderDesc=data.orderDesc || "汇金百货";
    data.version=data.version || unionpayConfig.version;
    data.reqReserved=data.reqReserved||'透传信息';
    //data.certId="124876885185794726986301355951670452718";//通过程序事先获得避免每次都获得。

    async.waterfall([
        function(cb){
            var signcode= sign(data);
            console.log("------>"+signcode);
            data.signature=signcode;
            //http请求
            //请求参数
            //var options = objectUtil.clone(unionpayConfig.regist);
            var options={
                "hostname": "101.231.204.80",
                "port": 5000,
                "method":"POST",
                "path":"/gateway/api/appTransReq.do",
                "rejectUnauthorized" : false,
                "secureOptions": require('constants').SSL_OP_NO_TLSv1_2
            };
            options.post_data=querystring.stringify(data);
            options.headers = {
                "Content-Type": 'application/x-www-form-urlencoded',
                "Content-Length": options.post_data.length
            };
            httpsRequest(options,cb);

        },
        function(msg,cb){
            //验签
            console.log("+++++++++++++++++++++++++++++++++"+msg);
            //拆分返回的结果
            msg = convertStringToArray(msg);
            if(verify(msg)){
                if(msg.respCode!="00"){
                    cb(msg.respMsg,null);
                }else{
                    var result={};
                    result.tn=msg.tn;
                    result.txnTime=msg.txnTime;
                    cb(null,result);
                }
            }else{
                cb('验签失败',null);
            }
        }
    ],cb);
}

function verify(msg){
    var signature_str=msg.signature;
    console.log("返回的服务器签名："+signature_str);
    var keys = [];
    for(var key in msg){
        if(key!='signature'){
            keys.push(key);
        }
    }
    keys=keys.sort();
    var data="";
    for(var i=0; i<keys.length; i++){
        var key = keys[i];
        if(i==0){
            data+=key+"="+msg[key];
        }else{
            data+="&"+key+"="+msg[key];
        }
    }
    var gbkBytes = iconv.encode(data,'utf8');
    data=gbkBytes;

    console.log("验证前："+data);
    var sha1 = crypto.createHash('sha1');
    sha1.update(data);
    var ss1=sha1.digest('hex');
    console.log("验证SHA1-----> "+ss1);
    var verifier = crypto.createVerify("RSA-SHA1");
    verifier.update(ss1);
    console.log("Decode64--->"+signature_str);
    return verifier.verify(publicKey, signature_str, "base64");
}

exports.verify=verify;

//根据流水号查询支付结果
exports.queryById=function(queryId,cb){
    var data={};
    data.version=unionpayConfig.version;
    data.merId = unionpayConfig.merId;
    data.encoding = unionpayConfig.encoding;
    data.certId = unionpayConfig.certId;
    data.txnType = '00';
    data.txnSubType =  '00';
    data.bizType = '000000';
    data.signMethod = unionpayConfig.signMethod;
    data.accessType = unionpayConfig.accessType;
    data.queryId=queryId;
    async.waterfall([
        function(cb){
            var signcode= sign(data);
            console.log("------>"+signcode);
            data.signature=signcode;
            //http请求
            var options = objectUtil.clone(unionpayConfig.query);
            options.secureOptions=require('constants').SSL_OP_NO_TLSv1_2;
            options.post_data=querystring.stringify(data);
            options.headers = {
                "Content-Type": 'application/x-www-form-urlencoded',
                "Content-Length": options.post_data.length
            };
            httpsRequest(options,cb);
        },
        function(msg,cb){
            console.log("查询返回： "+msg);
            msg = convertStringToArray(msg);
            //验签
            if(verify(msg)){
                cb(null,msg);
            }else{
                cb('验签失败',null);
            }
        }
    ],cb);
};

//查询支付结果根据订单和订单发送时间查询
exports.query=function(orderId,txnTime,cb){
    var data={};
    data.version=unionpayConfig.version;
    data.merId = unionpayConfig.merId;
    data.encoding = unionpayConfig.encoding;
    data.certId = unionpayConfig.certId;
    data.txnType = '00';
    data.txnSubType =  '00';
    data.bizType = '000000';
    data.signMethod = unionpayConfig.signMethod;
    //data.channelType = '07';
    data.accessType = unionpayConfig.accessType;
    data.txnTime=txnTime;
    data.orderId=orderId;
    async.waterfall([
        function(cb){
            var signcode= sign(data);
            console.log("------>"+signcode);
            data.signature=signcode;
            //http请求
            var options = objectUtil.clone(unionpayConfig.query);
            options.secureOptions=require('constants').SSL_OP_NO_TLSv1_2;
            options.post_data=querystring.stringify(data);
            console.log("+++++++"+options.post_data);
            options.headers = {
                "Content-Type": 'application/x-www-form-urlencoded',
                "Content-Length": options.post_data.length
            };
            httpsRequest(options,cb);
        },
        function(msg,cb){
            console.log("查询返回： "+msg);
            msg = convertStringToArray(msg);
            //验签
            if(verify(msg)){
                cb(null,msg);
            }else{
                cb('验签失败',null);
            }
        }
    ],cb);
};

//银联回调
exports.notify=function(data, cb){
    if(verify(data)){
        cb(null,data);
    }else{
        cb("验签失败",null);
    }
};

function createLinkString(para, sort) {
    var linkString = "";
    if (sort == true) {
        para = argSort(para);
    }
    for ( var key in para) {
        if(key=="signature"){
            continue;
        }
        var value = para[key];
        linkString += key + "=" + value + "&";
    }
    // 去掉最后一个&字符
    linkString = linkString.substr(0, linkString.length - 1);

    return linkString;
}

exports.createLinkString=createLinkString;

/**
 * 应答解析
 *
 * @param respString
 *            应答报文
 * @param resp
 *            应答要素
 * @return 应答是否成功
 */
function convertStringToArray(respString) {
    var params = [];
    if (respString != "") {
        var para = respString.split("&");
        for ( var key in para) {
            //var value = para[key].split("=");
            var pos=para[key].indexOf("=");
            params[para[key].substring(0,pos)] = para[key].substring(pos+1,para[key].length);
            console.log(para[key].substring(0,pos)+"==>"+para[key].substring(pos+1,para[key].length));
        }
    }
    return params;
}

exports.convertStringToArray=convertStringToArray;

/**
 * 除去请求要素中的空值和签名参数
 *
 * @param para
 *            请求要素
 * @return 去掉空值与签名参数后的请求要素
 */
function paraFilter(para) {
    var result = [];

    for ( var key in para) {
        var value = para[key];
        if (key == "signature" || key == "signMethod" || value == "") {

        } else {
            result[key] = para[key];
        }
    }

    return result;
}

/**
 * 对数组排序
 *
 * @param para
 *            排序前的数组 return 排序后的数组
 */
function argSort(array) {

    var keys = [];
    for ( var key in array) {
        keys.push(key);
    }
    keys.sort();

    var result = [];
    for ( var key in keys) {
        result[keys[key]] = array[keys[key]];
    }
    return result;
}

exports.argSort=argSort;