angular.module($APP.name).factory('SettingService', [
    '$http', '$ionicPopup', '$indexedDB',
    function($http, $ionicPopup, $indexedDB) {
        return {
            clearWeather: function() {
                localStorage.setObject('sd.diary.weather.afternoon', null);
                localStorage.setObject('sd.diary.weather.morning', null);
                localStorage.setObject('sd.diary.weather.onOff', null);
                localStorage.setObject('sd.diary.weather.midday', null);
                localStorage.setObject('sd.diary.weather.evening', null);
                localStorage.setObject('sd.diary.weather.allDay', null);
            },

            get_currency_symbol: function(currency) {
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

            show_focus: function() {
                //input fields
                $("input").on('click', function() {
                    if (!($(this).prop("readonly"))) {
                        clearFocus();
                        $(this).prev(".sd-title").addClass("focus");
                        $(this).parent().prev(".sd-title").addClass("focus");
                        $(this).addClass("focus");
                    }
                })

                //textarea fields
                $("textarea").on('click', function() {
                    if (!($(this).prop("readonly"))) {
                        clearFocus();
                        $(this).prev(".sd-title").addClass("focus");
                        $(this).parent().prev(".sd-title").addClass("focus");
                        $(this).addClass("focus");
                    }
                })

                //search popups
                $(".showSearch").on('click', function() {
                    clearFocus();
                    $(this).prev(".sd-title").addClass("focus");
                    $(this).children('input').addClass("focus");
                })

                //time pickers
                $(".sd-line").on('click', function() {
                    clearFocus();
                    $(this).parent().prev().addClass("focus");
                    $(this).addClass("focus");
                })

                //select drop-downs
                $('.de-select').on('click', function() {
                    clearFocus();
                    $(this).parent().addClass("focus");
                    $(this).parent().prev(".sd-title").addClass("focus");
                })

                //checkboxes
                $(".checkbox-calm").on('click', function() {
                    clearFocus();
                    $(this).prev().addClass("focus");
                    $(this).addClass("focus");
                })

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

            show_message_popup: function(title, template) {
                var popup = $ionicPopup.alert({
                    title: title,
                    template: template,
                    content: "",
                    buttons: [{
                        text: 'Ok',
                        type: 'button-positive',
                        onTap: function(e) {
                            popup.close();
                        }
                    }]
                });
                return popup;
            },

            update_temp_sd: function(projId, temp) {
                $indexedDB.openStore('projects', function(store) {
                    store.find(projId).then(function(proj) {
                        proj.temp = temp;
                        store.upsert(proj).then(
                            function(e) {},
                            function(err) {}
                        )
                    });
                });
            }
        }
    }
]);
