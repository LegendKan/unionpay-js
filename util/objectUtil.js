/**
 * Created by heddy on 11/2/14.
 */

exports.clone=function(obj){
    var objClone=new obj.constructor(); //这里是创建一个与被Clone对象相同结构的对象
    for(var key in obj)
    {
        if(objClone[key]!=obj[key])
        {
            if(typeof(obj[key])=='object' && !(obj[key] instanceof Buffer))
            {
                objClone[key]=exports.clone(obj[key]);
            }
            else
            {
                objClone[key]=obj[key];
            }
        }
    }
    if(!objClone || (''+objClone)=='')
    {
        return (new String(obj)+objClone)?obj:objClone;
    }
    else
    {
        objClone.toString=obj.toString;
        return objClone;
    }
}

exports.toUpperCase=function(obj){
    var newObj={};
    for(var attr in obj){
        newObj[attr.toUpperCase()]=obj[attr];
    }
    return newObj;
}

exports.toLowerCase=function(obj){
    var newObj={};
    for(var attr in obj){
        newObj[attr.toLowerCase()]=obj[attr];
    }
    return newObj;
}
