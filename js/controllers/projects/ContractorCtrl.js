angular.module($APP.name).controller('ContractorCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicModal', '$filter','$stateParams' , 'ContractorService', 'SiteDiaryService'];

function StaffMemberCtrl($rootScope, $scope, $state, $ionicModal, $filter,$stateParams, ContractorService, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.showSearch = showSearch;
    vm.backSearch = backSearch;
    vm.addStaff = addStaff;
    vm.save = save;
    vm.calcParse = calcParse;
    vm.calcTime = calcTime;
    vm.stringToDate = stringToDate;

    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'contractor';
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.editMode = localStorage.getObject('editMode');
    vm.index = $stateParams.id;

    vm.local.absence = 'absence';
    if ((!(vm.diaryId === false) && !(vm.index === 'create'))||!(isNaN(vm.index))) {
        vm.local.data = {
            staff_name: vm.create.site_attendance.contractors[vm.index].first_name,
            company_name: vm.create.site_attendance.contractors[vm.index].company_name,
            model_start: vm.stringToDate(vm.create.site_attendance.contractors[vm.index].start_time),
            model_finish: vm.stringToDate(vm.create.site_attendance.contractors[vm.index].finish_time),
            total_time: vm.create.site_attendance.contractors[vm.index].total_time,
            note: vm.create.site_attendance.contractors[vm.index].note,
            absence: vm.create.site_attendance.contractors[vm.index].absence.reason,
            role: vm.create.site_attendance.contractors[vm.index].trade,
            hourly_rate: vm.create.site_attendance.contractors[vm.index].hourly_rate
        }
        if(vm.create.site_attendance.contractors[vm.index].break_time){
          vm.local.data.model_break = vm.create.site_attendance.contractors[vm.index].break_time;
        }
        else{
        vm.data.model_break = vm.stringToDate("00:00");
      }
    } else {
        vm.data.model_break = vm.stringToDate("00:00");
    }

    ContractorService.list().then(function(result) {
        vm.searchModal = $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.searchModal = popover;
        });
        vm.contractor = result;
    })

    SiteDiaryService.absence_list().then(function(result) {
        angular.forEach(result, function(value) {
            value.name = value.reason;
        })
        vm.absence = result;
    })

    function showSearch() {
        vm.searchModal.show();
    }

    function backSearch() {
        vm.searchModal.hide();
    }

    function addStaff(item) {
        vm.local.data.contractor_name = item.name;
        vm.local.data.contractor_id = item.id;
        vm.searchModal.hide();
    }

    function save() {
        vm.local.data.absence = localStorage.getObject('sd.diary.absence');
        if ((vm.local.data.model_start) && (vm.local.data.model_finish)) {
            console.log('inhere');
            vm.local.total_time = vm.calcParse();
        }
        vm.member = {
            first_name: vm.local.data.contractor_name,
            company_name: vm.local.data.company_name,
            trade: vm.local.data.trade,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: vm.filteredStart,
            break_time: vm.filteredBreak,
            finish_time: vm.filteredFinish,
            total_time: vm.local.total_time,
            absence: vm.local.data.absence[0],
            //abscence_comment:,
            note: vm.local.data.note

        }
        if (vm.editMode) {
            if (vm.index === 'create') {
                vm.create.site_attendance.contractors.push(vm.member);
            } else {
                vm.create.site_attendance.contractors[vm.index] = vm.member;
            }
        } else {
            vm.create.site_attendance.contractors.push(vm.member);
        }

        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('siteAttendance');
    }

    function calcParse() {
        if (vm.data.model_start && vm.data.model_break && vm.data.model_finish) {
            vm.filteredBreak = $filter('date')(vm.data.model_break, "HH:mm");
            vm.filteredStart = $filter('date')(vm.data.model_start, "HH:mm");
            vm.filteredFinish = $filter('date')(vm.data.model_finish, "HH:mm");
            console.log(vm.filteredStart, vm.filteredFinish, vm.filteredBreak)
            vm.local.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
        }
    }

    function stringToDate(string) {
        if (string) {
            var aux = string.split(":");
            var date = new Date();
            var hh = aux[0];
            var mm = aux[1];
            date.setMinutes(mm);
            date.setHours(hh);
        }

        return date;

    }

    function calcTime(start, finish, breakTime) {
        var hhmm = ''
        var stringBreak = breakTime.split(":");
        var stringStart = start.split(":");
        var stringFinish = finish.split(":");
        var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));
        var hh = Math.floor(totalTime / 60)
        var mm = totalTime % 60
        if (hh < 10) {
            hhmm = '0' + hh + ':';
            if (mm < 10) {
                hhmm = hhmm + '0' + mm;
            } else {
                hhmm = hhmm + mm;
            }
        } else {
            hhmm = hh + ':';
            if (mm < 10) {
                hhmm = hhmm + '0' + mm;
            } else {
                hhmm = hhmm + mm;
            }
        }
        return hhmm;
    }

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
