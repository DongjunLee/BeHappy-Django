var canvas_id = '#step2_image_canvas'

var filterBtnArr = [
	$('#reset-btn'),
	$('#vintage-btn'), $('#lomo-btn'), $('#clarity-btn'), $('#sincity-btn'),
	$('#sunrise-btn'), $('#crossprocess-btn'), $('#orangepeel-btn'), $('#grungy-btn'),
	$('#jarques-btn'), $('#oldboot-btn'), $('#glowingsun-btn'), $('#hazydays-btn'),
	$('#nostalgia-btn'), $('#hemingway-btn'), $('#concentrate-btn'), $('#heymajesty-btn')]

filterBtnArr.forEach(function(btn, index) {
	btn.click(function() {
		var preset = $(this).data('preset');
		filterRenderAndSave(preset);
	});
});

function filterRenderAndSave(preset) {
	Caman(canvas_id, function () {
		this.revert();
		this[preset]();
		this.render();

		designDTO.filtered = preset;
	});
}

function filterRender(target, image, preset) {
	Caman(target, image, function () {
		this[preset]();
		this.render();
	});
}
