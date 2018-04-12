import {extendObservable} from "mobx";
import Service from './service';
import config from './config';


class User {
	constructor(){
		extendObservable(this, {
			entity: null
		})
	}
}

var checkPromise = null;

export const UserObj = new User();

export default {

	// 获取用户信息以检测用户状态
	checkStatus: ()=>{	
		if (checkPromise == null) {
			checkPromise = new Promise((resolve, reject)=>{
				if (UserObj.entity) {
					checkPromise = null;
					resolve(true);
				}
				else {
					Service.checkUserLogin().then( res => {
						if (res.data.status === 200 && res.data.data) {
							let userCookie = res.data.data;
							Service.setUserCookie(userCookie).then(res=> {
								if (res.data.status === 200) {
									Service.getUserInfo().then((res)=>{
										if (res.data.status === 200 && res.data.data) {
											UserObj.entity = res.data.data;
											resolve(true);
										} else {
											resolve(false);
										}
										checkPromise = null;
									}).catch(()=>{
										resolve(false);
										checkPromise = null;
									});
								}
								else {
									resolve(false);
									checkPromise = null;
								}
							}).catch(()=>{
								resolve(false);
								checkPromise = null;
							})
						}
						else {
							resolve(false);
							checkPromise = null;
						}
					}).catch(()=>{
						resolve(false);
						checkPromise = null;
					});
				}
			});
		}
		return checkPromise;
	},

	// 是否授权
	isAuthorizedAgain: ()=>{
		return UserObj.entity ? true : false;
	},
	isAuthorized: ()=>{
		return UserObj.entity ? true : false;
		// if (UserObj.entity) {
		// 	return true;
		// }
		// Service.checkUserLogin().then( res => {
		// 	if (res.data.status === 200 && res.data.data) {
		// 		let userCookie = res.data.data;
		// 		Service.setUserCookie(userCookie).then(res=> {
		// 			if (res.data.status === 200) {
		// 				Service.getUserInfo().then((res)=>{
		// 					if (res.data.status === 200 && res.data.data) {
		// 						UserObj.entity = res.data.data;
		// 						return true;
		// 					}
		// 					return false;
		// 				}).catch(()=>{
		// 					return false;
		// 				});
		// 			}
		// 			return false;
		// 		}).catch(()=>{
		// 			return false;
		// 		})
		// 	}
		// 	return false;
		// }).catch(()=>{
		// 	return false;
		// });
	},
	toLogin: (redirect_uri)=>{
		if (redirect_uri) {
			window.location.href = config.LOGIN_URL + '?redirect_uri=' + encodeURIComponent(redirect_uri);
		} else {
			window.location.href = config.LOGIN_URL + '?redirect_uri=' + encodeURIComponent(window.location.href);			
		}	
	}
}