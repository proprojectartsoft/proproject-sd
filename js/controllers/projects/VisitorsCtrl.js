sdApp.controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$state', 'SettingService', '$scope', '$rootScope', 'SyncService', '$stateParams'];

function VisitorsCtrl($state, SettingService, $scope, $rootScope, SyncService, $stateParams) {
    var vm = this;
    vm.go = go;
    vm.local = {};
    vm.local.data = {};
    vm.data = {};
    vm.index = $stateParams.id;

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function save() {
        var member = {
            first_name: vm.local.data.first_name,
            last_name: vm.local.data.last_name,
            note: vm.local.data.note
        }
        //Visitor add when index = create; update otherwise
        if (vm.index === 'create') {
            $rootScope.currentSD.site_attendance.visitors.push(member);
        } else {
            $rootScope.currentSD.site_attendance.visitors[vm.index] = member;
        }
    }

    function go(predicate, id) {
        if (vm.local.data.first_name) {
            save();
        }
        sessionStorage.setObject('siteAttendance.tab', 'visitors');
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
