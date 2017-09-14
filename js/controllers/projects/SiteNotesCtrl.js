sdApp.controller('SiteNotesCtrl', SiteNotesCtrl)

SiteNotesCtrl.$inject = ['$rootScope', '$state', '$scope', 'SettingService', '$filter', '$ionicPopup', 'SyncService'];

function SiteNotesCtrl($rootScope, $state, $scope, SettingService, $filter, $ionicPopup, SyncService) {
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
        if (vm.input1) {
            $rootScope.currentSD.site_notes.delays = $rootScope.currentSD.site_notes.delays || [];
            $rootScope.currentSD.site_notes.delays.push(vm.input1);
            vm.input1 = '';
        }
        if (vm.input2) {
            $rootScope.currentSD.site_notes.tools_used = $rootScope.currentSD.site_notes.tools_used || [];
            $rootScope.currentSD.site_notes.tools_used.push(vm.input2);
            vm.input2 = '';
        }
        if (vm.input3) {
            $rootScope.currentSD.site_notes.materials_requested = $rootScope.currentSD.site_notes.materials_requested || [];
            $rootScope.currentSD.site_notes.materials_requested.push(vm.input3);
            vm.input3 = '';
        }
        $('textarea').height('initial');
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
}
