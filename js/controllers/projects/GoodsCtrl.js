sdApp.controller('GoodsCtrl', GoodsCtrl)

GoodsCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService', 'SyncService', '$filter', '$ionicPopup', 'SettingService', '$timeout'];

function GoodsCtrl($rootScope, $state, SiteDiaryService, SyncService, $filter, $ionicPopup, SettingService, $timeout) {
	var vm = this;
	vm.go = go;
	vm.deleteEntry = deleteEntry;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.diaryId = sessionStorage.getObject('diaryId');
	
	SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
		vm.create = proj.temp;
		//if create is not loaded correctly, redirect to home and try again
		if (vm.create === null || vm.create === {}) {
			SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
			$state.go('app.home');
			return;
		}
		vm.suppliers = vm.create.goods_received;
	});
	
	function deleteEntry(entry) {
		if (!navigator.onLine) {
			SettingService.show_message_popup('You are offline', "<center>You can remove goods while online.</center>");
			return;
		}
		vm.create.goods_received.forEach(function (el, i) {
			if (el === entry) {
				vm.create.goods_received.splice(i, 1);
			}
		})
		//store the new data in temp SD
		SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
		SiteDiaryService.update_diary(vm.create);
		var seen = sessionStorage.getObject('sd.seen');
		seen.good = true;
		sessionStorage.setObject('sd.seen', seen);
	}
	
	function go(predicate, id) {
		if ((predicate === 'diary') && (vm.diaryId)) {
			$state.go('app.' + predicate, {
				id: vm.diaryId
			});
		} else {
			$state.go('app.' + predicate, {
				id: id
			});
		}
	}
}
