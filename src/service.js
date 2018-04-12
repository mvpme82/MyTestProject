import config from './config';
import axios from 'axios';
import auth from './auth';
import objectAssign from 'object-assign';

var qs = require('qs');


axios.defaults.withCredentials = true;
axios.interceptors.response.use(function (response) {
	// 用户未登录时自动跳转登录地址
    if (response.data.status === 300) {
    	if (!/\/user$/.test(response.config.url)) {
    		auth.toLogin();
    	}
    }
    return response;
  }, function (error) {
    // Do something with response error
    return Promise.reject(error);
});





function formatParams(json){
	return qs.stringify(json);
}


function getRankParams(entityId, date, type, eDate){
	var params = {
		date: date
	};
	if (eDate) {
		params.endDate = eDate;
	}
	if (type === 'monitor') {
		params.asoMonitorPlanId = entityId;
	} else {
		params.tradeNo = entityId;
	}

	return params;
}


/**
 * get 请求
 * 
 * @param {any} url 
 * @param {any} params 
 * @returns 
 */
function getAxios(url, params = {}, async = false) {
	params.nocache = +new Date();
	return axios.get(url, {
		params: params,
		async: async
	});
}
/**
 * post 请求
 * 
 * @param {any} url 
 * @param {any} [params={}] 
 * @returns 
 */
function postAxios(url, params = {}, form = true) {
	params.nocache = +new Date();
	return axios.post(url, form ? formatParams(params) : params);
}

export default {
	/**
	 * 登录功能
	 */
	loginBase: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.LOGIN}`, data);
	},
	logout: (param) => {
		return getAxios(`${config.HOST_OWN}${config.LOGIN_OUT}`, param);
	},
	/**
	 * 注册功能
	 */
	registBase: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.REGISTER}`, data);
	},

	/**
	 * 找回密码
	 */

	nextStepBase: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.NEXT_FIND}`, data);
	},
	
	/**
	 * 检测密码是否为旧密码
	 */

	checkOldPwd: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.CHECK_OLD_PWD}`, data);
	},

	/**
	 * 设置新密码
	 */

	setNewPwd: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.SET_NEW_PWD}`, data);
	},
	
	/**
	 * 发送图片验证码
	 */
	imgCode: (data) => {
		return getAxios(`${config.HOST_LOGIN}${config.IMG_CODE}`, {
			imageVcode: data
		});
	},
	/**
	 * 校验手机号码是否被注册
	 */
	telCode: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.TEL_CODE}`, data);
	},
	/**
	 * 发送手机验证码
	 */
	sendTelCode: (params) => {
		return getAxios(`${config.HOST_LOGIN}${config.SEND_TEL_CODE}`, params);
	},

	searchScheme: (key, pageSize, currentPage)=>{
		return getAxios(`${config.HOST}${config.SEARCH}`, {
			key: key,
			pageSize: pageSize,
			currentPage : currentPage
		});
	},

	isBuyCase: (params) => {
		return getAxios(`${config.HOST}${config.IS_BUY_ID}`, params);
	},
	keyWordRank: (params) => {
		return getAxios(`${config.HOST}${config.KEY_WORDS}`, params);
	},
	listScheme: (params) => {
		return getAxios(`${config.HOST}${config.SCHEME_LIST}`, params);
	},


	getScheme: (schemeId)=>{
		return getAxios(`${config.HOST}${config.SCHEME_INFO}`, {
			schemeId: schemeId
		});
	},

	getAppInfo: (appId)=>{
		return getAxios(`${config.HOST}${config.APP_INFO}`, {
			appId: appId
		});
	},

	getRecommendSchemes: ()=>{
		return getAxios(`${config.HOST}${config.SCHEME_RECOMMEND}`, {});
	},

	importKeyword: (data)=>{
		return postAxios(`${config.HOST}${config.ASO_IMPORT}`, data, false);
	},

	createMonitor: (data)=>{
		return postAxios(`${config.HOST}${config.ASO_C_U}`, data);
	},

	updateMonitor: (data)=>{
		data.asoMonitorPlanId = 1;
		return postAxios(`${config.HOST}${config.ASO_C_U}`, data);
	},

	getSchemeKeywords:(schemeId, appId)=>{
		let params = {
			schemeId: schemeId
		};
		if (appId) {
			params.appId = appId;
		}
		return getAxios(`${config.HOST}${config.SCHEME_KEYWORD}`, params);
	},

	exportIDFA:(params)=>{
		return getAxios(`${config.HOST}${config.EXPORT_IDFA}`, params, true);
	},


	createSchemeOrder:(schemeId, appId, useAssets)=>{
		var obj = {
			schemeId: schemeId,
			useAssets: useAssets
		}
		if (appId) {
			obj.appId = appId
		}
		return postAxios(`${config.HOST}${config.C_S_ORDER}`, obj);
	},

	batchDelKeyword:(ids)=>{
		return postAxios(`${config.HOST}${config.B_DEL_KEYWORD}`, {
			ids: ids
		});
	},
	
	getKeywordRank:(params)=>{
		return getAxios(`${config.HOST}${config.KEYWORD_RANK}`, params);
	},

	payOptimizeOrder:(data)=>{
		return postAxios(`${config.HOST}${config.OPTIMIZE_PAY}`, data);
	},

	paySchemeOrder:(tradeNo, payType, useAssets)=>{
		return postAxios(`${config.HOST}${config.SCHEME_PAY}`, {
			tradeNo: tradeNo,
			payType: payType,
			useAssets: useAssets
		});
	},

	getMyScheme:(params)=>{
		return getAxios(`${config.HOST}${config.MY_SCHEME}`, params);
	},

	getMyMonitor:(params)=>{
		return getAxios(`${config.HOST}${config.MY_MONITOR}`, params);
	},

	getMyOptimize:(params)=>{
		return getAxios(`${config.HOST}${config.MY_OPTIMIZE}`, params);
	},

	
	checkUserLogin:()=>{
		return getAxios(`${config.HOST_OWN}${config.CHECK_LOGIN}`, {});
	},
	setUserCookie: (data) => {
		return postAxios(`${config.HOST_LOGIN}${config.SET_LOGIN_COOKIE}`, data);
	},
	getUserInfo:()=>{
		return getAxios(`${config.HOST}${config.USER_INFO}`, {});
	},
	getUserCookie: (params) => {
		return getAxios(`${config.HOST_LOGIN}${config.SETCOOKIE}`, params);
	},

	checkIsPay:(tradeNo, isSchemePay)=>{
		switch(isSchemePay) {
			case 'scheme':
				return postAxios(`${config.HOST}${config.IS_PAY}`, {
					tradeNo: tradeNo
				});
			break;
			case 'optimize':
				return postAxios(`${config.HOST}${config.IS_O_PAY}`, {
					tradeNo: tradeNo
				});
			break;
			case 'recharge':
			case 'assurance':
				return postAxios(`${config.HOST}${config.IS_MY_PAY}`, {
					tradeNo: tradeNo,
					order_type: isSchemePay
				});
			break;
		}
	},

	getSchemeCategory: ()=>{
		return getAxios(`${config.HOST}${config.SCHEME_CATEGORY}`, {});
	},

	getRecentRank: (entityId, date, type)=>{
		let rankURL = '';
		switch(type) {
			case 'monitor':
				rankURL = config.RECENT_RANK;
			break;
			case 'assurance':
				rankURL = config.ASSURANCE_RECENT_RANK;
			break;
			default:
				rankURL = config.OPTIMIZE_RECENT_RANK;
			break;
		}
		return getAxios(`${config.HOST}${rankURL}`, getRankParams(entityId, date, type));
	},

	getCurrentRank: (entityId, sDate, date,type)=>{
		let rankURL  = '';
		switch(type) {
			case 'monitor':
				rankURL = config.CURRENT_RANK_DAY;
			break;
			case 'assurance':
				rankURL = config.ASSURANCE_CURRENT_RANK;
			break;
			default:
				rankURL = config.OPTIMIZE_CURRENT_RANK;
			break;
		}
		return getAxios(`${config.HOST}${rankURL}`, getRankParams(entityId, sDate , type, date));
	},

	checkAppId: (appId)=>{
		return getAxios(`${config.HOST}${config.IS_APP_ID}`, {
			param: appId
		});
	},

	getChannelInfo: ()=>{
		return getAxios(`${config.HOST}${config.CHANNEL_INFO}`, {});
	},

	getChannelSuggestPrice: (params)=>{
		return getAxios(`${config.HOST}${config.CHANNEL_S_FEE}`, params);
	},

	exportRecentRank:(entityId, date, type)=>{
		let rankURL  = '';
		switch(type) {
			case 'monitor':
				rankURL = config.EXPORT_R_RANK;
			break;
			case 'assurance':
				rankURL = config.ASSURANCE_EXPORT_R_RANK;
			break;
			default:
				rankURL = config.OPTIMIZE_EXPORT_R_RANK;
			break;
		}
		return getAxios(`${config.HOST}${rankURL}`, getRankParams(entityId, date, type));
	},

	exportCurrentRank:(entityId, sDate, date, type)=>{
		let rankURL  = '';
		switch(type) {
			case 'monitor':
				rankURL = config.EXPORT_RANK;
			break;
			case 'assurance':
				rankURL = config.ASSURANCE_EXPORT_RANK;
			break;
			default:
				rankURL = config.OPTIMIZE_EXPORT_RANK;
			break;
		}
		return getAxios(`${config.HOST}${rankURL}`, getRankParams(entityId, sDate, type, date));
	},


	mechinePrice: (params) => {
		return getAxios(`${config.HOST}${config.OPTIMIZE_MECHINE_PRICE}`, params);
	},
	createOptimize:(data)=>{
		return postAxios(`${config.HOST}${config.CREATE_OPTIMIZE}`, data);
	},

	deleteOptimizeKeyword:(kId)=>{
		return postAxios(`${config.HOST}${config.DELETE_O_KEYWORD}`, {
			id: kId
		});
	},

	deleteMonitor:(monitorId)=>{
		return getAxios(`${config.HOST}${config.DELETE_MONITOR}`, {
			asoMonitorPlanId: monitorId
		});
	},

	getSuggestDownload:(params)=>{
		return getAxios(`${config.HOST}${config.OPTIMIZE_SUGGEST_D}`, params);
	},

	getRealTime:()=>{
		return getAxios(`${config.HOST}${config.TIME}`, {});
	},

	getCoverDegress:(appId, keywords)=>{
		return getAxios(`${config.HOST}${config.COVER_DEGRESS}`, {
			appId: appId,
			keywords: keywords
		});
	},
	getOrderInfo:(params)=>{
		return getAxios(`${config.HOST}${config.OPTIMIZE_INFO}`, params);
	},

	getQRCode:(type, tradeNo, useAssets)=>{
		let URL = '';
		switch(type) {
			case 'scheme':
				URL = config.QR_CODE_SCHEME;
			break;
			case 'optimize':
				URL = config.QR_CODE_OPTIMIZE;
			break;
			case 'recharge':
			case 'assurance':
				URL = config.MY_CODE_OPTIMIZE;
			break;
		}
		return getAxios(`${config.HOST}${URL}`, {
			tradeNo: tradeNo,
			useAssets: useAssets > 0 ? true : false,
			order_type: type
		});
	},
	getParam:(name)=>{
	    var Locationurl;
	    Locationurl =  window.location.href;
	    var r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)');
	    var m = Locationurl.match(r);
	    return m ? decodeURIComponent(m[2]) : null;
	},

	getMyAssets:(params)=>{
		return getAxios(`${config.HOST}${config.MY_ASSETS}`, params);
	},
	getMyAssetsLog:(params)=>{
		return getAxios(`${config.HOST}${config.MY_ASSETS_LOG}`, params);
	},

	// 0920 需求
	cancelOrder:(params)=>{
		return getAxios(`${config.HOST}${config.CANCEL_ORDER}`, params);
	},
	createMyOrder:(params)=>{
		return getAxios(`${config.HOST}${config.MY_CREARE_ORDER}`, params);
	},
	createMyPay:(params)=>{
		return getAxios(`${config.HOST}${config.MY_PAY}`, params);
	},

	// 10.01 担保需求
	createAssurance:(data)=>{
		return postAxios(`${config.HOST}${config.ASSURANCE_CREATE}`, data);
	},
	urlShare:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_URLSHARE}`, params);
	},
	assuranceShare:(params)=>{
		return postAxios(`${config.HOST}${config.ASSURANCE_SHARE}`, params);
	},
	assuranceInfo:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_ORDERINFO}`, params);
	},
	createAssurancePay:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_PAY}`, params);
	},
	assuranceList:(params)=>{
		return getAxios(`${config.HOST}${config.MY_ASSURANCE}`, params);
	},
	keyDetail:(params)=>{
		return getAxios(`${config.HOST}${config.OPTIMIZE_KEY_DETAIL}`, params);
	},
	confirmOrder:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_CONFIRMORDER}`, params);
	},
	exportOrderInfo:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_EXPORT_RANK_INFO}`, params);
	},
	assuranceLogs:(params)=>{
		return getAxios(`${config.HOST}${config.ASSURANCE_LOG}`, params);
	},
	// 1001 bug需求
	updateRemark:(params)=>{
		return postAxios(`${config.HOST}${config.UPDATE_REMARK}`, params);
	},
	addKeyword:(params, update = false)=>{
		let keyURL = update ? config.UPDATE_KEYWORD : config.ADD_KEYWORD;
		return postAxios(`${config.HOST}${keyURL}`, params);
	},

	// 1202 需求
	loginWithPhone:(phone, code)=>{
        return axios.post(`${config.HOST_LOGIN}${config.PHONE_LOGIN}?phone=${phone}&vCode=${code}`);
	},
	loginWithWeixin:(params)=>{
        return axios.get(`${config.HOST_LOGIN}${config.WEIXIN_LOGIN_CODE}`, {
			params: params
		});
	},

	updateArrive:(data, type)=>{
		let URL = '';
		switch(type) {
			case 'aso':
				URL = config.UPDATE_ASO_ARRIVE;
			break;
			case 'optimize':
				URL = config.UPDATE_OPTIMIZE_ARRIVE;
			break;
		}
        return postAxios(`${config.HOST}${URL}`, data);
	},
}