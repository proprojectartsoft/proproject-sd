angular.module($APP.name).controller('GoodsCtrl', GoodsCtrl)

GoodsCtrl.$inject = ['$rootScope','$state'];

function GoodsCtrl($rootScope,$state) {
    var vm = this;
    vm.go = go;
    vm.editMode = localStorage.getObject('editMode');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.suppliers = vm.create.goods_received;

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
