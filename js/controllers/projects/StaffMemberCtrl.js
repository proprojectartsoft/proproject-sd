sdApp.controller('StaffMemberCtrl', StaffMemberCtrl);

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', '$ionicModal',
	'$stateParams', '$timeout', 'SettingService'];

function StaffMemberCtrl($rootScope, $scope, $state, $filter, $ionicModal,
                         $stateParams, $timeout, SettingService) {
	var vm = this;
	vm.go = go;
	vm.showSearch = showSearch;
	vm.backSearch = backSearch;
	vm.addStaff = addStaff;
	vm.calcParse = calcParse;
	vm.calcTime = calcTime;
	vm.stringToDate = stringToDate;
	vm.addNewName = addNewName;
	vm.addStaff1 = addStaff1;
	vm.allowNumbersOnly = allowNumbersOnly;
	vm.datetimeChanged = datetimeChanged;
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.editMode = sessionStorage.getObject('editMode');
	vm.local = {};
	vm.currentStaff = {};
	vm.local.search = '';
	vm.data = {};
	vm.settings = 'staff';
	vm.local.absence = 'absence';
	vm.index = $stateParams.id;
	vm.newName = '';
	vm.absence = $rootScope.absence;
	vm.staff = $rootScope.staff;
	vm.currency = SettingService.get_currency_symbol($rootScope.currency || "dolar");
	var startT = $rootScope.start || "08:00";
	var finishT = $rootScope.finish || "12:00";
	var breakT = $rootScope.break || "00:30";
	initFields();

	$scope.$watch(function () {
		if (vm.editMode)
			SettingService.show_focus();
	});
	$ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (popover) {
		vm.searchModal = popover;
	});

	function initFields() {
		if ((!(vm.diaryId === false) && !(vm.index === 'create')) || !(isNaN(vm.index))) {
			vm.currentStaff = angular.copy($rootScope.currentSD.site_attendance.staffs[vm.index]);
			vm.currentStaff.staff_name = vm.currentStaff.first_name +
				(vm.currentStaff.last_name && vm.currentStaff.last_name !== null ?
					(" " + vm.currentStaff.last_name) :
					"");
			vm.currentStaff.role = vm.currentStaff.trade;
			vm.currentStaff.model_start = vm.stringToDate(vm.currentStaff.start_time);
			vm.currentStaff.model_finish = vm.stringToDate(vm.currentStaff.finish_time);
			vm.currentStaff.total_time = vm.stringToDate(vm.currentStaff.total_time);
			vm.currentStaff.model_break = vm.stringToDate(vm.currentStaff.break_time);
			vm.currentStaff.absence = vm.currentStaff.absence && vm.currentStaff.absence.reason;
			vm.currentStaff.hourly_rate_formated = vm.currentStaff.hourly_rate && (vm.currency + " " + vm.currentStaff.hourly_rate) || '';
			if (!vm.currentStaff.total_time) vm.calcParse();
		} else {
			vm.currentStaff.staff_name = "";
			vm.currentStaff.model_break = breakT;
			vm.currentStaff.model_start = vm.stringToDate(startT);
			vm.currentStaff.model_finish = vm.stringToDate(finishT);
			if (!vm.currentStaff.total_time) vm.calcParse();
		}
	}

	function allowNumbersOnly() {
		var watchOnce = $scope.$watch(function () {
			$timeout(function () {
				$('.ion-datetime-picker input').each(function () {
					var el = $(this);
					el.change(function () {
						console.log("change");
					});
					el.prop('type', 'tel');
					el.on('input', function () {
						if (!this.value) {
							el.val(0);
							el.blur();
							el.focus();
						}
					})
				});
				watchOnce();
			}, 10);
		})
	}

	function showSearch() {
		vm.searchModal.show();
	}

	function backSearch() {
		vm.searchModal.hide();
	}

	function addNewName() {
		vm.currentStaff.staff_name = vm.newName;
		calcParse();
		vm.searchModal.hide();
	}

	function addStaff(item) {
		vm.currentStaff.role = item.role;
		vm.currentStaff.trade = item.role;
		vm.currentStaff.staff_name = item.name;
		vm.currentStaff.staff_id = item.id;
		vm.currentStaff.hourly_rate = item.direct_cost;
		vm.currentStaff.company_name = item.employee_name;
		calcParse();
		vm.searchModal.hide();
	}

	function addStaff1(item) {
		vm.currentStaff.staff_name = item;
		vm.searchModal.hide();
	}

	function save() {
		var member = {
			first_name: vm.currentStaff.staff_name.split(" ", 2)[0],
			last_name: vm.currentStaff.staff_name.split(" ", 2)[1],
			company_name: vm.currentStaff.company_name,
			trade: vm.currentStaff.role,
			hourly_rate: vm.currentStaff.hourly_rate,
			start_time: $filter('date')(vm.currentStaff.model_start, "HH:mm"),
			break_time: $filter('date')(vm.currentStaff.model_break, "HH:mm"),
			finish_time: $filter('date')(vm.currentStaff.model_finish, "HH:mm"),
			total_time: $filter('date')(vm.currentStaff.total_time, "HH:mm"),
			absence: sessionStorage.getObject('sd.diary.absence') && sessionStorage.getObject('sd.diary.absence')[0],
			note: vm.currentStaff.note
		};
		//Staff add when index = create; update otherwise
		if (vm.index === 'create') {
			$rootScope.currentSD.site_attendance.staffs.push(member);
		} else {
			//if no absence selected on last edit, keep the old value
			member.absence = member.absence || $rootScope.currentSD.site_attendance.staffs[vm.index].absence;
			$rootScope.currentSD.site_attendance.staffs[vm.index] = member;
		}
		sessionStorage.setObject('sd.diary.absence', null);
	}

	function stringToDate(string) {
		if (string) {
			var aux = string.split(":");
			var date = new Date();
			var hh = aux[0];
			var mm = aux[1];
			date.setMinutes(mm);
			date.setHours(hh);
		}
		return date;
	}

	function calcParse() {
		if (vm.currentStaff.model_start && vm.currentStaff.model_break && vm.currentStaff.model_finish) {
			vm.filteredBreak = $filter('date')(vm.currentStaff.model_break, "HH:mm");
			vm.filteredStart = $filter('date')(vm.currentStaff.model_start, "HH:mm");
			vm.filteredFinish = $filter('date')(vm.currentStaff.model_finish, "HH:mm");
			vm.currentStaff.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
		}
	}

	function calcTime(start, finish, breakTime) {
		var hhmm = '';
		var stringBreak = breakTime.split(":");
		var stringStart = start.split(":");
		var stringFinish = finish.split(":");
		var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));
		var hh = Math.floor(totalTime / 60);
		var mm = Math.abs(totalTime % 60);
		hhmm = hh + ':';
		if (mm < 10) {
			hhmm = hhmm + '0' + mm;
		} else {
			hhmm = hhmm + mm;
		}
		return hhmm;
	}

	function go(predicate, id) {
		if (vm.currentStaff.staff_name) {
			save();
		}
		$rootScope.go('app.' + predicate, {
			id: id
		});
	}

	function datetimeChanged() {
		vm.calcParse();
	}
}
