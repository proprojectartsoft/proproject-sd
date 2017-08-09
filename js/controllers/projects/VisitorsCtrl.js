angular.module($APP.name).controller('VisitorsCtrl', VisitorsCtrl)

VisitorsCtrl.$inject = ['$rootScope', '$state', 'SettingService', '$scope', '$indexedDB', '$filter', '$stateParams', '$ionicPopup'];

function VisitorsCtrl($rootScope, $state, SettingService, $scope, $indexedDB, $filter, $stateParams, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.local = {};
    vm.local.data = {};
    vm.data = {};
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
    vm.index = $stateParams.id;

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function save() {
        vm.member = {
            first_name: vm.local.data.first_name,
            last_name: vm.local.data.last_name,
            note: vm.local.data.note
        }
        //Visitor add when index = create; update otherwise
        if (vm.index === 'create') {
            vm.create.site_attendance.visitors.push(vm.member);
            var seen = localStorage.getObject('sd.seen');
            seen.visitor = true;
            localStorage.setObject('sd.seen', seen);
        } else {
            vm.create.site_attendance.visitors[vm.index] = vm.member;
        }
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        if (localStorage.getObject('diaryId')) {
            var diary = $filter('filter')(proj.value.diaries, {
                id: (localStorage.getObject('diaryId'))
            })[0];
            diary.data.site_attendance.visitors.push(vm.member);
            localStorage.setObject('currentProj', proj);
        }
    }

    function go(predicate, id) {
        if (vm.local.data.first_name) {
            save();
        }
        localStorage.setObject('siteAttendance.tab', 'visitors');
        $state.go('app.' + predicate, {
            id: id
        });
    }

    function watchChanges() {
        $("input").change(function() {
            var seen = localStorage.getObject('sd.seen');
            seen.visitor = true;
            localStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
