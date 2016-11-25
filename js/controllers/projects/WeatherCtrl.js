angular.module($APP.name).controller('WeatherCtrl', WeatherCtrl)

WeatherCtrl.$inject = ['$rootScope', '$ionicModal', '$state'];

function WeatherCtrl($rootScope, $ionicModal, $state) {
    var vm = this;
    vm.save = save;
    vm.go = go;
    vm.local = {};
    vm.local.data = {};
    vm.morning = 'weather.morning';
    vm.midday = 'weather.midday';
    vm.afternoon = 'weather.afternoon';
    vm.evening = 'weather.evening';
    vm.onOff = 'weather.onOff';
    vm.allDay = 'weather.allDay';
    vm.local.morning = '';
    vm.local.midday = '';
    vm.local.afternoon = '';
    vm.local.evening = '';
    vm.local.onOff = '';
    vm.perfectWeather = false;
    vm.min_temp = '';
    vm.max_temp = '';
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.editMode = localStorage.getObject('editMode');

    vm.deOptions = [{
        id: 0,
        name: 'Sunny'
    }, {
        id: 1,
        name: 'Cloudy/Overcast'
    }, {
        id: 2,
        name: 'Windy'
    }, {
        id: 3,
        name: 'Rain'
    }, {
        id: 4,
        name: 'Hail'
    }, {
        id: 5,
        name: 'Ice/Frost'
    }, {
        id: 6,
        name: 'Snow'
    }, {
        id: 7,
        name: 'Extreme Heat'
    }, {
        id: 8,
        name: 'Extreme Cold'
    }]

    function save() {
        vm.weather = {
            morning: localStorage.getObject('sd.diary.weather.morning'),
            midday: localStorage.getObject('sd.diary.weather.midday'),
            afternoon: localStorage.getObject('sd.diary.weather.afternoon'),
            evening: localStorage.getObject('sd.diary.weather.evening'),
            perfect_weather: vm.perfectWeather,
            min_temp: vm.min_temp,
            max_temp: vm.max_temp,
            on_and_off: localStorage.getObject('sd.diary.weather.onOff')
        }
        vm.create.weather = vm.weather;
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('diary');
    }

    if (vm.diaryId) {
        vm.perfectWeather = vm.create.weather.perfect_weather;

        vm.max_temp = vm.create.weather.max_temp;
        vm.min_temp = vm.create.weather.min_temp;
        angular.forEach(vm.create.weather.morning, function(value) {
            vm.local.morning = vm.local.morning  + value.name + ', ';
        })
        angular.forEach(vm.create.weather.midday, function(value) {
            vm.local.midday = vm.local.midday + value.name + ', ';
        })
        angular.forEach(vm.create.weather.afternoon, function(value) {
            vm.local.afternoon = vm.local.afternoon + value.name + ', ';
        })
        angular.forEach(vm.create.weather.evening, function(value) {
            vm.local.evening = vm.local.evening + value.name + ', ';
        })
        angular.forEach(vm.create.weather.on_and_off, function(value) {
            vm.local.onOff = vm.local.onOff + value.name + ', ';
        })
    }

    function go(predicate, id) {
        if (predicate === 'diary') {

            if (vm.diaryId) {
                $state.go('app.' + predicate, {
                    id: vm.diaryId
                });
            } else {
                $state.go('app.' + predicate);
            }
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }
}
