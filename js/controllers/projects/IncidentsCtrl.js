sdApp.controller('IncidentsCtrl', IncidentsCtrl)

IncidentsCtrl.$inject = ['$scope', '$state', '$ionicModal', '$stateParams', 'SiteDiaryService', 'SettingService', '$filter', 'SyncService', '$rootScope', '$ionicPopup'];

function IncidentsCtrl($scope, $state, $ionicModal, $stateParams, SiteDiaryService, SettingService, $filter, SyncService, $rootScope, $ionicPopup) {
	var vm = this;
	vm.showSearchUnit = showSearchUnit;
	vm.backSearch = backSearch;
	vm.addUnit = addUnit;
	vm.go = go;
	vm.deleteEntry = deleteEntry;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.local = {};
	vm.index = $stateParams.id;
	vm.actionReq = 'incident.actionReq';
	vm.type = 'incident.type';
	vm.units = 'incident.units';
	vm.diaryId = sessionStorage.getObject('diaryId');

	SyncService.getSettings('units', function (list) {
		vm.units = list.value;
	});

	$ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function (popover) {
		vm.searchModal = popover;
		vm.searchUnit = popover;
	});

	initFields();

	function initFields(){
		if (!isNaN(vm.index)) {
			vm.incident = {
				description: $rootScope.currentSD.incidents[vm.index].description,
				quantity: $rootScope.currentSD.incidents[vm.index].quantity,
				unit_name: $rootScope.currentSD.incidents[vm.index].unit_name,
				action_required: $rootScope.currentSD.incidents[vm.index].action_required,
				type: $rootScope.currentSD.incidents[vm.index].type,
				unit_id: $rootScope.currentSD.incidents[vm.index].unit_id
			};
			vm.local.unit_name = vm.incident.unit_name;
		}
		vm.incidents = $rootScope.currentSD.incidents;
	}

	// SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
	// 	$rootScope.currentSD = proj.temp;
	// 	//if create is not loaded correctly, redirect to home and try again
	// 	if ($rootScope.currentSD === null || $rootScope.currentSD === {}) {
	// 		SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
	// 		$state.go('app.home');
	// 		return;
	// 	}
	// 	vm.incidents = $rootScope.currentSD.incidents;
	// 	//initialize a new incident
	// 	if (!isNaN(vm.index)) {
	// 		vm.incident = {
	// 			description: $rootScope.currentSD.incidents[vm.index].description,
	// 			quantity: $rootScope.currentSD.incidents[vm.index].quantity,
	// 			unit_name: $rootScope.currentSD.incidents[vm.index].unit_name,
	// 			action_required: $rootScope.currentSD.incidents[vm.index].action_required,
	// 			type: $rootScope.currentSD.incidents[vm.index].type,
	// 			unit_id: $rootScope.currentSD.incidents[vm.index].unit_id
	// 		};
	// 		vm.local.unit_name = vm.incident.unit_name;
	// 	}
	// });
	$scope.$watch(function () {
		if (vm.editMode)
			SettingService.show_focus();
	});

	vm.local.type = [{ //TODO: retrieve from DB/localStorage
		id: 0,
		name: 'Incident'
	}, {
		id: 1,
		name: 'Accident'
	}, {
		id: 2,
		name: 'Non conformance'
	}];

	vm.actions = [{
		id: 0,
		name: 'Raise NCR'
	}, {
		id: 1,
		name: 'Raise incident report'
	}, {
		id: 2,
		name: 'Raise accident report'
	}, {
		id: 3,
		name: 'Other'
	}];

	function showSearchUnit() {
		vm.settings = 'units';
		vm.searchUnit.show();
	}

	function backSearch() {
		vm.searchModal.hide();
		vm.searchUnit.hide();
	}

	function addUnit(item) {
		vm.local.unit_id = item.id;
		vm.local.unit_name = item.name;
		vm.searchUnit.hide();
		var seen = sessionStorage.getObject('sd.seen');
		seen.incident = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function saveIncident() {
		vm.newType = sessionStorage.getObject('sd.diary.incident.type')
		vm.action_required = sessionStorage.getObject('sd.diary.incident.actionReq')
		var incident = {
			type: {
				id: vm.newType && vm.newType[0].id || '',
				name: vm.newType && vm.newType[0].name || ''
			},
			description: vm.incident && vm.incident.description || '',
			quantity: vm.incident && vm.incident.quantity || '',
			unit_name: vm.local.unit_name,
			unit_id: vm.local.unit_id,
			action_required: vm.action_required && vm.action_required[0] || ''
		}

		if (vm.index !== 'create') {
			$rootScope.currentSD.incidents[vm.index] = incident;
		} else {
			$rootScope.currentSD.incidents.push(incident);
			var seen = sessionStorage.getObject('sd.seen');
			seen.incident = true;
			sessionStorage.setObject('sd.seen', seen);
		}
		vm.incidents = $rootScope.currentSD.incidents;
		//store the new data in temp SD
		// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
	}

	function deleteEntry(entry) {
		if (!navigator.onLine) {
			SettingService.show_message_popup('You are offline', "<center>You can remove incidents while online.</center>");
			return;
		}
		$('.item-content').css('transform', '');
		$rootScope.currentSD.incidents.forEach(function (el, i) {
			if (el === entry) {
				$rootScope.currentSD.incidents.splice(i, 1);
			}
		})
		//store the new data in temp SD
		// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
		SiteDiaryService.update_diary($rootScope.currentSD);
		var seen = sessionStorage.getObject('sd.seen');
		seen.incident = true;
		sessionStorage.setObject('sd.seen', seen);
	}

	function go(predicate, id) {
		if (predicate == "incidents" && ($rootScope.selected || vm.incident.type)) {
			saveIncident();
		}
		$rootScope.selected = undefined;
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
			seen.incident = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}

	watchChanges();
}
