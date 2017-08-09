angular.module($APP.name).controller('WeatherCtrl', WeatherCtrl)

WeatherCtrl.$inject = ['$rootScope', '$ionicModal', '$state', '$scope', 'SettingService', '$indexedDB', '$filter', '$ionicPopup'];

function WeatherCtrl($rootScope, $ionicModal, $state, $scope, SettingService, $indexedDB, $filter, $ionicPopup) {
    var vm = this;
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
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    //if create is not loaded correctly, redirect to home and try again
    if (vm.create == null || vm.create == {}) {
        var errPopup = $ionicPopup.show({
            title: "Error",
            template: '<span>An unexpected error occured and Site Diary did not load properly.</span>',
            buttons: [{
                text: 'OK',
                type: 'button-positive',
                onTap: function(e) {
                    errPopup.close();
                }
            }]
        });
        $state.go('app.home');
    }
    vm.editMode = localStorage.getObject('editMode');

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

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
        delete vm.create.weather.all_day
        vm.weather = {
            morning: angular.extend([], vm.create.weather.morning, localStorage.getObject('sd.diary.weather.morning')),
            midday: angular.extend([], vm.create.weather.midday, localStorage.getObject('sd.diary.weather.midday')),
            afternoon: angular.extend([], vm.create.weather.afternoon, localStorage.getObject('sd.diary.weather.afternoon')),
            evening: angular.extend([], vm.create.weather.evening, localStorage.getObject('sd.diary.weather.evening')),
            perfect_weather: vm.perfectWeather,
            min_temp: vm.min_temp,
            max_temp: vm.max_temp,
            on_and_off: angular.extend([], vm.create.weather.onOff, localStorage.getObject('sd.diary.weather.onOff'))
        }
        vm.create.weather = vm.weather;
        localStorage.setObject('sd.diary.create', vm.create);

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            diary.data.weather = vm.weather;
            localStorage.setObject('currentProj', proj);
        }
    }

    if (!vm.diaryId) {
        vm.perfectWeather = vm.create.weather.perfect_weather;
        vm.max_temp = vm.create.weather.max_temp;
        vm.min_temp = vm.create.weather.min_temp;
        angular.forEach(vm.create.weather.morning, function(value) {
            vm.local.morning = vm.local.morning + value.name + ', ';
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

    if (vm.diaryId) {
        vm.perfectWeather = vm.create.weather.perfect_weather;
        vm.max_temp = vm.create.weather.max_temp;
        vm.min_temp = vm.create.weather.min_temp;
        angular.forEach(vm.create.weather.morning, function(value) {
            vm.local.morning = vm.local.morning + value.name + ', ';
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
        save();
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

    function watchChanges() {
        $("input").change(function() {
            var seen = localStorage.getObject('sd.seen');
            seen.weather = true;
            localStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
