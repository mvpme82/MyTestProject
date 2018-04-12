import {extendObservable} from "mobx";
import Service from './service';
import config from './config';
import Cookies from 'js-cookie';


export default {
    //默认会话时间  单位周
    CONVERSATION_TIME : 1*7*24*60*60*1000, 
    
    /**
     * cookie  自定义保存cookie
     * @param cookieKey 存取数据需要的键
     * 这里面存的是一组键值对
     * @param saveKey 
     * @param saveValue
     */
    saveCookie(cookieKey, saveKey , saveValue) {
        saveKey = encodeURI(saveKey, "utf-8");
        saveValue = encodeURI(saveValue, "utf-8");
        let options = {
                hour: this.CONVERSATION_TIME, 
                saveKey:saveKey||{},
                saveValue:saveValue||{}
        };
        if(options.hour){
            let today = new Date();
            let expire = new Date();
            expire.setTime(today.getTime() + options.hour);
        }
        let value =    (options.saveKey ? "" + options.saveKey : "")
            +"&&++"+(options.saveValue ? "" + options.saveValue : "");
        window.document.cookie = cookieKey + "=" + value+"; path=/";
        if(window.document.cookie==null || window.document.cookie.length==0){
            return false;
        }
        return this;
    },
    
    /*
    * 取出cookie中的键值对
    * return {
    * 	saveKey：key
    * 	saveValue：value
    * }
    */
    getCookieValue(cookieKey){
        let reg = new RegExp("(^| )" + cookieKey + "=([^;]*)(;|\x24)");
        let result = reg.exec(document.cookie);
        if(result){
            let resultStr = result[2]||"";
            let resultList = resultStr.split("&&++");
            let returnValue = {
                saveKey: decodeURI(resultList[0],"utf-8"),
                saveValue:decodeURI(resultList[1],"utf-8")
            };
            return returnValue;
        }
        let returnNull = {
            saveKey: null,
            saveValue:null
        };
        return returnNull;
    },
    //删除cookies
    deleteCookie(cookieKey){
        let exp = new Date();
        exp.setTime(exp.getTime() - 1);
        let cval = this.getCookieValue(cookieKey);
        if (cval!=null) {
            window.document.cookie= cookieKey + "="+cval+";expires="+exp.toGMTString() +";path=/";
        }
    },
    /*
        * localStorage 无存储时效，用户主动清除则无
        * 最大存储5M  不能存储json格式数据  
        * 类型限定为string类型
        */
    saveLocalStorage(key,value) {
        if(window.localStorage){  
            //支持 
            localStorage.setItem(key,value);
        }else{  
            //不支持  
            alert("该浏览器不支持localStorage");
        }
    },
    getLocalStorage(key) {
        if(window.localStorage){  
            //支持 
            let value = localStorage.getItem(key);
            return value;
        }
        return null;
    },
    deleteLocalStorage(key) {
        if(window.localStorage){  
            localStorage.removeItem(key);
        }
    }
}