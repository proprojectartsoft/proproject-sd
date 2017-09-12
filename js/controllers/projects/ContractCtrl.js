sdApp.controller('ContractCtrl', ContractCtrl);

ContractCtrl.$inject = ['$state', '$scope', '$rootScope', 'SettingService', 'SyncService'];

function ContractCtrl($state, $scope, $rootScope, SettingService, SyncService) {
    var vm = this;
    vm.go = go;
		vm.save = save;
    vm.editMode = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });
    $scope.autoExpand = function(e) {
        $(e.target).height(e.target.scrollHeight - 30);
    };

    function save() {
        if (vm.input1 || vm.input2 || vm.input3) {
            var seen = sessionStorage.getObject('sd.seen');
            seen.contract = true;
            sessionStorage.setObject('sd.seen', seen);
        }
        if (vm.input1) {
            var instr = $rootScope.currentSD.contract_notes.instructions || [];
            instr.comments = instr.comments || [];
            instr.comments.push(vm.input1);
            vm.input1 = '';
        }
        if (vm.input2) {
            var ext = $rootScope.currentSD.contract_notes.extensions_of_time || [];
            ext.comments = ext.comments || [];
            ext.comments.push(vm.input2);
            vm.input2 = '';
        }
        if (vm.input3) {
            var vars = $rootScope.currentSD.contract_notes.variations || [];
            vars.comments = vars.comments || [];
            vars.comments.push(vm.input3);
            vm.input3 = '';
        }
        $('textarea').height('initial');
    }

    function go(predicate, id) {
        if (vm.editMode)
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
        $("textarea").change(function() {
            var seen = sessionStorage.getObject('sd.seen');
            seen.contract = true;
            sessionStorage.setObject('sd.seen', seen);
        });
    }

    watchChanges();
}
