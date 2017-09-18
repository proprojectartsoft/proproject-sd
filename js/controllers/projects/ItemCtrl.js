sdApp.controller('ItemCtrl', ItemCtrl)

ItemCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$filter', '$state', '$stateParams', 'SettingService', 'SyncService'];

function ItemCtrl($rootScope, $scope, $ionicModal, $filter, $state, $stateParams, SettingService, SyncService) {
	var vm = this;
	vm.go = go;
	vm.showSearch = showSearch;
	vm.showSearchUnit = showSearchUnit;
	vm.backSearch = backSearch;
	vm.addGood = addGood;
	vm.addNewGood = addNewGood;
	vm.addUnit = addUnit;
	vm.datetimeChanged = datetimeChanged;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.local = {};
	vm.local.data = {};
	vm.id = $stateParams.id;
	vm.index = $stateParams.index;
	vm.newGood = '';
	vm.local.search = '';
	vm.data = {};
	vm.settings = '';
	vm.supplier = $stateParams.id;
	vm.goods = $rootScope.resources;
	vm.goods.sort(function (a, b) {
		var textA = a.name.toUpperCase();
		var textB = b.name.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	vm.units = $rootScope.units;
	initFields();
	
	$ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (popover) {
		vm.searchModal = popover;
	});
	
	$ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (popover) {
		vm.searchModal = popover;
		vm.searchUnit = popover;
	});
	
	$scope.$watch(function () {
		if (vm.editMode)
			SettingService.show_focus();
	});
	//initialize data for item's fields
	function initFields() {
		if (vm.index !== 'create') {
			vm.local.data = {
				good_name: $rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].details,
				good_unit: $rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].unit_name,
				qty: $rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].quantity,
				on_hire: $rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].on_hire,
				off_hire: $rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].off_hire,
				offHireAsString: $filter('date')($rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].off_hire, "dd/MM/yyyy"),
				onHireAsString: $filter('date')($rootScope.currentSD.goods_received[vm.id].goods_details[vm.index].on_hire, "dd/MM/yyyy")
			};
		}
	}
	
	function showSearch() {
		vm.settings = 'goods';
		vm.searchModal.show();
	}
	
	function showSearchUnit() {
		vm.settings = 'units';
		vm.searchUnit.show();
	}
	
	function backSearch() {
		vm.searchModal.hide();
		vm.searchUnit.hide();
	}
	
	function addGood(item) {
		vm.local.data.good_name = item.name;
		vm.local.data.good_id = item.id;
		vm.local.data.good_unit = item.unit_name;
		vm.searchModal.hide();
	}
	
	function addNewGood() {
		vm.local.data.good_name = vm.newGood;
		vm.searchModal.hide();
	}
	
	function addUnit(item) {
		vm.local.data.unit_id = item.id;
		vm.local.data.good_unit = item.name;
		vm.searchUnit.hide();
	}
	
	function saveItem() {
		vm.item = {
			details: vm.local.data.good_name,
			unit_name: vm.local.data.good_unit,
			unit_id: vm.local.data.good_id,
			quantity: vm.local.data.qty,
			on_hire: vm.local.data.on_hire,
			off_hire: vm.local.data.off_hire,
			onHireAsString: $filter('date')(vm.local.data.on_hire, "dd/MM/yyyy"),
			offHireAsString: $filter('date')(vm.local.data.off_hire, "dd/MM/yyyy")
		};
		if (vm.index === 'create') {
			if (!$rootScope.currentSD.goods_received[vm.supplier].goods_details || !$rootScope.currentSD.goods_received[vm.supplier].goods_details.length) {
				$rootScope.currentSD.goods_received[vm.supplier].goods_details = [];
			}
			$rootScope.currentSD.goods_received[vm.supplier].goods_details.push(vm.item);
		} else {
			if ($rootScope.currentSD.goods_received[vm.supplier].goods_details)
				$rootScope.currentSD.goods_received[vm.supplier].goods_details[vm.index] = vm.item;
		}
	}
	
	function go(predicate, id) {
		saveItem();
		$state.go('app.' + predicate, {
			id: id
		});
	}
	
	function datetimeChanged() {
		//TODO: remove
	}
}
