angular.module($APP.name).controller('SiteAttendanceCtrl', SiteAttendanceCtrl)

SiteAttendanceCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService', '$filter', '$indexedDB', '$timeout', '$ionicPopup', 'SettingService'];

function SiteAttendanceCtrl($rootScope, $state, SiteDiaryService, $filter, $indexedDB, $timeout, $ionicPopup, SettingService) {
    var vm = this;
    vm.go = go;
    vm.show = show;
    vm.deleteEntry = deleteEntry;
    show(sessionStorage.getObject('siteAttendance.tab') || "staff");
    sessionStorage.setObject('siteAttendance.tab', '');
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    $indexedDB.openStore('projects', function(store) {
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            //if create is not loaded correctly, redirect to home and try again
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            //store the lists of site attendance
            vm.staffList = vm.create.site_attendance.staffs;
            vm.companyList = vm.create.site_attendance.contractors;
            vm.visitorList = vm.create.site_attendance.visitors;
        });
    });
    $timeout(function() {
        vm.seen = sessionStorage.getObject('sd.seen');
    })

    function show(predicate) {
        if (predicate == "staff") {
            vm.visitors = false;
            vm.contractors = false
            vm.staff = true;
            sessionStorage.setObject('siteAttTab', 'staff');
        } else {
            vm.staff = false;
            if (predicate == "contractors") {
                vm.visitors = false;
                vm.contractors = true;
                sessionStorage.setObject('siteAttTab', 'contractors');
            } else {
                vm.contractors = false;
                vm.visitors = true;
            }
        }
    }

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove members while online.</center>");
            return;
        }
        $('.item-content').css('transform', '');
        if (vm.staff) {
            vm.create.site_attendance.staffs.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.staffs.splice(i, 1);
                    console.log(vm.create.site_attendance.staffs);
                }
            })
            var seen = sessionStorage.getObject('sd.seen');
            seen.staff = true;
            sessionStorage.setObject('sd.seen', seen);
        }
        if (vm.contractors) {
            vm.create.site_attendance.contractors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.contractors.splice(i, 1);
                }
            })
            var seen = sessionStorage.getObject('sd.seen');
            seen.contractor = true;
            sessionStorage.setObject('sd.seen', seen);
        }
        if (vm.visitors) {
            vm.create.site_attendance.visitors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.visitors.splice(i, 1);
                }
            })
            var seen = sessionStorage.getObject('sd.seen');
            seen.visitor = true;
            sessionStorage.setObject('sd.seen', seen);
        }
        //remove from temp SD the site attendance
        SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
        SiteDiaryService.update_diary(vm.create);
    }

    function go(predicate, id) {
        if ((vm.diaryId) && (predicate === 'diary')) {
            $state.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }
}
