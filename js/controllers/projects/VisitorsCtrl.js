angular.module($APP.name).controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$rootScope','$state'];

function VisitorsCtrl($rootScope, $state) {
    var vm = this;
    vm.go = go;
    vm.save = save;

    vm.local = {};
    vm.local.data = {};
    vm.data = {};
    vm.create = localStorage.getObject('sd.diary.create');

    function save() {
        vm.member = {
            first_name: vm.local.data.first_name,
            last_name: vm.local.data.last_name,
            note: vm.local.data.note
        }
        vm.create.site_attendance.visitors.push(vm.member);
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('siteAttendance');
    }

    function go(predicate,id) {
        $state.go('app.'+predicate, {
            id: id
        });
    }
}
