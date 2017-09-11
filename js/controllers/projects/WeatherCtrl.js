sdApp.controller('WeatherCtrl', WeatherCtrl);

WeatherCtrl.$inject = ['$rootScope', '$state', '$scope', 'SettingService', 'SyncService', '$filter'];

function WeatherCtrl($rootScope, $state, $scope, SettingService, SyncService, $filter) {
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

	initFields();
	$scope.$watch(function () {
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
	}];

	function initFields() {
		if (!$rootScope.currentSD) return $state.go('app.home');
		//vm.perfectWeather = $rootScope.currentSD.weather.perfect_weather;
		vm.max_temp = $rootScope.currentSD.weather.max_temp;
		vm.min_temp = $rootScope.currentSD.weather.min_temp;
		angular.forEach($rootScope.currentSD.weather.morning, function (value) {
			vm.local.morning = vm.local.morning + value.name + ', ';
		});
		angular.forEach($rootScope.currentSD.weather.midday, function (value) {
			vm.local.midday = vm.local.midday + value.name + ', ';
		});
		angular.forEach($rootScope.currentSD.weather.afternoon, function (value) {
			vm.local.afternoon = vm.local.afternoon + value.name + ', ';
		});
		angular.forEach($rootScope.currentSD.weather.evening, function (value) {
			vm.local.evening = vm.local.evening + value.name + ', ';
		});
		angular.forEach($rootScope.currentSD.weather.on_and_off, function (value) {
			vm.local.onOff = vm.local.onOff + value.name + ', ';
		});
	}

	function save() {
		delete $rootScope.currentSD.weather.all_day;
		vm.weather = {
			morning: angular.extend([], $rootScope.currentSD.weather.morning, sessionStorage.getObject('sd.diary.weather.morning')),
			midday: angular.extend([], $rootScope.currentSD.weather.midday, sessionStorage.getObject('sd.diary.weather.midday')),
			afternoon: angular.extend([], $rootScope.currentSD.weather.afternoon, sessionStorage.getObject('sd.diary.weather.afternoon')),
			evening: angular.extend([], $rootScope.currentSD.weather.evening, sessionStorage.getObject('sd.diary.weather.evening')),
			perfect_weather: $rootScope.currentSD.weather.perfect_weather,
			min_temp: $rootScope.currentSD.weather.min_temp,
			max_temp: $rootScope.currentSD.weather.max_temp,
			on_and_off: angular.extend([], $rootScope.currentSD.weather.onOff, sessionStorage.getObject('sd.diary.weather.onOff'))
		};
		$rootScope.currentSD.weather = vm.weather;
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
		$("input").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.weather = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}

	watchChanges();
}
