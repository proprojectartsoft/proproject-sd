angular.module($APP.name).factory('SettingService', [
    '$http',
    function($http) {
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
            }
        }
    }
]);
