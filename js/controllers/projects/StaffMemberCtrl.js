angular.module($APP.name).controller('StaffMemberCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', '$ionicModal', '$stateParams', '$timeout', 'SiteDiaryService', 'SettingService', '$indexedDB'];

function StaffMemberCtrl($rootScope, $scope, $state, $filter, $ionicModal, $stateParams, $timeout, SiteDiaryService, SettingService, $indexedDB) {
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

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    vm.absence = localStorage.getObject('companyLists').absence_list;
    vm.emptyAbsence = [{
        id: '',
        reason: '',
        name: ''
    }];
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

    if ((!(vm.diaryId === false) && !(vm.index === 'create')) || !(isNaN(vm.index))) {
        vm.local.data = {
            staff_name: vm.create.site_attendance.staffs[vm.index].first_name + (vm.create.site_attendance.staffs[vm.index].last_name != null ? (" " + vm.create.site_attendance.staffs[vm.index].last_name) : ""), //TODO:
            company_name: vm.create.site_attendance.staffs[vm.index].company_name,
            model_start: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].start_time),
            model_finish: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].finish_time),
            total_time: vm.create.site_attendance.staffs[vm.index].total_time,
            note: vm.create.site_attendance.staffs[vm.index].note,
            absence: vm.create.site_attendance.staffs[vm.index].absence && vm.create.site_attendance.staffs[vm.index].absence.reason,
            role: vm.create.site_attendance.staffs[vm.index].trade,
            trade: vm.create.site_attendance.staffs[vm.index].trade,
            hourly_rate: vm.create.site_attendance.staffs[vm.index].hourly_rate,
            hourly_rate_formated: vm.create.site_attendance.staffs[vm.index].hourly_rate && (vm.currency + " " + vm.create.site_attendance.staffs[vm.index].hourly_rate) || ''
        }
        if (vm.create.site_attendance.staffs[vm.index].break_time) {
            vm.local.data.model_break = vm.create.site_attendance.staffs[vm.index].break_time;
        } else {
            vm.local.data.model_break = vm.stringToDate("00:30");
        }
    } else {
        vm.local.data.staff_name = "";
        vm.local.data.model_break = $filter('filter')(localStorage.getObject('companySettings'), {
            name: "break"
        })[0].value || vm.stringToDate("00:30");
        vm.local.data.model_start = $filter('filter')(localStorage.getObject('companySettings'), {
            name: "start"
        })[0].value;
        vm.local.data.model_finish = $filter('filter')(localStorage.getObject('companySettings'), {
            name: "finish"
        })[0].value;
    }

    vm.staff = localStorage.getObject('companyLists').staff;
    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
    });

    function allowNumbersOnly() {
        var watchOnce = $scope.$watch(function() {
            $timeout(function() {
                $('.ion-datetime-picker input').each(function() {
                    $(this).prop('type', 'number');
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
        vm.local.data.role = item.role;
        vm.local.data.trade = item.role;
        vm.local.data.staff_name = item.name;
        vm.local.data.staff_id = item.id;
        vm.local.data.hourly_rate = item.direct_cost;
        vm.local.data.company_name = item.employee_name;
        vm.searchModal.hide();
    }

    function addStaff1(item) {
        vm.local.data.staff_name = item;
        vm.searchModal.hide();
    }

    function save() {
        vm.local.data.absence = localStorage.getObject('sd.diary.absence');
        if ((vm.local.data.model_start) && (vm.local.data.model_finish)) {
            vm.local.total_time = vm.calcParse();
        }
        vm.member = {
            first_name: vm.local.data.staff_name.split(" ", 2)[0],
            last_name: vm.local.data.staff_name.split(" ", 2)[1],
            company_name: vm.local.data.company_name,
            trade: vm.local.data.trade,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: vm.filteredStart,
            break_time: vm.filteredBreak,
            finish_time: vm.filteredFinish,
            total_time: vm.local.data.total_time,
            absence: vm.local.data.absence && vm.local.data.absence[0],
            note: vm.local.data.note
        }
        if (vm.index === 'create') {
            vm.create.site_attendance.staffs.push(vm.member);
        } else {
            vm.create.site_attendance.staffs[vm.index] = vm.member;
        }

        localStorage.setObject('sd.diary.create', vm.create);
        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if (vm.editMode) {
                if (vm.index === 'create') {
                    diary.data.site_attendance.staffs.push(vm.member);
                } else {
                    diary.data.site_attendance.staffs[vm.index] = vm.member;
                }
            }
            localStorage.setObject('currentProj', proj);
        }
        localStorage.setObject('sd.diary.absence', null);
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

    function calcParse() {
        if (vm.local.data.model_start && vm.local.data.model_break && vm.local.data.model_finish) {
            vm.filteredBreak = $filter('date')(vm.local.data.model_break, "HH:mm");
            vm.filteredStart = $filter('date')(vm.local.data.model_start, "HH:mm");
            vm.filteredFinish = $filter('date')(vm.local.data.model_finish, "HH:mm");
            if(!vm.myForm.$dirty){
              vm.local.data.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
            }
        }
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
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
