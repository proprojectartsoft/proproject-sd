sdApp.controller('ContractCtrl', ContractCtrl);

ContractCtrl.$inject = ['$state', '$scope', '$rootScope', 'SettingService'];

function ContractCtrl($state, $scope, $rootScope, SettingService) {
	var vm = this;
	vm.go = go;
	vm.save = save;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.diaryId = sessionStorage.getObject('diaryId');

	$scope.$watch(function () {
		if (vm.editMode) SettingService.show_focus();
	});
	$scope.autoExpand = function (e) {
		$(e.target).height(e.target.scrollHeight - 30);
	};

	// mixpanel track events
	if (navigator.onLine) {
		mixpanel.track("Page view: SD app", {'Page name:': 'SD - Contract notes'});
	}

	function save() {
		if (vm.input1) {
			var instr = $rootScope.currentSD.contract_notes.instructions || {};
			instr.comments = instr.comments || [];
			instr.comments.push(vm.input1);
			instr.select = false;
			instr.form_instance_id = 0;
			vm.input1 = '';
			$rootScope.currentSD.contract_notes.instructions = instr;
		}
		if (vm.input2) {
			var ext = $rootScope.currentSD.contract_notes.extensions_of_time || {};
			ext.comments = ext.comments || [];
			ext.comments.push(vm.input2);
			ext.select = false;
			ext.form_instance_id = 0;
			vm.input2 = '';
			$rootScope.currentSD.contract_notes.extensions_of_time = ext;
		}
		if (vm.input3) {
			var vars = $rootScope.currentSD.contract_notes.variations || {};
			vars.comments = vars.comments || [];
			vars.comments.push(vm.input3);
			vars.select = false;
			vars.form_instance_id = 0;
			vm.input3 = '';
			$rootScope.currentSD.contract_notes.variations = vars;
		}
		$('textarea').height('initial');
	}

	function go(predicate, id) {
		save();
		if (predicate === 'diary') {
			if (vm.diaryId) {
				$rootScope.go('app.' + predicate, {
					id: vm.diaryId
				});
			} else {
				$rootScope.go('app.' + predicate);
			}

		} else {
			$rootScope.go('app.' + predicate, {
				id: id
			});
		}
	}
}
