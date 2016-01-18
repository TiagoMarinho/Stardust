$(document).on("ready", function () {
	$("div#preferences").hide();
	$("div.pane > input[type='button'].close").on("click", function (e) {
		$(e.currentTarget.parentElement).fadeOut("fast");
		app.paused = false;
	});
	window.addEventListener("keydown", function(e){
		if(e.keyCode === 80 || e.keyCode === 32) {
			$("div#preferences").fadeToggle("fast");
			app.paused = !app.paused;
		}
	});
});
