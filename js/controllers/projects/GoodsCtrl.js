angular.module($APP.name).controller('GoodsCtrl', GoodsCtrl)

GoodsCtrl.$inject = ['$rootScope','$state', 'SiteDiaryService'];

function GoodsCtrl($rootScope, $state, SiteDiaryService) {
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
}
