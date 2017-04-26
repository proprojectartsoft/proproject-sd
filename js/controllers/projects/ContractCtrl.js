angular.module($APP.name).controller('ContractCtrl', ContractCtrl)

ContractCtrl.$inject = ['$rootScope', '$state', '$scope', 'SettingService', '$timeout'];

function ContractCtrl($rootScope, $state, $scope, SettingService, $timeout) {
    var vm = this;
    vm.go = go;
    vm.add = add;
    vm.save = save;
    vm.editMode = localStorage.getObject('editMode');
    vm.instructions = {
        comments: []
    };
    vm.variations = {
        comments: []
    };
    vm.extensions = {
        comments: []
    };
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    $scope.autoExpand = function(e) {
        $(e.target).height(e.target.scrollHeight - 30);
    };

    function add() {
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

    function save() {
        vm.contract = {
            instructions: vm.instructions,
            extensions_of_time: vm.extensions,
            variations: vm.variations
        }
        vm.create.contract_notes = vm.contract;
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('diary');
    }

    function go(predicate, id) {
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
}
