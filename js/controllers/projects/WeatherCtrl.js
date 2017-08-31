angular.module($APP.name).controller('WeatherCtrl', WeatherCtrl)

WeatherCtrl.$inject = ['$state', '$scope', 'SettingService', '$indexedDB', '$filter'];

function WeatherCtrl($state, $scope, SettingService, $indexedDB, $filter) {
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
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    SettingService.show_message_popup('Debug', '<span>Enter Site Attendance Controller</span>');
    $indexedDB.openStore('projects', function(store) {
        SettingService.show_message_popup('Debug', '<span>Store opened with success. Get data for project ' + sessionStorage.getObject('projectId') + ' for SD ' +
            vm.diaryId + '</span>');
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            SettingService.show_message_popup('Debug', '<span>Temporary SD - Weather - perfect weather: ' + vm.create.weather.perfect_weather +
                '; max temp: ' + vm.create.weather.max_temp + '; min temp: ' + vm.create.weather.min_temp + '</span>');
            //if create is not loaded correctly, redirect to home and try again
            initFields();
        }, function(err) {
            SettingService.show_message_popup('Error', '<span>Project not found: </span>' + sessionStorage.getObject('projectId'));
        });
    });
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
            morning: angular.extend([], vm.create.weather.morning, sessionStorage.getObject('sd.diary.weather.morning')),
            midday: angular.extend([], vm.create.weather.midday, sessionStorage.getObject('sd.diary.weather.midday')),
            afternoon: angular.extend([], vm.create.weather.afternoon, sessionStorage.getObject('sd.diary.weather.afternoon')),
            evening: angular.extend([], vm.create.weather.evening, sessionStorage.getObject('sd.diary.weather.evening')),
            perfect_weather: vm.perfectWeather,
            min_temp: vm.min_temp,
            max_temp: vm.max_temp,
            on_and_off: angular.extend([], vm.create.weather.onOff, sessionStorage.getObject('sd.diary.weather.onOff'))
        }
        vm.create.weather = vm.weather;
        SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
    }

    function initFields() {
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
            var seen = sessionStorage.getObject('sd.seen');
            seen.weather = true;
            sessionStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
