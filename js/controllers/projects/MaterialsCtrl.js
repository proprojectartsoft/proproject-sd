sdApp.controller('MaterialsCtrl', MaterialsCtrl)

MaterialsCtrl.$inject = ['$state', '$scope', '$ionicModal', '$stateParams', 'SiteDiaryService', 'SettingService', '$filter', 'SyncService', '$rootScope', '$ionicPopup'];

function MaterialsCtrl($state, $scope, $ionicModal, $stateParams, SiteDiaryService, SettingService, $filter, SyncService, $rootScope, $ionicPopup) {
	var vm = this;
	vm.go = go;
	vm.unit = "materials.unit";
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.showSearch = showSearch;
	vm.showSearchUnit = showSearchUnit;
	vm.backSearch = backSearch;
	vm.addGood = addGood;
	vm.addNewGood = addNewGood;
	vm.addUnit = addUnit;
	vm.deleteEntry = deleteEntry;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.index = $stateParams.id;
	vm.local = {};
	vm.local.search = '';
	vm.settings = '';
	vm.material = {};
	vm.total_formated = '';
	vm.subtotal_formated = '';
	vm.newGood = '';

	//get necessary settings for company
	SyncService.getSettings('resources', function (list) {
		vm.goods = list.value;
		vm.goods.sort(function (a, b) {
			var textA = a.name.toUpperCase();
			var textB = b.name.toUpperCase();
			return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
		});
	});
	SyncService.getSettings('units', function (list) {
		vm.units = list.value;
	});
	SyncService.getSettings('currency', function (list) {
		if (list && list.value) {
			vm.currency = SettingService.get_currency_symbol(list.value);
		} else {
			vm.currency = SettingService.get_currency_symbol("dolar");
		}
	});
	initFields()
	// //get projects
	// SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
	// 	vm.create = proj.temp;
	// 	//if create is not loaded correctly, redirect to home and try again
	// 	if (vm.create === null || vm.create === {}) {
	// 		SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
	// 		$state.go('app.home');
	// 		return;
	// 	}
	// 	initFields();
	// });

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

	$scope.$watch(function () {
		var t = (vm.material.quantity * vm.material.unitCost) + ((vm.material.quantity * vm.material.unitCost) * (vm.material.tax / 100));
		var st = vm.material.quantity * vm.material.unitCost;
		if (t !== 0 && !isNaN(t))
			vm.total_formated = vm.currency + " " + $filter('number')(t, 2);
		else
			vm.total_formated = '';
		if (st !== 0 && !isNaN(st))
			vm.subtotal_formated = vm.currency + " " + $filter('number')(st, 2);
		else
			vm.subtotal_formated = '';
	});

	function initFields() {
		if (!isNaN(vm.index) && (vm.index !== 'create')) {
			vm.material = {
				name: $rootScope.currentSD.plant_and_material_used[vm.index].name,
				description: $rootScope.currentSD.plant_and_material_used[vm.index].description,
				unitCost: $rootScope.currentSD.plant_and_material_used[vm.index].cost_per_unit,
				unit_id: $rootScope.currentSD.plant_and_material_used[vm.index].unit_id,
				unit_name: $rootScope.currentSD.plant_and_material_used[vm.index].unit_name,
				quantity: $rootScope.currentSD.plant_and_material_used[vm.index].quantity,
				tax: $rootScope.currentSD.plant_and_material_used[vm.index].tax,
				tax_formated: $rootScope.currentSD.plant_and_material_used[vm.index].tax && ($rootScope.currentSD.plant_and_material_used[vm.index].tax + " %") || '',
				unitCost_formated: $rootScope.currentSD.plant_and_material_used[vm.index].cost_per_unit && (vm.currency + " " + $filter('number')($rootScope.currentSD.plant_and_material_used[vm.index].cost_per_unit, 2)) || ''
			};
		}
		vm.materials = $rootScope.currentSD.plant_and_material_used;
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
		vm.material.name = item.name;
		vm.material.unit_name = item.unit_name;
		vm.material.unitCost = item.direct_cost;
		vm.material.tax = item.vat;
		vm.material.tax_formated = vm.material.tax + " %";
		vm.searchModal.hide();
		var seen = sessionStorage.getObject('sd.seen');
		seen.material = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function addNewGood() {
		vm.material.name = vm.newGood;
		vm.searchModal.hide();
		var seen = sessionStorage.getObject('sd.seen');
		seen.material = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function addUnit(item) {
		vm.material.unit_id = item.id;
		vm.material.unit_name = item.name;
		vm.searchUnit.hide();
		var seen = sessionStorage.getObject('sd.seen');
		seen.material = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function save() {
		vm.material = {
			name: vm.material.name,
			description: vm.material.description,
			cost_per_unit: vm.material.unitCost,
			quantity: vm.material.quantity,
			unit_id: vm.material.unit_id,
			unit_name: vm.material.unit_name,
			subtotal: vm.material.quantity * vm.material.unitCost,
			tax: vm.material.tax,
			total: (vm.material.quantity * vm.material.unitCost) + ((vm.material.quantity * vm.material.unitCost) * (vm.material.tax / 100))
		}
		if (vm.index === 'create') {
			$rootScope.currentSD.plant_and_material_used.push(vm.material);
			var seen = sessionStorage.getObject('sd.seen');
			seen.material = true;
			sessionStorage.setObject('sd.seen', seen);
		} else {
			$rootScope.currentSD.plant_and_material_used[vm.index] = vm.material
		}
		vm.materials = $rootScope.currentSD.plant_and_material_used;
		//store the new data in temp SD
		// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
	}

	function deleteEntry(entry) {
		if (!navigator.onLine) {
			SettingService.show_message_popup('You are offline', "<center>You can remove materials while online.</center>");
			return;
		}
		$('.item-content').css('transform', '');
		$rootScope.currentSD.plant_and_material_used.forEach(function (el, i) {
			if (el === entry) {
				$rootScope.currentSD.plant_and_material_used.splice(i, 1);
			}
		})
		//store the new data in temp SD
		// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
		SiteDiaryService.update_diary($rootScope.currentSD);
		var seen = sessionStorage.getObject('sd.seen');
		seen.material = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function go(predicate, id) {
		if (predicate == "materials" && vm.material.name) {
			save();
		}
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

	function watchChanges() {
		$("input").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.material = true;
			sessionStorage.setObject('sd.seen', seen);
		});
		$("textarea").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.material = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}

	watchChanges();
}
