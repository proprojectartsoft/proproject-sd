angular.module($APP.name).controller('ContractorCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', '$stateParams', '$timeout', 'ContractorService', 'SiteDiaryService', 'SettingService'];

function StaffMemberCtrl($rootScope, $scope, $state, $filter, $stateParams, $timeout, ContractorService, SiteDiaryService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.showSearch = showSearch;
    vm.backSearch = backSearch;
    vm.addStaff = addStaff;
    vm.calcParse = calcParse;
    vm.calcTime = calcTime;
    vm.stringToDate = stringToDate;
    vm.addStaff1 = addStaff1;
    vm.allowNumbersOnly = allowNumbersOnly;
    vm.currency = SettingService.get_currency_symbol(
        $filter('filter')(localStorage.getObject('companySettings'), {
            name: "currency"
        })[0]);

    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'contractor';
    vm.emptyAbsence = [{
        id: '',
        reason: '',
        name: ''
    }];
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.editMode = localStorage.getObject('editMode');
    vm.index = $stateParams.id;

    vm.local.absence = 'absence';

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    if ((!(vm.diaryId === false) && !(vm.index === 'create')) || !(isNaN(vm.index))) {
        vm.local.data = {
            staff_name: vm.create.site_attendance.contractors[vm.index].first_name,
            company_name: vm.create.site_attendance.contractors[vm.index].company_name,
            model_start: vm.stringToDate(vm.create.site_attendance.contractors[vm.index].start_time),
            model_finish: vm.stringToDate(vm.create.site_attendance.contractors[vm.index].finish_time),
            total_time: vm.create.site_attendance.contractors[vm.index].total_time,
            note: vm.create.site_attendance.contractors[vm.index].note,
            absence: vm.create.site_attendance.contractors[vm.index].absence && vm.create.site_attendance.contractors[vm.index].absence.reason,
            role: vm.create.site_attendance.contractors[vm.index].trade,
            trade: vm.create.site_attendance.contractors[vm.index].trade,
            hourly_rate: vm.create.site_attendance.contractors[vm.index].hourly_rate,
            hourly_rate_formated: vm.create.site_attendance.contractors[vm.index].hourly_rate && (vm.currency + " " + vm.create.site_attendance.contractors[vm.index].hourly_rate) || ''
        }
        if (vm.create.site_attendance.contractors[vm.index].break_time) {
            vm.local.data.model_break = vm.create.site_attendance.contractors[vm.index].break_time;
        } else {
            vm.local.data.model_break = vm.stringToDate("00:30");
        }
        vm.calcParse();
    } else {
        vm.local.data.staff_name = "";
        vm.local.data.model_break = vm.stringToDate("00:30");
        vm.local.data.model_start = $filter('filter')(localStorage.getObject('companySettings'), {
            name: "start"
        })[0].value;
        vm.local.data.model_finish = $filter('filter')(localStorage.getObject('companySettings'), {
            name: "finish"
        })[0].value;
        vm.calcParse();
    }

    vm.absence = localStorage.getObject('companyLists').absence_list;

    function allowNumbersOnly() {
        var watchOnce = $scope.$watch(function() {
            $timeout(function() {
                $('.ion-datetime-picker input').each(function() {
                    $(this).prop('type', 'number');
                    $(this).prop('inputmode', 'numeric');
                })
                watchOnce();
            }, 10);

        })
    }

    function showSearch() {
        vm.searchModal.show();
    }

    function backSearch() {
        vm.searchModal.hide();
    }

    function addStaff(item) {
        vm.local.data.staff_name = item.name;
        vm.local.data.staff_id = item.id;
        vm.searchModal.hide();
    }

    function addStaff1(item) {
        vm.local.data.staff_name = item;
        vm.searchModal.hide();
    }

    function save() {
        vm.local.data.absence = localStorage.getObject('sd.diary.absence');
        // if ((vm.local.data.model_start) && (vm.local.data.model_finish)) {
        //     vm.calcParse();
        // }
        vm.member = {
            first_name: vm.local.data.staff_name,
            company_name: vm.local.data.company_name,
            trade: vm.local.data.trade,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: vm.filteredBreak = $filter('date')(vm.local.data.model_start, "HH:mm"),
            break_time: vm.filteredBreak = $filter('date')(vm.local.data.model_break, "HH:mm"),
            finish_time: vm.filteredBreak = $filter('date')(vm.local.data.model_finish, "HH:mm"),
            total_time: vm.local.data.total_time,
            absence: vm.local.data.absence && vm.local.data.absence[0],
            note: vm.local.data.note
        }

        if (vm.index === 'create') {
            vm.create.site_attendance.contractors.push(vm.member);
        } else {
            vm.create.site_attendance.contractors[vm.index] = vm.member;
        }

        localStorage.setObject('sd.diary.create', vm.create);
        localStorage.setObject('siteAttendance.tab', 'contractors');

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if (vm.editMode) {
                if (vm.index === 'create') {
                    diary.data.site_attendance.contractors.push(vm.member);
                } else {
                    diary.data.site_attendance.contractors[vm.index] = vm.member;
                }
            } else {
                diary.data.site_attendance.contractors.push(vm.member);
            }
            localStorage.setObject('currentProj', proj);
        }
        localStorage.setObject('sd.diary.absence', null);
    }

    function calcParse() {
        if (vm.local.data.model_start && vm.local.data.model_break && vm.local.data.model_finish) {
            vm.filteredBreak = $filter('date')(vm.local.data.model_break, "HH:mm");
            vm.filteredStart = $filter('date')(vm.local.data.model_start, "HH:mm");
            vm.filteredFinish = $filter('date')(vm.local.data.model_finish, "HH:mm");
            vm.local.data.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
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
        save();
        localStorage.setObject('siteAttendance.tab', 'contractors');
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
