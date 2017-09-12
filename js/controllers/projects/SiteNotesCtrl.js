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
        if (vm.input1 || vm.input2 || vm.input3) {
            var seen = sessionStorage.getObject('sd.seen');
            seen.site = true;
            sessionStorage.setObject('sd.seen', seen);
        }
        if (vm.input1) {
            $rootScope.currentSD.site_notes.delays = $rootScope.currentSD.site_notes.delays || [];
            $rootScope.currentSD.site_notes.delays.push(vm.input1);
            vm.input1 = '';
        }
        if (vm.input2) {
            $rootScope.currentSD.site_notes.tools = $rootScope.currentSD.site_notes.tools || [];
            $rootScope.currentSD.site_notes.tools.push(vm.input2);
            vm.input2 = '';
        }
        if (vm.input3) {
            $rootScope.currentSD.site_notes.materials = $rootScope.currentSD.site_notes.materials || [];
            $rootScope.currentSD.site_notes.materials.push(vm.input3);
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
            seen.site = true;
            sessionStorage.setObject('sd.seen', seen);
        });
    }

    watchChanges();
}
