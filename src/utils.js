import moment from 'moment';
import Service from './service';

const phoneValidate = /^1[3|4|5|7|8][0-9]{9}$/; //手机号正则
const emailValidate =  /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; //邮箱正则



export default {
	
	// 格式化时间戳 格式
	formatTime(time, rule){
		let mtime = moment(time);
		return mtime.format(rule);
	},

	// 相隔天数
	days(start, end){
		let diff = moment(end).diff(moment(start),'days');
		return diff + 1;
	},

	getLength(str){
		if (!str) return 0;
		return str.replace(/[\u0391-\uFFE5]/g,"aa").length
	},

	joinValid(keywords) {
		keywords = keywords.split(/[,，、；;\r\n\s]/);
        let arr = [];
        keywords.forEach((val)=>{
			if (val) {
                arr.push(val.trim());
            }
        });
		return  arr.join(',');
	},

	splitValid(keywords) {
		keywords = keywords.split(/[,，、；;\r\n\s]/);
        let arr = [];
        keywords.forEach((val)=>{
			if (val) {
                arr.push(val.trim());
            }
        });
		return  arr;
	},

	// 检查关键词的有效行 不重复即可 或者全部为空
	checkIsValidNew(keywords) {
		if (this.getLength(keywords) <= 0) { return false; }
		let kws = keywords.split(/[,，、；;\r\n\s]/);
		let total = 0;
		let zerocount = 0;
		kws.forEach((val)=>{
			if (this.getLength(val) <= 0) {
				zerocount += 1;
			}
			total += 1;
		});
		if (zerocount === total) { return false; }
		return true;

	},


	checkIsValid(keywords){ // ,12,,,

		if (this.getLength(keywords) <= 0) { return false; }

		let kws = keywords.split(this.comma()[0]);
		let total = 0;
		let zerocount = 0;
		let tmpcheck = [];
		let isRepeat = false;

		kws.forEach((val)=>{
			val.split(this.comma()[1]).forEach((innerV)=>{
				if (innerV) { // 有效值
					if (tmpcheck.indexOf(innerV) > -1) {
						isRepeat = true; // 有效值已存在
					}
					tmpcheck.push(innerV);
				}
				if (this.getLength(innerV) <= 0) {
					zerocount += 1;
				}

				total += 1;
			});
		});
		if (zerocount === total) { return false; }


		return true;
	},

	checkKeywordLength(keywords){ // true 正常. false长度超出限制
		let kws = keywords.split(this.comma()[0]);

		let isRight = true;

		kws.forEach((val)=>{
			val.split(this.comma()[1]).forEach((innerV)=>{
				if (this.getLength(innerV) > 32) {
					isRight = false;
				}
			});
		});

		return isRight;
	},

	comma(){
		return [String.fromCharCode(44), String.fromCharCode(65292)]
	},

	getKeywordCount(keywords){
		let kws = keywords.split(this.comma()[0]);
		let count = 0;
		kws.forEach((val)=>{
			val.split(this.comma()[1]).forEach(()=>{
				count += 1;
			});
		});

		return count;
	},

	downloadFile(fileUrl){
/*		var newTab = window.open('about:blank')
		newTab.location.href = fileUrl;*/
		var aElem = document.createElement('a');
		aElem.href = fileUrl;
		document.body.appendChild(aElem);
		aElem.click();
		aElem.remove();
	},

	// 格式化关键词 去除空串 保留有效字符串
	formatKeywords(keywords){
		let kws = keywords.split(this.comma()[0]);
		let newkws = [];
		kws.forEach((val)=>{
			val.split(this.comma()[1]).forEach((innerV)=>{
				if (innerV) {
					newkws.push(innerV);
				}
			});
		});

		// 转义\和/
		newkws = newkws.join(",");
		return newkws;
	},

	getRealTime(){
		return new Promise((resolve, reject)=>{
			Service.getRealTime().then((response)=>{
				if (response.data.status === 200) {
					resolve(moment(response.data.time));
				} else {
					reject();
				}
			}).catch(()=>{
				reject();
			})
		});
	},

	// 校验数组是否有重复数据
	isArrayRepeat(arr) {
		var s = arr.join(",") + ",";
		for(var i=0; i < arr.length; i++) {
			if(s.replace(arr[i] + ",","").indexOf(arr[i]+",")>-1) {
				return true;
			}
		}
		return false;
	},

	isIos() {
		let u = navigator.userAgent;
		//ios终端
		return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); 
	}
}