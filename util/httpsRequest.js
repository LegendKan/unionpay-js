/**
 * Created by heddy on 5/26/14.
 * https请求
 */
var https           = require('https');
var contextLogger   = require('../logging/contextLogger');
var myLogger = contextLogger("httpsRequest","TRACE");
var fs              = require('fs');

module.exports=function(config,callback){
    config.hostname=config.hostname?config.hostname:'localhost';
    config.port=config.port?config.port:2001;

    config.key=config.key?config.key:fs.readFileSync('../security/keys/privatekey.pem');
    config.cert=config.cert?config.cert:fs.readFileSync('../security/keys/certificate.pem');
    config.rejectUnauthorized=config.rejectUnauthorized?config.rejectUnauthorized:false;
    config.agent=false;

    if(config.method.toUpperCase()=="POST" && config.post_data) {
        config.headers = config.headers?config.headers:{
            "Content-Type": 'application/json',
//            "Content-Type": 'application/x-www-form-urlencoded',
            "Content-Length": config.post_data.length,
            "Charset" : "utf8"
        };
    }

    var req = https.request(config, function(res) {
        myLogger.trace('STATUS: ' + res.statusCode);
        myLogger.trace('HEADERS: ' + JSON.stringify(res.headers));
        myLogger.trace('Request: ' + config.hostname+":"+(config.port||80)+(config.path||"/"));
        res.setEncoding('utf8');
        var data="";
        res.on('data', function (chunk) {
            data+=chunk;
        });
        res.on('end',function(){
            myLogger.trace("FINISH http request: "+ (data.replace(/\s+/g, "")).substring(0,20) + (data.length>20?" ...":""));
            callback(null,data);
        })
    });

    req.on('error', function(e) {
        myLogger.warn('problem with request: ' + e.message);
        callback(e,null);
    });

    if(config.post_data){
        req.write(config.post_data + "\n");
    }
    req.end();
}
