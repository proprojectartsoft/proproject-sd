sdApp.controller('SiteAttendanceCtrl', SiteAttendanceCtrl);

SiteAttendanceCtrl.$inject = ['$rootScope', '$state', 'PostService', 'SettingService'];

function SiteAttendanceCtrl($rootScope, $state, PostService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.show = show;
    vm.deleteEntry = deleteEntry;
    show(sessionStorage.getObject('siteAttendance.tab') || "staff");
    sessionStorage.setObject('siteAttendance.tab', '');
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    //store the lists of site attendance
	if (!$rootScope.currentSD) return $rootScope.go('app.home', {}, true);
    vm.staffList = $rootScope.currentSD.site_attendance.staffs;
    vm.companyList = $rootScope.currentSD.site_attendance.contractors;
    vm.visitorList = $rootScope.currentSD.site_attendance.visitors;

    function show(predicate) {
        if (predicate === "staff") {
            vm.visitors = false;
            vm.contractors = false;
            vm.staff = true;
            sessionStorage.setObject('siteAttTab', 'staff');
        } else {
            vm.staff = false;
            if (predicate === "contractors") {
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
            $rootScope.currentSD.site_attendance.staffs.forEach(function(el, i) {
                if (el === entry) {
                    $rootScope.currentSD.site_attendance.staffs.splice(i, 1);
                }
            });
        }
        if (vm.contractors) {
            $rootScope.currentSD.site_attendance.contractors.forEach(function(el, i) {
                if (el === entry) {
                    $rootScope.currentSD.site_attendance.contractors.splice(i, 1);
                }
            });
        }
        if (vm.visitors) {
            $rootScope.currentSD.site_attendance.visitors.forEach(function(el, i) {
                if (el === entry) {
                    $rootScope.currentSD.site_attendance.visitors.splice(i, 1);
                }
            });
        }
        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: $rootScope.currentSD
        }, function(result) {}, function(error) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function go(predicate, id) {
        if ((vm.diaryId) && (predicate === 'diary')) {
            $rootScope.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            $rootScope.go('app.' + predicate, {
                id: id
            });
        }
    }
}
