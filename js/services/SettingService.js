sdApp.factory('SettingService', [
	'$http', '$ionicPopup',
	function ($http, $ionicPopup) {
		return {
			get_currency_symbol: function (currency) {
				switch (currency) {
					case 'dolar':
						return '$';
						break;
					case 'euro':
						return '€';
						break;
					case 'pound':
						return '£';
						break;
					default:
						return '£';
				}
			},
			
			show_focus: function () {
				//input fields
				$("input").on('click', function () {
					var el = $(this);
					if (!(el.prop("readonly"))) {
						clearFocus();
						el.prev(".sd-title").addClass("focus");
						el.parent().prev(".sd-title").addClass("focus");
						el.prev(".attach-title").addClass("focus");
						el.addClass("focus");
					}
				});
				
				//textarea fields
				$("textarea").on('click', function () {
					var el = $(this);
					if (!(el.prop("readonly"))) {
						clearFocus();
						el.prev(".sd-title").addClass("focus");
						el.parent().prev(".sd-title").addClass("focus");
						el.prev(".attach-title").addClass("focus");
						el.addClass("focus");
					}
				});
				
				//search popups
				$(".showSearch").on('click', function () {
					var el = $(this);
					clearFocus();
					el.prev(".sd-title").addClass("focus");
					el.children('input').addClass("focus");
				});
				
				//time pickers
				$(".sd-line").on('click', function () {
					var el = $(this);
					clearFocus();
					el.parent().prev().addClass("focus");
					el.addClass("focus");
				});
				
				//select drop-downs
				$('.de-select').on('click', function () {
					var el = $(this);
					clearFocus();
					el.parent().addClass("focus");
					el.parent().prev(".sd-title").addClass("focus");
				});
				
				//checkboxes
				$(".checkbox-calm").on('click', function () {
					var el = $(this);
					clearFocus();
					el.prev().addClass("focus");
					el.addClass("focus");
				});
				
				function clearFocus() {
					$("label.checkbox-calm").removeClass("focus");
					$("label.checkbox-calm").prev().removeClass("focus");
					$(".sd-line.focus").parent().prev().removeClass("focus");
					$(".sd-line.focus").removeClass("focus");
					$('input').prev().removeClass("focus");
					$('input').parent().prev(".sd-title").removeClass("focus");
					$('input').removeClass("focus");
					$('textarea').prev().removeClass("focus");
					$('textarea').parent().prev(".sd-title").removeClass("focus");
					$('textarea').removeClass("focus");
					$('.de-select').parent().removeClass("focus");
					$('.de-select').parent().prev(".sd-title").removeClass("focus");
				}
			},
			
			show_message_popup: function (title, template) {
				var popup = $ionicPopup.alert({
					title: title,
					template: template,
					content: "",
					buttons: [{
						text: 'Ok',
						type: 'button-positive',
						onTap: function (e) {
							popup.close();
						}
					}]
				});
				return popup;
			}
		}
	}
]);
