function initButton() {
	$("#step1_image_plus").removeClass('clicked');
	$("#step1_image_minus").removeClass('clicked');
}

var step1ImagePicker = "#step1_container .image_picker_selector";

var step1PlusBtn = $("#step1_image_plus");
step1PlusBtn.click(function(event) {

	$(this).toggleClass('clicked');

	function dropPlus( event, ui ) {
		var draggable = ui.draggable;
		
		$(this).hide("slow");
		$(draggable).hide("slow");
		
		var dragText = $(draggable).find("p").text();
		var dropText = $(this).find("p").text();
		
		var scatchImages = $("#step1_scatch_images");
		var dragImageUid = scatchImages.find("option[value='" + dragText + "']").data('img-history');
		var dropImageUid = scatchImages.find("option[value='" + dropText + "']").data('img-history');
		
		textValue = dropText + " + " + dragText;

		textHistory = textValue;
		imgHistory = dropImageUid + "+" + dragImageUid;

		arithmeticDTO.drop = dropImageUid;
		arithmeticDTO.drag = dragImageUid;
		arithmeticDTO.equation = "plus";

		var Step1 = new StepOne();
		Step1.arithmetic(textValue, imgHistory);

		$("#step1_scatch_images").children().each(function(index) {
			optionVal = $(this).val();
			if ((optionVal == dragText) || (optionVal == dropText)) {
				$(this).remove();
			}
		});


		initButton();
	}

	$(step1ImagePicker + " div").draggable( {
		cursor: 'move',
		containment: step1ImagePicker,
		stack: step1ImagePicker + ' div',
		revert: true
	});
	
	$(step1ImagePicker + " div").droppable( {
		accept: step1ImagePicker + ' div',
		hoverClass: 'hovered',
		drop: dropPlus
	});

});

var step1MinusBtn = $("#step1_image_minus");
step1MinusBtn.click(function(event) {

	$(this).toggleClass('clicked');

	function dropMinus( event, ui ) {
		var draggable = ui.draggable;
		
		$(this).hide("slow");
		$(draggable).hide("slow");
		
		var dragText = $(draggable).find("p").text();
		var dropText = $(this).find("p").text();
		
		var scatchImages = $("#step1_scatch_images");
		var dragImageUid = scatchImages.find("option[value='" + dragText + "']").data('img-history');
		var dropImageUid = scatchImages.find("option[value='" + dropText + "']").data('img-history');
		
		textValue = dropText + " - " + dragText;

		textHistory = textValue;
		imgHistory = dropImageUid + "_" + dragImageUid;
		
		arithmeticDTO.drop = dropImageUid;
		arithmeticDTO.drag = dragImageUid;
		arithmeticDTO.equation = "minus";

		var Step1 = new StepOne();
		Step1.arithmetic(textValue, imgHistory);

		$("#step1_scatch_images").children().each(function(index) {
			optionVal = $(this).val();
			if ((optionVal == dragText) || (optionVal == dropText)) {
				$(this).remove();
			}
		});

		initButton();
	}

	$(step1ImagePicker + ' div').draggable( {
		cursor: 'move',
		containment: step1ImagePicker,
		stack: step1ImagePicker + ' div',
		revert: true
	});
	
	$(step1ImagePicker + ' div').droppable( {
		accept: step1ImagePicker + ' div',
		hoverClass: 'hovered',
		drop: dropMinus
	});;

});

