angular.module($APP.name).controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$rootScope','$state','$stateParams', 'SiteDiaryService', '$indexedDB', '$filter'];

function GoodsUsedCtrl($rootScope,$state,$stateParams, SiteDiaryService, $indexedDB, $filter) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;

    vm.diaryId = localStorage.getObject('diaryId');
    vm.editMode = localStorage.getObject('editMode');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.index = $stateParams.id;
    vm.goods = vm.create.goods_received[vm.index].goods_details;

    function deleteEntry(entry){
        vm.create.goods_received[vm.index].goods_details.forEach(function(el, i) {
            if(el === entry){
              vm.create.goods_received[vm.index].goods_details.splice(i, 1);
            }
        })
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.goods_received[vm.index].goods_details = vm.create.goods_received[vm.index].goods_details;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        SiteDiaryService.update_diary(vm.create);
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

    function go(predicate,id,index) {
        $state.go('app.'+predicate, {
            id: id,
            index: index
        });
    }
}
