function makeImageList(returnData) {
	
	var target = $("#ImageList");
	target.text("");

	var tagStr = "";
  
	var results = returnData.results;
	var itemLength = results.length;

	if (itemLength != 0) {

		$.each(results, function(i, data) {

			tagStr += "	<tr >";
			tagStr += "		<td>" + data.id + "</td>";
			tagStr += "		<td title='category'>" + data.category + "</td>";
			tagStr += "		<td>" + data.year + "</td>";
			tagStr += "		<td>" + data.sex + "</td>";
			tagStr += "		<td>" + data.age + "</td>";
			tagStr += "		<td title='modality'>" + data.modality + "</td>";
			tagStr += "		<td title='data_source'>" + data.data_source + "</td>";
			tagStr += "		<td title='institution_name'>" + data.institution_name + "</td>";
			if(data.info == undefined)
				tagStr += "		<td>None</td>";
			else
				tagStr += "		<td>" + data.info + "</td>";
			tagStr += "		<td title='original_class'>" + data.original_class + "</td>";
			tagStr += "		<td title='refined_class'>" + data.refined_class + "</td>";
			tagStr += "		<td title='diagnosed_class'>" + data.diagnosed_class + "</td>";
			tagStr += "		<td title='refined_diagnosed_class'>" + data.refined_diagnosed_class + "</td>";
			tagStr += "	</tr>";
		});
	
	} else {
		// 조회된거 없을때의 처리
		tagStr += "		<p>There is no data.</p>";
	}
	target.html(tagStr);
	var targetTds = $("#ImageList td");
	targetTds.mouseenter(showValue);
	
	var target2 = $("#Image_search_count");
	var search_count = returnData.count;
	target2.html("Search Count : " + search_count);

	var next = 1;
	var nextVal = returnData.next;
	var nextBtn = $("#Image_next_btn");
	clickNextPrevButton(nextVal, nextBtn, next);

	var prev = 0;
	var prevVal = returnData.previous;
	var prevBtn = $("#Image_prev_btn");
	clickNextPrevButton(prevVal, prevBtn, prev);

	function clickNextPrevButton(value, btn, direction) {

		btn.unbind("click");
		btn.click(function() {
			if (value === null) {
				if (direction == prev)
					alert("First Page!");
				else if(direction == next)
					alert("Lasst Page!");
			}	
			else {
				var query = value.split('?')[1];
				searchQuery(query);
			}
		});
	}
}

function makeImageCmdList(returnData) {
	var target = $("#Image_download_cmd");
	target.append('<h3> Insert this command in your terminal </h3>');
	target.append('<code>' + returnData.cmd + '</code>');
	
	var loader = $("#Image_download_loader");
	loader.hide();
}

function makeCountList(returnData, target) {
	target.text("");
	target.html(returnData.count);
}

function makeImageSizeList(returnData, target) {
	
	target.attr("image_size", returnData.total_size);
	
	var totalSize = 0;
	totalSize = Math.round(returnData.total_size/100000)/10;
	if (totalSize > 1000) {
		totalSize = Math.round(totalSize/100)/10;
		totalSize += " GB";
	} else {
		totalSize += " MB";
	}
	target.html(totalSize);
}

function makeImageProgressBar(total_size) {
	total_size = parseInt(total_size);
	var ratio = 1000; var step = 100/ratio;
	var performance = 22.5 * ratio;
	// Estimation Value.

	var target = $("#Image_progress_bar"); 
	var history = $("#Image_download_history");
	var cmd = $("#Image_download_cmd");

	var percent = 0.0;
	var compressInterval = setInterval(progress, total_size/performance);
	function progress() {
		if (percent > 99.9) {
			clearInterval(compressInterval);
			history.append("<p> Compress Finish! download start soon. </p>");

			if(!isFinish(cmd)) {
				var loader = $("#Image_download_loader");
				loader.show();
			}

		} else {
			percent += step;
			target.css("width", percent + "%");

			if(isFinish(cmd)) 
				percent = 99.8;
		}
	}

	function isFinish(loading) {
		if (loading.text().length > " ".length)
			return true
		else 
			return false
	}
}

function makeSearchTagList(returnData, target) {

	tagName = $.trim(target.parent().text().toLowerCase());	

	target.text("");
	var tagStr = "";
  
	var results = returnData.results;
	var itemLength = results.length;

	if (itemLength != 0) {
		$.each(results, function(i, data) {
			tagStr += '<button type="button" class="btn btn-default search-tag-' + tagName + '" value="' + data.id + '">' + data.value + '</button>';
		});
	} else {
		//
	}
	target.html(tagStr);
	clickButton(tagName);
}

function makeDashboardList(returnData, target) {

	tagName = $.trim(target.parent().text().toLowerCase());	

	target.text("");
	var tagStr = "";
  
	var results = returnData.results;
	var itemLength = results.length;

	if (itemLength != 0) {
		$.each(results, function(i, data) {
			tagStr += '<li class="list-group-item"><p>' + data.id + ' : ' + data.value + '</p></li>';
		});
	} else {
		//
	}
	target.html(tagStr);
}

function makeYearsList(returnData, target) {
	
	target.text("");
	var tagStr = "";
  
	var results = JSON.parse(returnData.results);
	var itemLength = results.length;

	if (itemLength != 0) {
		$.each(results, function(i, data) {	
			tagStr += '<button type="button" class="btn btn-default search-tag-year" value="'+ data.year +'">' + data.year + '</button>';
		});
	} else {
		//
	}
	target.html(tagStr);
	clickButton("year");
}

function makeRcTemplate(returnData, targets) {

	rcLabels = [
			"결핵(활동성)",
			"활동성미정",
			"결핵의심",
			"결핵(비활동성)",
			"정상",
			"기타",
			"값 없음"
	]

	var results = JSON.parse(returnData.results);
	var itemLength = results.length;

	dataCounts = []
	totalCount = 0

	for (i=0; i<rcLabels.length; i++) {
		if (itemLength != 0) {
			$.each(results, function(j, data) {
				if((i+1) == data.refined_class_id || (i+1) == data.refined_diagnosed_class_id) {
					totalCount += data.count
					dataCounts.push(data.count)
					data.label = rcLabels[i]
				}
			});
		} else {
			//
		}
	}

	returnData.totalCount = totalCount
	returnData.results = results

	var data = {
		labels: rcLabels,
		datasets: [{
			data: dataCounts,
			backgroundColor: [
				"#5A9212",
				"#9B59B6",
				"#755C73",
				"#26B99A",
				"#3498DB",
				"#174102",
				"#BDC3C7"
			],
			hoverBackgroundColor: [
				"#419581",
				"#B370CF",
				"#34495E",
				"#36CAAB",
				"#49A9EA",
				"#140281",
				"#CFD4D8"
			]
		}]
	};

	tableTarget = targets[0];
	chartTarget = targets[1];
	makeRcTableList(returnData, tableTarget);
	makeDonutChart(data, chartTarget); 
}

function makeRcTableList(returnData, target) {

	target.text("");
	var tagStr = "";
  
	var totalCount = returnData.totalCount;
	var results = returnData.results
	var itemLength = results.length;

	if (itemLength != 0) {
		$.each(results, function(i, data) {
			tagStr += '<tr>';
			tagStr += '  <td><p>' + data.label + '</p></td>';
			tagStr += '  <td>' + data.count + '(' + Math.round(data.count*100.0/totalCount) + '%)</td>';
			tagStr += '</tr>';
		});
	} else {
		//
	}
	target.html(tagStr);
}

function makeDonutChart(data, target) {
	Chart.defaults.global.legend = {
      enabled: false
    };

    var canvasDoughnut = new Chart(target, {
      type: 'doughnut',
      tooltipFillColor: "rgba(51, 51, 51, 0.55)",
      data: data
    });
}

function clickButton(tagName) {
	$(".search-tag-"+tagName).prop("searchTag", tagName);
	$(".search-tag-"+tagName).click(function(){
		target = $(this)
		if (isSelected(target)) {
			unSelectedTagButton(target);	
		} else {
			clearAllTagButton(tagName);
			selectedTagButton(target);
		}
		queryStr = getQuerys();
		searchQuery(queryStr);
	});
}

function clearAllTagButton(tagName) {
	unSelectedTagButton($(".search-tag-"+tagName));
}

function isSelected(target) {
	if (target.hasClass("btn-default"))
		return false;
	else
		return true;
}

function selectedTagButton(target) {
	target.removeClass("btn-default").addClass("btn-primary");
}

function getQuerys() {
	queryArr = [];

	var selectedTags = $(".btn-primary").toArray();
	selectedTags.forEach(
		function addQuery(tag) {
			tagName = tag.searchTag;
			value = tag.value;
			queryArr.push(tagName+"="+value);
		}
	);
	return queryArr.join("&");
}

function unSelectedTagButton(target) {
	target.removeClass("btn-primary").addClass("btn-default");
}

function searchQuery(query) {
	var imageSizeTarget = $("#Image_total_size");

	selectImageData(query, makeImageList);
	selectImageSize(query, makeImageSizeList, imageSizeTarget);
}

function showValue() {
	var api = $(this).prop("title");
	var id = $(this).text();	
	var query = "id="+id;

	if(typeof $(this).attr('data_id') === "undefined") {
		if (api != "" && typeof $.isNumeric(id))
			select(api, query, function(returnData, target) {
				var results = returnData.results;
				var id = results[0].id;
				var value = results[0].value;
				target.attr('data_id', id);
				target.attr('data_value', value);

				target.prop("title", value);
		}, $(this));
	} 
}

