angular.module($APP.name).controller('SiteAttendanceCtrl', SiteAttendanceCtrl)

SiteAttendanceCtrl.$inject = ['$rootScope', '$state'];

function SiteAttendanceCtrl($rootScope, $state) {
    var vm = this;
    vm.go = go;
    vm.show = show;
    vm.staff = true;
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.editMode = localStorage.getObject('editMode');
    vm.staffList = vm.create.site_attendance.staffs;
    vm.companyList = vm.create.site_attendance.contractors;
    vm.visitorList = vm.create.site_attendance.visitors;
    function show(predicate) {
        if (predicate == "staff") {
            vm.visitors = false;
            vm.contractors = false
            vm.staff = true;
        } else {
            vm.staff = false;
            if (predicate == "contractors") {
                vm.visitors = false;
                vm.contractors = true;
            } else {
                vm.contractors = false;
                vm.visitors = true;
            }
        }
    }

    function go(predicate, id) {
      if((vm.diaryId) && (predicate ==='diary')){
        $state.go('app.' + predicate, {
            id: vm.diaryId
        });
      }else{
        $state.go('app.' + predicate, {
            id: id
        });
      }
    }
}
