function progress_on(step) {
	progress = step[0]; container = step[1];

	var li = progress.parent();
	li.addClass("current-page");
}

function progress_off(step) {
	progress = step[0]; container = step[1];

	var li = progress.parent();
	li.removeClass("current-page");
}

$( document ).ready(function() {
	console.log( "ready!" );
	
	$("#qs_fullpage").fullpage({
		// Scrolling
		'css3': true,
		'scrollingSpeed': 700,

		// Design
		'verticalCentered': false,
		'sectionsColor': ['#EEEDED', '#DCDCDC', '#EEEDED'],

		// Accessibility
		keyboardScrolling: false,

		// Event
		onLeave: function(index, nextIndex, direction){
			progress_off(qs_ui[index-1]);
			progress_on(qs_ui[nextIndex-1]);
		}
	});

	// Setting
	$.fn.fullpage.setMouseWheelScrolling(false);
	$.fn.fullpage.setAllowScrolling(false);

	var efficiency_ui = [$("#qs_efficiency_progress"), $("#qs_efficiency_container")];
	var activity_ui = [$("#qs_activity_progress"), $("#qs_activity_container")];
	var happiness_ui = [$("#qs_happiness_progress"), $("#qs_happiness_container")];
	var qs_ui = [efficiency_ui, activity_ui, happiness_ui];

	for (var i = 0; i < qs_ui.length; i++) {
		qs_ui[i][0].click(function(e){
			e.preventDefault();
			progressIndex = $(this).attr("tag");
			$.fn.fullpage.moveTo(progressIndex);
		});
	}

	// Init
	var qs_nav = $("#qs_nav");

	qs_nav.click();
	progress_on(efficiency_ui);
	$.fn.fullpage.moveTo(1);

});
