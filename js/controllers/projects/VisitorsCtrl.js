angular.module($APP.name).controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$rootScope', '$state', 'SettingService', '$scope', '$indexedDB', '$filter', '$stateParams'];

function VisitorsCtrl($rootScope, $state, SettingService, $scope, $indexedDB, $filter, $stateParams) {
    var vm = this;
    vm.go = go;
    vm.local = {};
    vm.local.data = {};
    vm.data = {};
    vm.create = localStorage.getObject('sd.diary.create');
    vm.index = $stateParams.id;
    $rootScope.seen = localStorage.getObject('sd.seen');

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function save() {
        vm.backup = angular.copy(vm.create.site_attendance.visitors);
        vm.member = {
            first_name: vm.local.data.first_name,
            last_name: vm.local.data.last_name,
            note: vm.local.data.note
        }
        //Visitor add when index = create; update otherwise
        if (vm.index === 'create') {
            vm.create.site_attendance.visitors.push(vm.member);
        } else {
            vm.create.site_attendance.visitors[vm.index] = vm.member;
        }
        localStorage.setObject('sd.diary.create', vm.create);
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
        if(vm.local.data.first_name) {
          save();
          if(JSON.stringify(vm.create.site_attendance.visitors) !== JSON.stringify(vm.backup)) {
            $rootScope.seen.site_attendance.visitor = true;
          }
        }
        localStorage.setObject('siteAttendance.tab', 'visitors');
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
