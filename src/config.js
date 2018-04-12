export default {

	// 本地
	HOST: 'http://asoapi.kuchuan.com',
	HOST_LOGIN: 'http://user.kuchuan.com',
	// 新加
	HOST_OWN: 'http://user.kuchuan.com',  	


	// qa ol
	HOST: '/api',
	HOST_LOGIN: '/u',
	HOST_OWN: 'http://user.kuchuan.com',


	LOGIN_URL: '/login',
	REGISTER_URL: '/register',
	LOGIN_OUT: '/api/logout',

	LOGIN: '/api/login',
	REGISTER: '/api/regist',
	IMG_CODE: '/api/verifyImageVcode',
	TEL_CODE: '/api/verifyAccount',
	SEND_TEL_CODE: '/api/get-verify-code',
	NEXT_FIND: '/api/verify-code',
	CHECK_OLD_PWD: '/api/verify-old-password',
	SET_NEW_PWD: '/api/set-new-password',
	SETCOOKIE: '/api/getCookie',
	
	IS_BUY_ID: '/scheme/isBought',

	KEY_WORDS: '/keywordIndex',

	SEARCH: '/scheme/search',
	SCHEME_LIST: '/scheme/list',
	SCHEME_INFO: '/scheme/schemeInfo',
	APP_INFO: '/app/info',
	SCHEME_RECOMMEND: '/scheme/categoryRecommend',
	ASO_IMPORT: '/aso/import',
	ASO_C_U: '/aso/createOrUpdate',
	SCHEME_KEYWORD:'/scheme/schemeKeyword',
	EXPORT_IDFA:'/optimize/exportIDFA',
	C_S_ORDER: '/scheme/createSchemeOrder',
	SCHEME_PAY: '/scheme/pay',
	MY_SCHEME: '/my/scheme',
	MY_MONITOR: '/my/monitor',
	MY_OPTIMIZE:'/my/optimize',

	// 判断用户是否登录
	CHECK_LOGIN: '/api/checkLoginC',
	SET_LOGIN_COOKIE: '/api/loginC',
	USER_INFO: '/user',


	IS_PAY: '/scheme/isPay',
	IS_O_PAY: '/optimize/isPay',
	SCHEME_CATEGORY: '/scheme/category',
	B_DEL_KEYWORD: '/optimize/batchDelKeyword',
	KEYWORD_RANK: '/optimize/getKeywordRank',
	IS_APP_ID: '/testAppId',
	CHANNEL_INFO: '/optimize/channel',
	CHANNEL_S_FEE: '/optimize/suggestFee', //渠道商建议价
	CREATE_OPTIMIZE: '/optimize/create',
	OPTIMIZE_PAY: '/optimize/pay',
	DELETE_O_KEYWORD: '/optimize/delKeyword', // 删除优化关键词
	DELETE_MONITOR: '/aso/delete',
	
	RECENT_RANK: '/aso/recentRank',
	CURRENT_RANK: '/aso/rank',
	CURRENT_RANK_DAY: '/aso/rankDay',
	EXPORT_R_RANK: '/aso/exportRecentRank',
	EXPORT_RANK: '/aso/exportRank',

	OPTIMIZE_RECENT_RANK: '/optimize/recentRank',
	OPTIMIZE_CURRENT_RANK: '/optimize/rank',
	OPTIMIZE_EXPORT_R_RANK: '/optimize/exportRecentRank',
	OPTIMIZE_EXPORT_RANK:'/optimize/exportRank',

	OPTIMIZE_MECHINE_PRICE: '/optimize/getMechinePrice',

	OPTIMIZE_SUGGEST_D:'/optimize/suggestDownload',

	COVER_DEGRESS: '/optimize/getCoverDegree',
	QR_CODE_OPTIMIZE: '/optimize/wechatPay',

	OPTIMIZE_INFO:'/optimize/orderInfo',

	QR_CODE_SCHEME: '/scheme/wechatPay',
	
	TIME: '/time',
	// 0904 需求
	MY_ASSETS: '/my/assets',
	MY_ASSETS_LOG: '/my/assetsLog',
	

	// 0920 需求
	CANCEL_ORDER: '/my/cancelOrder',
	MY_CREARE_ORDER: '/my/createOrder',
	MY_PAY: '/my/pay',
	MY_CODE_OPTIMIZE: '/my/wechatPay',
	IS_MY_PAY: '/my/isPay',

	// 10.01 担保需求
	ASSURANCE_CREATE: '/assurance/create',
	ASSURANCE_URLSHARE: '/assurance/urlShare',
	ASSURANCE_SHARE: '/assurance/share',
	ASSURANCE_ORDERINFO: '/assurance/orderInfo',
	ASSURANCE_PAY: '/assurance/pay',
	IS_ASSURANCE_PAY: '/my/isPay',
	MY_ASSURANCE: '/my/assurance',
	OPTIMIZE_KEY_DETAIL: '/optimize/keywordDetail',
	ASSURANCE_CONFIRMORDER: '/assurance/confirmOrder',
	QR_IMG: '/my/qrImg',

	ASSURANCE_RECENT_RANK: '/assurance/recentRank',
	ASSURANCE_CURRENT_RANK: '/assurance/rank',
	ASSURANCE_EXPORT_R_RANK: '/assurance/exportRecentRank',
	ASSURANCE_EXPORT_RANK:'/assurance/exportRank',
	ASSURANCE_EXPORT_RANK_INFO: '/assurance/exportOrderDetail',
	ASSURANCE_LOG: '/assurance/logList',
	// 1001 bug需求
	UPDATE_REMARK: '/aso/updateRemark',
	ADD_KEYWORD: '/optimize/addKeyword',
	UPDATE_KEYWORD: '/optimize/updateKeyword',
	// 1202 需求
	PHONE_LOGIN: '/api/phone_login',
	WEIXIN_LOGIN_CODE: '/api/oauth2/uri',
	UPDATE_ASO_ARRIVE: '/aso/updateArrive',
	UPDATE_OPTIMIZE_ARRIVE: '/optimize/updateArrive',
	// 目标排名
	expectRank:{
		1:'TOP1',
		2:'TOP2',
		3:'TOP3',
		5:'TOP5',
		10:'TOP10'
	},

	// 要求
	standard:{
		1:'不降档',
		2:'降档',
		3:'必保排名'
	},

	// 上榜率
	protectRate:{
		1:'保100%',
		2:'保70%',
		3:'上多少算多少'
	},

	competition:{
		0:"弱",
		1:"一般",
		2:"强"
	},
	coverDegree:{
		0:"50%以下",
		1:"51%～60%",
		2:"61%～70%",
		3:"71%～80%",
		4:"81%～90%",
		5:"90%以上",
	}

}