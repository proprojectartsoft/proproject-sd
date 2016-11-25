angular.module($APP.name).controller('ContractorCtrl', StaffMemberCtrl)

StaffMemberCtrl.$inject = ['$rootScope', '$scope', '$state', '$ionicModal', '$filter', 'ContractorService', 'SiteDiaryService'];

function StaffMemberCtrl($rootScope, $scope, $state, $ionicModal, $filter, ContractorService, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.showSearch = showSearch;
    vm.backSearch = backSearch;
    vm.addStaff = addStaff;
    vm.save = save;
    vm.calcParse = calcParse;
    vm.calcTime = calcTime;

    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = 'contractor';
    vm.create = localStorage.getObject('sd.diary.create');
    vm.hour = $filter('date')(vm.data.model_break, "H:mm");
    vm.local.absence = 'absence';
    vm.filteredBreak = $filter('date')(vm.data.model_break, "HH:mm");
    vm.filteredStart = $filter('date')(vm.data.model_start, "HH:mm");
    vm.filteredFinish = $filter('date')(vm.data.model_finish, "HH:mm");
    if( vm.data.model_break && vm.data.model_start && vm.data.model_finish){
        vm.local.total_time = vm.calcTime(vm.filteredStart,vm.filteredFinish,vm.filteredBreak);
    }

    $scope.$watch(vm.filteredBreak,function(value){
    })

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
        vm.local.total_time = vm.calcParse();
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
        vm.create.site_attendance.contractors.push(vm.member);
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('siteAttendance');
    }

    function calcParse() {
        if (vm.data.model_start && vm.data.model_break && vm.data.model_finish) {
            vm.filteredBreak = $filter('date')(vm.data.model_break, "HH:mm");
            vm.filteredStart = $filter('date')(vm.data.model_start, "HH:mm");
            vm.filteredFinish = $filter('date')(vm.data.model_finish, "HH:mm");
            return calcTime(vm.filteredStart, vm.filteredFinish, vm.filteredBreak);
        }
    }

    function calcTime(start, finish, breakTime) {
        var stringBreak = breakTime.split(":");
        var stringStart = start.split(":");
        var stringFinish = finish.split(":");
        var totalTime = ((parseInt(stringFinish[0]) * 60) + parseInt(stringFinish[1])) - ((parseInt(stringStart[0]) * 60) + parseInt(stringStart[1])) - ((parseInt(stringBreak[0]) * 60) + parseInt(stringBreak[1]));

        return Math.floor(totalTime / 60) + ':' + totalTime % 60;
    }

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
