import {extendObservable} from "mobx";
export default {
    getUrlParams: (url) => {
        var urlStr = url ? url : (window.location.href.match(/(\?[^\?]*)$/) ? window.location.href.match(/(\?[^\?]*)$/)[1] : ""),
        param = {};
        if (urlStr) {
            var urlArr = urlStr.split("?");
            if (urlArr[1]) {
                urlArr = urlArr[1].split(/&|#/);

                for (var i = urlArr.length - 1; i >= 0; i--){
                    var tempArr = urlArr[i].split("=");
                    param[tempArr[0]] = tempArr[1];
                }
            }
        }
        return param;
    },
    setCookie: (name, value, iDay) => {
    　　var oDate = new Date();
    　　oDate.setDate(oDate.getDate() + iDay);
    　　document.cookie = name + "="+ escape (value) + ";expires=" + oDate.toGMTString(); 
    },
    getCookie: (name) => {
    　　var arr = document.cookie.split(";");
    　　for(var i = 0; i < arr.length; i++) {
    　　　　    var arr2 = arr[i].split("=");
        　　if(arr2[0].trim() == name) {
        　　　　return arr2[1];
        　　}　　
    　  }
        return 0;
    },
    delCookie: (name) => {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval= this.a.getCookie(name);
        if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
}