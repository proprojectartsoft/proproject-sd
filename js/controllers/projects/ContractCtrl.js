sdApp.controller('ContractCtrl', ContractCtrl);

ContractCtrl.$inject = ['$state', '$scope', 'SettingService', 'SyncService'];

function ContractCtrl($state, $scope, SettingService, SyncService) {
	var vm = this;
	vm.go = go;
	vm.add = add;
	vm.editMode = sessionStorage.getObject('editMode');
	vm.instructions = {
		comments: []
	};
	vm.variations = {
		comments: []
	};
	vm.extensions = {
		comments: []
	};
	//get the temporary SD
	vm.diaryId = sessionStorage.getObject('diaryId');
	
	SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
		vm.create = proj.temp;
		//if create is not loaded correctly, redirect to home and try again
		if (vm.create === null || vm.create === {}) {
			SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
			return $state.go('app.home');
		}
		initFields();
	});
	
	
	$scope.$watch(function () {
		if (vm.editMode)
			SettingService.show_focus();
	});
	$scope.autoExpand = function (e) {
		$(e.target).height(e.target.scrollHeight - 30);
	};
	
	function initFields() {
		if (vm.diaryId) {
			if (vm.create.contract_notes.instructions) {
				vm.instructions.comments = vm.create.contract_notes.instructions.comments;
			}
			if (vm.create.contract_notes.extensions_of_time) {
				vm.extensions.comments = vm.create.contract_notes.extensions_of_time.comments;
			}
			if (vm.create.contract_notes.variations) {
				vm.variations.comments = vm.create.contract_notes.variations.comments;
			}
		}
		if (!vm.diaryId) {
			if (vm.create.contract_notes.instructions) {
				vm.instructions.comments = vm.create.contract_notes.instructions.comments;
			}
			if (vm.create.contract_notes.extensions_of_time) {
				vm.extensions.comments = vm.create.contract_notes.extensions_of_time.comments;
			}
			if (vm.create.contract_notes.variations) {
				vm.variations.comments = vm.create.contract_notes.variations.comments;
			}
		}
	}
	
	function add() {
		if (vm.input1 || vm.input2 || vm.input3) {
			var seen = sessionStorage.getObject('sd.seen');
			seen.contract = true;
			sessionStorage.setObject('sd.seen', seen);
		}
		if (vm.input1) {
			vm.instructions.comments.push(vm.input1);
			vm.input1 = '';
		}
		if (vm.input2) {
			vm.extensions.comments.push(vm.input2);
			vm.input2 = '';
		}
		if (vm.input3) {
			vm.variations.comments.push(vm.input3);
			vm.input3 = '';
		}
		$('textarea').height('initial');
	}
	
	function save() {
		add();
		vm.contract = {
			instructions: vm.instructions,
			extensions_of_time: vm.extensions,
			variations: vm.variations
		};
		vm.create.contract_notes = vm.contract;
		SyncService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
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
		$("textarea").change(function () {
			var seen = sessionStorage.getObject('sd.seen');
			seen.contract = true;
			sessionStorage.setObject('sd.seen', seen);
		});
	}
	
	watchChanges();
}
