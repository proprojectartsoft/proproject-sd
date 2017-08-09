angular.module($APP.name).controller('SiteAttendanceCtrl', SiteAttendanceCtrl)

SiteAttendanceCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService', '$filter', '$indexedDB', '$timeout', '$ionicPopup'];

function SiteAttendanceCtrl($rootScope, $state, SiteDiaryService, $filter, $indexedDB, $timeout, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.show = show;
    vm.deleteEntry = deleteEntry;

    show(localStorage.getObject('siteAttendance.tab') || "staff");
    localStorage.setObject('siteAttendance.tab', '');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    //if create is not loaded correctly, redirect to home and try again
    if (vm.create == null || vm.create == {}) {
        var errPopup = $ionicPopup.show({
            title: "Error",
            template: '<span>An unexpected error occured and Site Diary did not load properly.</span>',
            buttons: [{
                text: 'OK',
                type: 'button-positive',
                onTap: function(e) {
                    errPopup.close();
                }
            }]
        });
        $state.go('app.home');
    }
    vm.editMode = localStorage.getObject('editMode');
    vm.staffList = vm.create.site_attendance.staffs;
    vm.companyList = vm.create.site_attendance.contractors;
    vm.visitorList = vm.create.site_attendance.visitors;
    $timeout(function() {
        vm.seen = localStorage.getObject('sd.seen');
    })

    function show(predicate) {
        if (predicate == "staff") {
            vm.visitors = false;
            vm.contractors = false
            vm.staff = true;
            localStorage.setObject('siteAttTab', 'staff');
        } else {
            vm.staff = false;
            if (predicate == "contractors") {
                vm.visitors = false;
                vm.contractors = true;
                localStorage.setObject('siteAttTab', 'contractors');

            } else {
                vm.contractors = false;
                vm.visitors = true;
            }
        }
    }

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            var syncPopup = $ionicPopup.show({
                title: 'You are offline',
                template: "<center>You can remove members while online.</center>",
                content: "",
                buttons: [{
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e) {
                        syncPopup.close();
                    }
                }]
            });
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
            var seen = localStorage.getObject('sd.seen');
            seen.staff = true;
            localStorage.setObject('sd.seen', seen);
        }
        if (vm.contractors) {
            vm.create.site_attendance.contractors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.contractors.splice(i, 1);
                }
            })
            var seen = localStorage.getObject('sd.seen');
            seen.contractor = true;
            localStorage.setObject('sd.seen', seen);
        }
        if (vm.visitors) {
            vm.create.site_attendance.visitors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.visitors.splice(i, 1);
                }
            })
            var seen = localStorage.getObject('sd.seen');
            seen.visitor = true;
            localStorage.setObject('sd.seen', seen);
        }
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.site_attendance = vm.create.site_attendance;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
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

    function saveChanges(project) {
        $indexedDB.openStore('projects', function(store) {
            store.upsert(project).then(
                function(e) {},
                function(err) {
                    var offlinePopup = $ionicPopup.alert({
                        title: "Unexpected error",
                        template: "<center>An unexpected error occurred while trying to update Site Diary.</center>",
                        content: "",
                        buttons: [{
                            text: 'Ok',
                            type: 'button-positive',
                            onTap: function(e) {
                                offlinePopup.close();
                            }
                        }]
                    });
                }
            )
        })
    }
}
