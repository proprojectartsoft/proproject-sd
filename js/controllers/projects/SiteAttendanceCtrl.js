angular.module($APP.name).controller('SiteAttendanceCtrl', SiteAttendanceCtrl)

SiteAttendanceCtrl.$inject = ['$rootScope', '$state', 'SiteDiaryService', '$filter', '$indexedDB'];

function SiteAttendanceCtrl($rootScope, $state, SiteDiaryService, $filter, $indexedDB) {
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

    function deleteEntry(entry) {
        if (vm.staff) {
            vm.create.site_attendance.staffs.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.staffs.splice(i, 1);
                    console.log(vm.create.site_attendance.staffs);
                }
            })
        }
        if (vm.contractors) {
            vm.create.site_attendance.contractors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.contractors.splice(i, 1);
                }
            })
        }
        if (vm.visitors) {
            vm.create.site_attendance.visitors.forEach(function(el, i) {
                if (el === entry) {
                    vm.create.site_attendance.visitors.splice(i, 1);
                }
            })
        }
        console.log(vm.create);
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
