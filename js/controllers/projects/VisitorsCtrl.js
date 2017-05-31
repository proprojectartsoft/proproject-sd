angular.module($APP.name).controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$rootScope', '$state', 'SettingService', '$scope', '$indexedDB', '$filter'];

function VisitorsCtrl($rootScope, $state, SettingService, $scope, $indexedDB, $filter) {
    var vm = this;
    vm.go = go;
    vm.local = {};
    vm.local.data = {};
    vm.data = {};
    vm.create = localStorage.getObject('sd.diary.create');

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function save() {
        vm.member = {
            first_name: vm.local.data.first_name,
            last_name: vm.local.data.last_name,
            note: vm.local.data.note
        }
        vm.create.site_attendance.visitors.push(vm.member);
        localStorage.setObject('sd.diary.create', vm.create);
        localStorage.setObject('siteAttendance.tab', 'visitors');

        var proj = localStorage.getObject('currentProj');
        if (localStorage.getObject('diaryId')) {
            var diary = $filter('filter')(proj.value.diaries, {
                id: (localStorage.getObject('diaryId'))
            })[0];
            diary.data.site_attendance.visitors.push(vm.member);
            localStorage.setObject('currentProj', proj);
        }
    }

    function go(predicate, id) {
        save();
        localStorage.setObject('siteAttendance.tab', 'visitors');
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
