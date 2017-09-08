sdApp.controller('OhsCtrl', OhsCtrl)

OhsCtrl.$inject = ['$state', '$stateParams', '$scope', 'SettingService', '$filter', 'SiteDiaryService', 'SyncService', '$rootScope', '$ionicPopup'];

function OhsCtrl($state, $stateParams, $scope, SettingService, $filter, SiteDiaryService, SyncService, $rootScope, $ionicPopup) {
	var vm = this;
	vm.go = go;
	vm.deleteEntry = deleteEntry;
	vm.local = {};
	vm.local.type = 'ohs.type';
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.index = $stateParams.id;
	vm.editMode = sessionStorage.getObject('editMode');
	
	SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
		vm.create = proj.temp;
		//if create is not loaded correctly, redirect to home and try again
		if (vm.create === null || vm.create === {}) {
			SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
			$state.go('app.home');
			return;
		}
		if (!isNaN(vm.index) && !(vm.index === null)) {
			vm.type = vm.create.oh_and_s[vm.index].type;
			vm.task_completed = vm.create.oh_and_s[vm.index].task_completed;
			vm.form_complete = vm.create.oh_and_s[vm.index].form_to_be_completed;
			vm.ref = vm.create.oh_and_s[vm.index].ref;
			vm.action_required = vm.create.oh_and_s[vm.index].action_required;
			vm.action_message = vm.create.oh_and_s[vm.index].action;
			vm.comment = vm.create.oh_and_s[vm.index].note;
		}
		vm.tools = vm.create.oh_and_s;
	});
	
	$scope.$watch(function () {
		if (vm.editMode)
			SettingService.show_focus();
	});
	
	vm.types = [{ //TODO:retrieve from DB
		id: 0,
		name: 'Toolbox Talk'
	}, {
		id: 1,
		name: 'Safety Walk'
	}, {
		id: 2,
		name: 'Incident/Accident Report'
	}, {
		id: 3,
		name: 'PPE Discussion'
	}];
	
	function save() {
		vm.newType = sessionStorage.getObject('sd.diary.ohs.type');
		vm.oh_and_s = {
			type: {
				id: vm.newType && vm.newType[0].id || '',
				name: vm.newType && vm.newType[0].name || ''
			},
			ref: vm.ref,
			task_completed: vm.task_completed,
			form_to_be_completed: vm.form_complete,
			action_required: vm.action_required,
			action: vm.action_message,
			note: vm.comment
		}
		if (vm.index !== 'create') {
			vm.create.oh_and_s[vm.index] = vm.oh_and_s;
		} else {
			vm.create.oh_and_s.push(vm.oh_and_s);
			var seen = sessionStorage.getObject('sd.seen');
			seen.ohs = true;
			sessionStorage.setObject('sd.seen', seen);
		}
		//store the new data in temp SD
		SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
	}
	
	function deleteEntry(entry) {
		if (!navigator.onLine) {
			SettingService.show_message_popup('You are offline', "<center>You can remove OH and S while online.</center>");
			return;
		}
		$('.item-content').css('transform', '');
		vm.create.oh_and_s.forEach(function (el, i) {
			if (el === entry) {
				vm.create.oh_and_s.splice(i, 1);
			}
		})
		//store the new data in temp SD
		SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
		SiteDiaryService.update_diary(vm.create);
		var seen = sessionStorage.getObject('sd.seen');
		seen.ohs = true;
		sessionStorage.setObject('sd.seen', seen);
	}
	
	function go(predicate, id) {
		if (predicate == "ohs" && ($rootScope.selected || vm.type)) {
			save();
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
			seen.ohs = true;
			sessionStorage.setObject('sd.seen', seen);
		});
		$("textarea").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.ohs = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}
	
	watchChanges();
}

//directive for textarea so it can wrap the text and be scaleble
sdApp.directive('elastic', [
	'$timeout',
	function ($timeout) {
		return {
			restrict: 'A',
			link: function autoResizeLink(scope, element, attributes, controller) {
				
				element.css({
					'height': '45px',
					'overflow-y': 'hidden'
				});
				$timeout(function () {
					element.css('height', 45 + 'px');
				}, 100);
				
				element.on('input', function () {
					element.css({
						'height': '45px',
						'overflow-y': 'hidden'
					});
					element.css('height', element[0].scrollHeight + 'px');
				});
			}
		};
	}
]);
