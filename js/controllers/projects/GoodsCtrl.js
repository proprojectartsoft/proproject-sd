angular.module($APP.name).controller('GoodsCtrl', GoodsCtrl)

GoodsCtrl.$inject = ['$rootScope','$state', 'SiteDiaryService', '$indexedDB', '$filter'];

function GoodsCtrl($rootScope, $state, SiteDiaryService, $indexedDB, $filter) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;

    vm.editMode = localStorage.getObject('editMode');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.suppliers = vm.create.goods_received;

    function deleteEntry(entry){
        vm.create.goods_received.forEach(function(el, i) {
            if(el === entry){
              vm.create.goods_received.splice(i, 1);
            }
        })
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.goods_received = vm.create.goods_received;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        SiteDiaryService.update_diary(vm.create);
    }

    function go(predicate,id) {
      if((predicate ==='diary') && (vm.diaryId)){
        $state.go('app.'+predicate, {
            id: vm.diaryId
        });
      }else{
        $state.go('app.'+predicate, {
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
