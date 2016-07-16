function progress_on(step) {
	progress = step[0]; container = step[1];

	var li = progress.parent()
	li.addClass("current-page");
}

function progress_off(step) {
	progress = step[0]; container = step[1];

	var li = progress.parent()
	li.removeClass("current-page");
}

predGender = [];
predCategory = [];
textHistory = "0";

function splitUid(path) {
	var separators = ['\\\+', '\\\_', '\\\.'];
	return path.split(new RegExp(separators.join('|'), 'g'))[0];
}

function Top10() {
	this.generatorPath = "/static/generator/"
	this.designedPath = "/static/designed/"
}

Top10.prototype.getList = function() {

	top10(function(response) {
		var target = $("#top10_list");
		var tagStr = "";

		var results = response.results;
		results.forEach(function(item, index) {
			tagStr += '<div class="col-md-12">';
			tagStr += '  <div class="x_panel" style="text-align: center; height: 350px;">';
			tagStr += '    <div class="x_title">';
			tagStr += '      <h2>Top '+(index+1)+'.';
			tagStr += '        <small> Design by HighFashion </small>';
			tagStr += '      </h2>';
			tagStr += '      <div class="clearfix"></div>';
			tagStr += '    </div>';
			tagStr += '    <div id="top'+(index+1)+'_image"> </div>';
			tagStr += '    <div class="col-md-10">';
			tagStr += '      <ul id="top'+(index+1)+'_history" class="thumbnails image_picker_selector"> </ul>';
			tagStr += '    </div>';
			tagStr += '  </div>';
			tagStr += '</div>';
		});
		target.html(tagStr);

		results.forEach(function(item, index) {
			var topN = "#top" + (index+1);
			makeFashionHistory(item.history, item.text, $(topN + "_history"));	
			makeFashionGallery({ 
				"results": [{
					"text": item.text, 
					"image": item.image+".png", 
					"like": item.like,
					"filtered": item.filtered
				}] 
				}, [$(topN + "_image"), "_top"]);
		});
	});

}

function Collection() {
	this.designedPath = "/static/designed/"
}

Collection.prototype.wordcloud = function() {	
	getWords(function(response) {
		var wordcloud = $("#wordcloud");
		response.results.forEach(function(item, index) {
			wordcloud.append('<button class="btn btn-round btn-default">' + item + '</button>');
		});
		wordcloud.children().click(function(e) {
			var word = $(this).text();
			containWordImages(word, makeFashionGallery, [$("#collection-fashions"), "_col"]);
		});
	});
}

function StepOne() {
	this.generatorPath = "/static/generator/"
	this.designedPath = "/static/designed/"
}

StepOne.prototype.scatch = function(inputText) {	

	var textValue = ""

	if (inputText == undefined) {
		textValue = $("#step1_input_text").val();
	} else {
		textValue = inputText;
	}

	var generatorPath = this.generatorPath;

	if (textValue == "") {
		alert("Insert Text!");
	} else if (inputTextArr.includes(textValue)) {
		alert("Duplicate Text!");
	} else {
		generateImage(
			{"text": textValue},
			function(response) {
				inputTextArr.push(textValue);
				imagePath = response.results;
				predGender = response.gender;
				predCategory = response.category;

				superResoluteNRImage(imagePath, function(response) {
					var scatchImages = $("#step1_scatch_images");
					scatchImages.append(
						'<option data-img-label="' + textValue +
						'"data-img-src="' + generatorPath + response.results + 
						'" data-img-label="Test" value="' + textValue +
						'" data-img-uid="' + response.results +
						'" data-img-gender="' + predGender +
						'" data-img-category="' + predCategory +
						'" data-img-history="' + splitUid(response.results)+
						'"></option>');	
					scatchImages.imagepicker({
						show_label: true,
						clicked:function(){
							imagePath = $(this).find("option[value='" + $(this).val() + "']").data('img-uid');
							selectedText = imagePath;
							imageHistory = $(this).find("option[value='" + $(this).val() + "']").data('img-history');
							imgHistory = imageHistory;
							designDTO.history_uid = imageHistory;
							textHistory = textValue;
							designDTO.history_text = textValue;
						}
					});
					$(".image_picker_selector img").width("50");
				});

				imageHandler(
					"",
					"POST",
					{
						"uid" : splitUid(imagePath),
						"gender" : predGender.toString(),
						"category" : predCategory.toString(),
						"text" : encodeURIComponent(textValue)
					},
					function(response) {
						imageDTO = response;
					}
				);

			});
	}
}

StepOne.prototype.arithmetic = function(inputText, inputImgHistory) {	

	var textValue = ""

	if (inputText == undefined) {
		textValue = $("#step1_input_text").val();
	} else {
		textValue = inputText;
	}

	var generatorPath = this.generatorPath;

	if (textValue == "") {
		alert("Insert Text!");
	} else if (inputTextArr.includes(textValue)) {
		alert("Duplicate Text!");
	} else {
		arithmeticImage(
			arithmeticDTO,
			function(response) {
				inputTextArr.push(textValue);
				imagePath = response.results;
				predGender = response.gender;
				predCategory = response.category;

				superResoluteNRImage(imagePath, function(response) {
					var scatchImages = $("#step1_scatch_images");
					scatchImages.append(
						'<option data-img-label="' + textValue +
						'"data-img-src="' + generatorPath + response.results + 
						'" data-img-label="Test" value="' + textValue +
						'" data-img-uid="' + response.results +
						'" data-img-gender="' + predGender +
						'" data-img-category="' + predCategory +
						'" data-img-history="' + inputImgHistory+
						'"></option>');	
					scatchImages.imagepicker({
						show_label: true,
						clicked:function(){
							imagePath = $(this).find("option[value='" + $(this).val() + "']").data('img-uid');
							selectedText = imagePath;
							imageHistory = $(this).find("option[value='" + $(this).val() + "']").data('img-history');
							imgHistory = imageHistory;
							designDTO.history_uid = imageHistory;
							textHistory = textValue;
							designDTO.history_text = textValue;

						}
					});
					$(".image_picker_selector img").width("50");
				});
				
			});
	}
}



StepOne.prototype.next = function() {

	designHandler(
		"",
		"POST",
		{
			"uid": splitUid(imagePath),
			"history_uid": designDTO.history_uid,
			"history_text": encodeURIComponent(designDTO.history_text),
			"filterd": false,
			"like": 0
		},
		function(response) {
			designDTO = response;
		}
	);

	var designedPath = this.designedPath
	
	superResoluteX2Image(selectedText, function(response) {
		Caman("#step2_image_canvas", designedPath + response.results, function () {
			this.render();
		});
	});

}

function StepTwo() {
	this.designedPath = "/static/designed/"
}

StepTwo.prototype.progress = function() {
	
}

StepTwo.prototype.next = function() {

	designHandler(
		designDTO.uid,
		"PUT", 
		designDTO,
		function(response) {
			designDTO = response;
		}
	);

	}

function StepThree(nextStep) {

}

StepThree.prototype.desginDetail = function() {

	var designedPath = "/static/designed/";
	
	var big_image = $("#step3_big_image");
	big_image.attr('src', designedPath + selectedText);

	filterRender("#step3_filtered_image", designedPath + selectedText, designDTO.filtered);

	ratio = 100;

	var femaleProgressBar = $("#classify_gender_female");
	femaleProgressBar.progressbar({
		value: predGender[0] * ratio
	});
	var femaleProgressBarValue = femaleProgressBar.find(".ui-progressbar-value");
	femaleProgressBarValue.css({
		"background": '#C08080'
	});
	
	var maleProgressBar = $("#classify_gender_male");
	maleProgressBar.progressbar({
		value: predGender[1] * ratio
	});
	var maleProgressBarValue = maleProgressBar.find(".ui-progressbar-value");
	maleProgressBarValue.css({
		"background": '#438C56'
	});

	var maxValue = Math.max.apply(null, predCategory);
	var myChart = echarts.init(document.getElementById('analysis_raidor_chart'), theme);
	myChart.setOption({
	  tooltip: {
		trigger: 'item',
		formatter: "{a} <br/>{b} : {c} ({d}%)"
	  },
	  calculable: true,
	  polar : [
		{
		  indicator : [
			{text : 'Street', max  : maxValue},
			{text : 'Casual', max  : maxValue},
			{text : 'Classic', max  : maxValue},
			{text : 'Unique', max  : maxValue},
			{text : 'Sexy', max  : maxValue}
		  ],
		  radius : 130
		}
	  ],
	  series: [{
		name: 'Area Mode',
		type: 'radar',
		data: [
		  {
			value : predCategory,
			name : "category"
		  }
		]
	  }]
	});

	makeFashionHistory(designDTO.history_uid, 
						decodeURIComponent(designDTO.history_text), 
						$("#step3_history"));
}

StepThree.prototype.next = function() {
	searchNeighbors(selectedText, makeFashionGallery, [$("#similar-fashions"), "_sim"]);
}

function makeFashionHistory(uidHistory, txtHistory, target) {
	var NOT_ARITHMETIC = 50;
	var liThumnailTag = '<li><div class="thumbnail"><img class="image_picker_image"';

	if (uidHistory.length <= NOT_ARITHMETIC) {
		target.append(liThumnailTag + ' src="static/generator/'+uidHistory+".png" + 
						'" alt="Picture" height="128"><p>'+txtHistory+'</p></div></li>');
	} else {

		var uidSeparators = ['\\\+', '\\\_'];
		var textSeparators = ['\\\+', '\\\-'];
		var uids = uidHistory.split(new RegExp(uidSeparators.join('|'), 'g'));
		var texts = txtHistory.split(new RegExp(textSeparators.join('|'), 'g'));
		var arithmetics = uidHistory.match(new RegExp(uidSeparators.join('|'), 'g'));

		for(var i=0; i<arithmetics.length; i++) {
			target.append(liThumnailTag + ' src="static/generator/'+uids[i]+".png" + 
							'" alt="Picture" height="128"><p>'+texts[i]+'</p></div></li>');
			if (arithmetics[i] == '+') {
				target.append('<li style="padding-top: 55px;"><h1> + </h1></li>');
			} else {
				target.append('<li style="padding-top: 55px;"><h1> - </h1></li>');
			}
		}
		target.append(liThumnailTag + ' src="static/generator/'+uids[arithmetics.length]+".png" + 
						'" alt="Picture" height="128"><p>'+texts[arithmetics.length]+'</p></div></li>');
	}

}

function makeFashionGallery(response, targets) {
	var target = targets[0];
	var from = targets[1];
	target.text("");

	var tagStr = "";
	var results = response.results;

	results.forEach(function(item, index) {
		var uid = splitUid(item.image) + from;
		tagStr += '<div class="col-md-2">';
		tagStr += '  <div class="thumbnail">';
		tagStr += '    <div class="image view view-first">';
		tagStr += '      <canvas id="designed_image_'+ uid +'" style="display: block; margin: 0 auto;"></canvas>';
		tagStr += '      <div class="mask">';
		tagStr += '        <div class="tools tools-bottom">';
		tagStr += '          <p>'+ decodeURIComponent(item.text) +'</p>';
		tagStr += '          <button class="btn btn-round btn-primary" data-img-uid="'+ uid +'">좋아요 '+item.like+'</button>';
		tagStr += '        </div>';
		tagStr += '      </div>';
		tagStr += '    </div>';
		tagStr += '  </div>';
		tagStr += '</div>';
	});
	target.html(tagStr);

	results.forEach(function(item, index) {
		var image = item.image;
		var filter = item.filtered;
		var uid = splitUid(item.image) + from;
		filterRender("#designed_image_"+uid, "/static/designed/" + image, filter);
	});

	target.find('button').click(function(event){
		var uid = splitUid($(this).data('img-uid'));
		designHandler(
			uid,
			"GET",
			{},
			function(response) {
				response.like += 1;
				designHandler(
					uid,
					"PUT",
					response,
					function(response) {
						console.log("Success.");
					}
				);
			}
		);
		var likeText = $(this).text();
		var like = Number(likeText.substring(4, likeText.length));
		$(this).text("좋아요 " + (like+1));
		$(this).removeClass("btn-primary").addClass("btn-dark");
		$(this).unbind();
	});
}

function StepFour(nextStep) {
	
}

StepFour.prototype.progress = function() {
	// ....
}


