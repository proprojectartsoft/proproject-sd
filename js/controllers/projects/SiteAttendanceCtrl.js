angular.module($APP.name).controller('SiteAttendanceCtrl', SiteAttendanceCtrl)

SiteAttendanceCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService'];

function SiteAttendanceCtrl($rootScope, $state, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.show = show;
    vm.deleteEntry = deleteEntry;

    show(localStorage.getObject('siteAttendance.tab') || "staff");
    localStorage.setObject('siteAttendance.tab', '');
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

    function deleteEntry(entry){
        if(vm.staff){
          vm.create.site_attendance.staffs.forEach(function(el, i) {
                if(el === entry){
                  vm.create.site_attendance.staffs.splice(i, 1);
                }
           })
        }
        if(vm.contractors){
          vm.create.site_attendance.contractors.forEach(function(el, i) {
                if(el === entry){
                  vm.create.site_attendance.contractors.splice(i, 1);
                }
           })
        }
        if(vm.visitors){
          vm.create.site_attendance.visitors.forEach(function(el, i) {
                if(el === entry){
                  vm.create.site_attendance.visitors.splice(i, 1);
                }
           })
        }
        localStorage.setObject('sd.diary.create', vm.create);
        SiteDiaryService.update_diary(vm.create);
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
