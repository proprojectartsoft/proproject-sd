angular.module($APP.name).controller('StaffMemberCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', '$ionicModal', '$stateParams', '$timeout', 'SiteDiaryService', 'SettingService', '$indexedDB', '$ionicPopup'];

function StaffMemberCtrl($rootScope, $scope, $state, $filter, $ionicModal, $stateParams, $timeout, SiteDiaryService, SettingService, $indexedDB, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.showSearch = showSearch;
    vm.backSearch = backSearch;
    vm.addStaff = addStaff;
    vm.calcParse = calcParse;
    vm.calcTime = calcTime;
    vm.stringToDate = stringToDate;
    vm.addNewName = addNewName;
    vm.addStaff1 = addStaff1;
    vm.allowNumbersOnly = allowNumbersOnly;
    vm.datetimeChanged = datetimeChanged;
    vm.emptyAbsence = [{
        id: '',
        reason: '',
        name: ''
    }];
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'staff';
    vm.local.absence = 'absence';
    vm.index = $stateParams.id;
    vm.newName = '';
    //get necessary settings for company
    $indexedDB.openStore('settings', function(store) {
        store.find("absence").then(function(list) {
            vm.absence = list.value;
        });
        store.find("staff").then(function(list) {
            vm.staff = list.value;
        });
        store.find("currency").then(function(list) {
            vm.currency = SettingService.get_currency_symbol(list.value);
        }, function(err) {
            vm.currency = SettingService.get_currency_symbol("dolar");
        });
    });
    //get projects
    $indexedDB.openStore('projects', function(store) {
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            //if create is not loaded correctly, redirect to home and try again
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            initFields();
        });
    });

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });
    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
    });

    function initFields() {
        if ((!(vm.diaryId === false) && !(vm.index === 'create')) || !(isNaN(vm.index))) {
            vm.local.data = {
                staff_name: vm.create.site_attendance.staffs[vm.index].first_name + (vm.create.site_attendance.staffs[vm.index].last_name != null ? (" " + vm.create.site_attendance.staffs[vm.index].last_name) : ""),
                company_name: vm.create.site_attendance.staffs[vm.index].company_name,
                model_start: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].start_time),
                model_finish: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].finish_time),
                total_time: vm.stringToDate(vm.create.site_attendance.staffs[vm.index].total_time),
                note: vm.create.site_attendance.staffs[vm.index].note,
                absence: vm.create.site_attendance.staffs[vm.index].absence && vm.create.site_attendance.staffs[vm.index].absence.reason,
                role: vm.create.site_attendance.staffs[vm.index].trade,
                trade: vm.create.site_attendance.staffs[vm.index].trade,
                hourly_rate: vm.create.site_attendance.staffs[vm.index].hourly_rate,
                hourly_rate_formated: vm.create.site_attendance.staffs[vm.index].hourly_rate && (vm.currency + " " + vm.create.site_attendance.staffs[vm.index].hourly_rate) || ''
            }
            if (vm.create.site_attendance.staffs[vm.index].break_time) {
                vm.local.data.model_break = vm.stringToDate(vm.create.site_attendance.staffs[vm.index].break_time);
            } else {
                vm.local.data.model_break = vm.stringToDate("00:30");
            }
            if (!vm.local.data.total_time) vm.calcParse();
        } else {
            vm.local.data.staff_name = "";
            vm.local.data.model_break = vm.stringToDate("00:30");
            $indexedDB.openStore('settings', function(store) {
                store.find("start").then(function(list) {
                    vm.local.data.model_start = list.value;
                }, function(err) {
                    vm.local.data.model_start = "08:00";
                });
                store.find("finish").then(function(list) {
                    vm.local.data.model_finish = list.value;
                }, function(err) {
                    vm.local.data.model_finish = "12:00";
                });
            });
            if (!vm.local.data.total_time) vm.calcParse();
        }
    }

    function allowNumbersOnly() {
        var watchOnce = $scope.$watch(function() {
            $timeout(function() {
                $('.ion-datetime-picker input').each(function() {
                    $(this).change(function() {
                        console.log("change");
                        var seen = sessionStorage.getObject('sd.seen');
                        seen.staff = true;
                        sessionStorage.setObject('sd.seen', seen);
                    });
                    $(this).prop('type', 'tel');
                    $(this).on('input', function() {
                        if (!this.value) {
                            $(this).val(0);
                            $(this).blur();
                            $(this).focus();
                        }
                    })
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

    function addNewName() {
        vm.local.data.staff_name = vm.newName;
        vm.searchModal.hide();
        var seen = sessionStorage.getObject('sd.seen');
        seen.staff = true;
        sessionStorage.setObject('sd.seen', seen);
    }

    function addStaff(item) {
        vm.local.data.role = item.role;
        vm.local.data.trade = item.role;
        vm.local.data.staff_name = item.name;
        vm.local.data.staff_id = item.id;
        vm.local.data.hourly_rate = item.direct_cost;
        vm.local.data.company_name = item.employee_name;
        calcParse();
        vm.searchModal.hide();
        var seen = sessionStorage.getObject('sd.seen');
        seen.staff = true;
        sessionStorage.setObject('sd.seen', seen);
    }

    function addStaff1(item) {
        vm.local.data.staff_name = item;
        vm.searchModal.hide();
    }

    function save() {
        vm.local.data.absence = sessionStorage.getObject('sd.diary.absence');
        vm.member = {
            first_name: vm.local.data.staff_name.split(" ", 2)[0],
            last_name: vm.local.data.staff_name.split(" ", 2)[1],
            company_name: vm.local.data.company_name,
            trade: vm.local.data.trade,
            hourly_rate: vm.local.data.hourly_rate,
            start_time: $filter('date')(vm.local.data.model_start, "HH:mm"),
            break_time: $filter('date')(vm.local.data.model_break, "HH:mm"),
            finish_time: $filter('date')(vm.local.data.model_finish, "HH:mm"),
            total_time: $filter('date')(vm.local.data.total_time, "HH:mm"),
            absence: vm.local.data.absence && vm.local.data.absence[0],
            note: vm.local.data.note
        }
        //Staff add when index = create; update otherwise
        if (vm.index === 'create') {
            vm.create.site_attendance.staffs.push(vm.member);
            var seen = sessionStorage.getObject('sd.seen');
            seen.staff = true;
            sessionStorage.setObject('sd.seen', seen);
        } else {
            vm.create.site_attendance.staffs[vm.index] = vm.member;
        }
        //store the new data in temp SD
        SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
        sessionStorage.setObject('sd.diary.absence', null);
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
            vm.local.data.total_time = calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
        }
    }

    function calcTime(start, finish, breakTime) {
        var hhmm = ''
        var stringBreak = breakTime.split(":");
        var stringStart = start.split(":");
        var stringFinish = finish.split(":");
        var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));
        var hh = Math.floor(totalTime / 60)
        var mm = Math.abs(totalTime % 60)
        hhmm = hh + ':';
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
        $state.go('app.' + predicate, {
            id: id
        });
    }

    function watchChanges() {
        $("input").change(function() {
            var seen = sessionStorage.getObject('sd.seen');
            seen.staff = true;
            sessionStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();

    function datetimeChanged() {
        var seen = sessionStorage.getObject('sd.seen');
        seen.staff = true;
        sessionStorage.setObject('sd.seen', seen);
        vm.calcParse();
    }
}
