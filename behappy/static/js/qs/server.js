ctxPath = "" 

function arithmeticImage(params, uiCallBackFunc) {
	scatchAjaxFunction("arithmetic", params, uiCallBackFunc);
}

function generateImage(params, uiCallBackFunc) {
	scatchAjaxFunction("generator", params, uiCallBackFunc);
}

function superResoluteX2Image(params, uiCallBackFunc) {
	commonAjaxFunction("super_resolution_x2?input=" + params, uiCallBackFunc);
}

function superResoluteNRImage(params, uiCallBackFunc) {
	commonAjaxFunction("super_resolution_nr?input=" + params, uiCallBackFunc);
}

function searchNeighbors(params, uiCallBackFunc, uiCallBackParam) {
	commonAjaxFunction("search_neighbors?num=12&input=" + params, uiCallBackFunc, uiCallBackParam);
}

function top10(uiCallBackFunc) {
	commonAjaxFunction("top10", uiCallBackFunc);
}

function getWords(uiCallBackFunc) {
	commonAjaxFunction("words", uiCallBackFunc);
}

function containWordImages(params, uiCallBackFunc, uiCallBackParam) {
	commonAjaxFunction("designs_contain_word?word=" + params, uiCallBackFunc, uiCallBackParam);
}

function imageHandler(uid, method, params, callBack) {
	if (uid != "") {
		uid += "/";
	}
	ajaxCRUDFunction("api/image/" + uid , method, params, callBack);
}

function designHandler(uid, method, params, callBack) {
	if (uid != "") {
		uid += "/";
	}
	ajaxCRUDFunction("api/design/" + uid, method, params, callBack);
}

function commonAjaxFunction(urlStr, callBack, callbackParam) {

	var callUrl = ctxPath + urlStr;

	$.ajax({
		type : "GET",
		url : callUrl,
		contentType : 'application/json',

		success : function(response) {
			callBack(response, callbackParam);
		},
		error : function(request, status, error) {
			alert("오류가 발생하였습니다. 다시 시도해주세요.");	
		},

	});
}

function ajaxCRUDFunction(urlStr, method, params, callBack) {

	var callUrl = ctxPath + urlStr;

	$.ajax({
		type : method,
		url : callUrl,
		data : params,
		success : function(response) {
			callBack(response);
		},
		error : function(request, status, error) {
			alert("오류가 발생하였습니다. 다시 시도해주세요..");	
		},

	});

}

function scatchAjaxFunction(urlStr, params, callBack, callbackParam) {

	var callUrl = ctxPath + urlStr;

	$.ajax({
		type : "GET",
		url : callUrl,
		data: params,
		contentType : 'application/json',
		beforeSend : function() {
			$("#loading_background").fadeIn("slow");
		},
		success : function(response) {
			callBack(response, callbackParam);
		},
		error : function(request, status, error) {
			alert("입력하신 단어를 분석할 수 없습니다. 조금 더 일반적인 단어를 사용해주세요.");	
		},
	}).complete(function() {
		$("#loading_background").fadeOut("slow"); 
	});
}


var imageDTO = {
	"uid": "",
	"gender": "",
	"category": "",
	"text": "",
}

var designDTO = {
	"id": 0,
	"uid": "",
	"history_uid": "0",
	"history_text": "0",
	"filtered": "revert",
	"like": 0
}

var arithmeticDTO = {
	"drop": "",
	"drag": "",
	"equation": ""
}
