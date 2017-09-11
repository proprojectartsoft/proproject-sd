sdApp.controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', 'SettingService', '$stateParams', '$ionicPopup', 'SyncService'];

function SupplierCtrl($rootScope, $scope, $state, $filter, SettingService, $stateParams, $ionicPopup, SyncService) {
	var vm = this;
	vm.go = go;
	vm.local = {}
	vm.suppNo = 0;
	vm.index = $stateParams.id;

	$scope.$watch(function () {
		SettingService.show_focus();
	});

	// function addSupplier() {
	// 	SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
	// 		$rootScope.currentSD = proj.temp;
	//
	// 		//store the new data in temp SD
	// 		SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
	// 	});
	// }
	// initFields();

	function initFields(){
		//if create is not loaded correctly, redirect to home and try again
		if ($rootScope.currentSD === null || $rootScope.currentSD === {}) {
			SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
			$state.go('app.home');
			return;
		}
		//initialize the data for a new supplier
		vm.supplier = {
			grn_ref: vm.local.refference,
			supplier: vm.local.supplier_name,
			goods_details: []
		};
		$rootScope.currentSD.goods_received.push(vm.supplier);
		vm.suppNo = $rootScope.currentSD.goods_received.length - 1;
		if (vm.index === 'create' || vm.index === 0) {
			//add a new supplier
			$rootScope.currentSD.goods_received.push(vm.supplier);
			var seen = sessionStorage.getObject('sd.seen');
			seen.good = true;
			sessionStorage.setObject('sd.seen', seen);
		} else {
			//add goods for an existing supplier
			$rootScope.currentSD.goods_received[vm.suppNo] = vm.supplier;
		}
	}

	function go(predicate) {
		// addSupplier();
		initFields();
		SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
			var test = proj.temp;
			$state.go('app.' + predicate, {
				id: vm.suppNo,
				index: 'create'
			});
		});

	}
}
