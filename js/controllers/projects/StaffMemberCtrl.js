angular.module($APP.name).controller('StaffMemberCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', '$ionicModal', '$stateParams', 'SiteDiaryService'];

function StaffMemberCtrl($rootScope, $scope, $state, $filter, $ionicModal, $stateParams, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.showSearch = showSearch;
    vm.backSearch = backSearch;
    vm.addStaff = addStaff;
    vm.save = save;
    vm.calcParse = calcParse;
    vm.calcTime = calcTime;
    vm.stringToDate = stringToDate;

    SiteDiaryService.absence_list().then(function(result) {
        angular.forEach(result, function(value) {
            value.name = value.reason;
        })
        vm.absence = result;
    })
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.editMode = localStorage.getObject('editMode');
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'staff';
    vm.local.absence = 'absence';
    vm.index = $stateParams.id;
    if (!(vm.diaryId === false) && !(vm.index === 'create')) {
        vm.local.data = {
            staff_name: vm.create.site_attendance.staffs[vm.index].first_name,
            company_name: vm.create.site_attendance.staffs[vm.index].company_name,
            model_break: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].break_time),
            model_start: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].start_time),
            model_finish: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].finish_time),
            total_time: vm.create.site_attendance.staffs[vm.index].total_time,
            note: vm.create.site_attendance.staffs[vm.index].note,
            absence: vm.create.site_attendance.staffs[vm.index].absence.reason,
            trade: vm.create.site_attendance.staffs[vm.index].trade,
            hourly_rate: vm.create.site_attendance.staffs[vm.index].hourly_rate
        }
    } else {
      vm.local.data.model_break = vm.stringToDate("00:00");
    }
    SiteDiaryService.get_staff().then(function(result) {
        vm.searchModal = $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.searchModal = popover;
        });
        vm.staff = result;
    })

    function showSearch() {
        vm.searchModal.show();
    }

    function backSearch() {
        vm.searchModal.hide();
    }

    function addStaff(item) {
        vm.local.data.role = item.role;
        vm.local.data.staff_name = item.name;
        vm.local.data.staff_id = item.id;
        vm.searchModal.hide();
    }

    function save() {
        vm.local.data.absence = localStorage.getObject('sd.diary.absence');
        vm.local.total_time = vm.calcParse();
        vm.member = {
            first_name: vm.local.data.staff_name.split(" ", 2)[0],
            last_name: vm.local.data.staff_name.split(" ", 2)[1],
            company_name: vm.local.data.company_name,
            role: vm.local.data.role,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: vm.filteredStart,
            break_time: vm.filteredBreak,
            finish_time: vm.filteredFinish,
            total_time: vm.local.total_time,
            absence: vm.local.data.absence[0],
            note: vm.local.data.note

        }
        vm.create.site_attendance.staffs.push(vm.member);
        localStorage.setObject('sd.diary.create', vm.create)
        vm.go('siteAttendance');
    }
    function stringToDate(string){

       var date = new Date();
       var aux = string.split(":");
       var hh = aux[0];
       var mm = aux[1];
       date.setMinutes(mm);
       date.setHours(hh);
       return date;

    }
    function calcParse() {
        if (vm.local.data.model_start && vm.local.data.model_break && vm.local.data.model_finish) {
            vm.filteredBreak = $filter('date')(vm.local.data.model_break, "HH:mm");
            vm.filteredStart = $filter('date')(vm.local.data.model_start, "HH:mm");
            vm.filteredFinish = $filter('date')(vm.local.data.model_finish, "HH:mm");
            vm.local.data.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
        }
    }

    function calcTime(start, finish, breakTime) {
        var stringBreak = breakTime.split(":");
        var stringStart = start.split(":");
        var stringFinish = finish.split(":");
        var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));
        return Math.floor(totalTime / 60) + ':' + totalTime % 60;
    }

    function go(predicate, id) {

        $state.go('app.' + predicate, {
            id: id
        });
    }
}
