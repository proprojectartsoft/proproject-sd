angular.module($APP.name).controller('ProjectDiariesCtrl', ProjectDiariesCtrl)

ProjectDiariesCtrl.$inject = ['$scope', '$ionicModal', '$state', '$stateParams', 'SiteDiaryService', 'SettingService'];

function ProjectDiariesCtrl($scope, $ionicModal, $state, $stateParams, SiteDiaryService, SettingService) {
    var vm = this;
    vm.showDiary = showDiary;
    vm.backDiary = backDiary;
    vm.togglePlus = togglePlus;
    vm.go = go;
    vm.deleteDiary = deleteDiary;

    localStorage.setObject('sd.diary.create', null);
    localStorage.setObject('editMode', null);
    SettingService.clearWeather();
    localStorage.setObject('diaryId', null);
    localStorage.setObject('projectId', $stateParams.id);
    vm.show = false;
    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.selectOpt = [{
        id: 0,
        name: 'Annual leave'
    }, {
        id: 1,
        name: 'Inclement weather'
    }, {
        id: 2,
        name: 'No show'
    }, {
        id: 3,
        name: 'On other site'
    }, {
        id: 4,
        name: 'Public holiday'
    }, {
        id: 5,
        name: 'RDO'
    }, {
        id: 6,
        name: 'Sick leave'
    }, {
        id: 7,
        name: 'Unpaid leave'
    }, {
        id: 8,
        name: 'Training'
    }, {
        id: 9,
        name: 'Went home sick'
    }, {
        id: 10,
        name: 'Went to another project'
    }, {
        id: 11,
        name: 'Other'
    }]
    SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
        vm.diaries = result;
    })
    SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
        vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.diaryModal = popover;
        });
        vm.diary = result;
        console.log(result)
    })

    function deleteDiary(id) {
        SiteDiaryService.delete_diary(id).then(function(result) {
            SiteDiaryService.list_diaries($stateParams.id).then(function(result) {
                vm.diaries = result;
            })
        })
    }

    function togglePlus() {
        vm.show = !vm.show;
    }

    function showDiary() {
        vm.diaryModal.show();
    }

    function backDiary() {
        vm.diaryModal.hide();
        togglePlus();
    }

    function saveDiary () {
        if (vm && vm.diaryModal) {
            vm.diaryModal.hide();
        }
    };

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
        vm.diaryModal.hide();
    }
}
