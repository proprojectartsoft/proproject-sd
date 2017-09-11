sdApp.controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$state', 'SettingService', '$scope', '$rootScope', 'SyncService', '$stateParams'];

function VisitorsCtrl($state, SettingService, $scope, $rootScope, SyncService, $stateParams) {
	var vm = this;
	vm.go = go;
	vm.local = {};
	vm.local.data = {};
	vm.data = {};
	vm.index = $stateParams.id;
	// SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
	// 	vm.create = proj.temp;
	// 	//if create is not loaded correctly, redirect to home and try again
	// 	if (vm.create == null || vm.create == {}) {
	// 		SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
	// 		$state.go('app.home');
	// 		return;
	// 	}
	// });

	$scope.$watch(function () {
		SettingService.show_focus();
	});

	function save() {
		vm.member = {
			first_name: vm.local.data.first_name,
			last_name: vm.local.data.last_name,
			note: vm.local.data.note
		}
		//Visitor add when index = create; update otherwise
		if (vm.index === 'create') {
			$rootScope.currentSD.site_attendance.visitors.push(vm.member);
			var seen = sessionStorage.getObject('sd.seen');
			seen.visitor = true;
			sessionStorage.setObject('sd.seen', seen);
		} else {
			$rootScope.currentSD.site_attendance.visitors[vm.index] = vm.member;
		}
		//store the new data in temp SD
		// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
	}

	function go(predicate, id) {
		if (vm.local.data.first_name) {
			save();
		}
		sessionStorage.setObject('siteAttendance.tab', 'visitors');
		$state.go('app.' + predicate, {
			id: id
		});
	}

	function watchChanges() {
		$("input").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.visitor = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}

	watchChanges();
}
