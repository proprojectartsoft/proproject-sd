sdApp.controller('ContractorCtrl', ContractorCtrl);

ContractorCtrl.$inject = ['$scope', '$rootScope', '$state', '$filter', '$stateParams', '$timeout', 'SettingService'];

function ContractorCtrl($scope, $rootScope, $state, $filter, $stateParams, $timeout, SettingService) {
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
    vm.datetimeChanged = datetimeChanged;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'contractor';
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.index = $stateParams.id;
    vm.local.absence = 'absence';
    vm.absence = $rootScope.absence;
    vm.currency = SettingService.get_currency_symbol($rootScope.currency || "dolar");
    var startT = $rootScope.start || "08:00";
    var finishT = $rootScope.finish || "12:00";
    var breakT = $rootScope.break || "00:30";
    initFields();

    function getSettingValue(settings, name) {
        var arr = $filter('filter')(settings, {
            name: name
        });
        if (arr && arr.length)
            return arr[0].value;
        return null;
    }

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    function initFields() {
        if ((!(vm.diaryId === false) && !(vm.index === 'create')) || !(isNaN(vm.index))) {
            vm.local.data = {
                staff_name: $rootScope.currentSD.site_attendance.contractors[vm.index].first_name,
                company_name: $rootScope.currentSD.site_attendance.contractors[vm.index].company_name,
                model_start: vm.stringToDate($rootScope.currentSD.site_attendance.contractors[vm.index].start_time),
                model_finish: vm.stringToDate($rootScope.currentSD.site_attendance.contractors[vm.index].finish_time),
                model_break: $rootScope.currentSD.site_attendance.contractors[vm.index].break_time,
                total_time: vm.stringToDate($rootScope.currentSD.site_attendance.contractors[vm.index].total_time),
                note: $rootScope.currentSD.site_attendance.contractors[vm.index].note,
                absence: $rootScope.currentSD.site_attendance.contractors[vm.index].absence && $rootScope.currentSD.site_attendance.contractors[vm.index].absence.reason,
                role: $rootScope.currentSD.site_attendance.contractors[vm.index].trade,
                trade: $rootScope.currentSD.site_attendance.contractors[vm.index].trade,
                hourly_rate: $rootScope.currentSD.site_attendance.contractors[vm.index].hourly_rate,
                hourly_rate_formated: $rootScope.currentSD.site_attendance.contractors[vm.index].hourly_rate && (vm.currency + " " + $rootScope.currentSD.site_attendance.contractors[vm.index].hourly_rate) || ''
            };
            if (!vm.local.data.total_time) vm.calcParse();
        } else {
            vm.local.data.staff_name = "";
            vm.local.data.model_break = breakT;
            vm.local.data.model_start = vm.stringToDate(startT);
            vm.local.data.model_finish = vm.stringToDate(finishT);
            if (!vm.local.data.total_time) vm.calcParse();
        }
    }

    function allowNumbersOnly() {
        var watchOnce = $scope.$watch(function() {
            $timeout(function() {
                $('.ion-datetime-picker input').each(function() {
                    var el = $(this);
                    el.prop('type', 'number');
                    el.prop('inputmode', 'numeric');
                });
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
        var member = {
            first_name: vm.local.data.staff_name,
            company_name: vm.local.data.company_name,
            trade: vm.local.data.trade,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: $filter('date')(vm.local.data.model_start, "HH:mm"),
            break_time: $filter('date')(vm.local.data.model_break, "HH:mm"),
            finish_time: $filter('date')(vm.local.data.model_finish, "HH:mm"),
            total_time: $filter('date')(vm.local.data.total_time, "HH:mm"),
            absence: sessionStorage.getObject('sd.diary.absence') && sessionStorage.getObject('sd.diary.absence')[0],
            note: vm.local.data.note
        };
        //Contractor add when index = create; update otherwise
        if (vm.index === 'create') {
            $rootScope.currentSD.site_attendance.contractors.push(member);
        } else {
            //if no absence selected on last edit, keep the old value
            member.absence = member.absence || $rootScope.currentSD.site_attendance.contractors[vm.index].absence;
            $rootScope.currentSD.site_attendance.contractors[vm.index] = member;
        }
        sessionStorage.setObject('siteAttendance.tab', 'contractors');
        sessionStorage.setObject('sd.diary.absence', null);
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
        var stringBreak = breakTime.split(":"),
            stringStart = start.split(":"),
            stringFinish = finish.split(":"),
            totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1])),
            hh = Math.floor(totalTime / 60),
            mm = Math.abs(totalTime % 60);

        var hhmm = hh + ':';
        if (mm < 10) {
            hhmm = hhmm + '0' + mm;
        } else {
            hhmm = hhmm + mm;
        }
        return hhmm;
    }

    function go(predicate, id) {
        if (vm.local.data.staff_name) {
            save();
        }
        sessionStorage.setObject('siteAttendance.tab', 'contractors');
        $rootScope.go('app.' + predicate, {
            id: id
        });
    }
}
