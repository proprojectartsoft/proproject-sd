angular.module($APP.name).controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$rootScope','$state','$stateParams'];

function GoodsUsedCtrl($rootScope,$state,$stateParams) {
    var vm = this;
    vm.go = go;
    vm.diaryId = localStorage.getObject('diaryId');
    vm.editMode = localStorage.getObject('editMode');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.index = $stateParams.id;
    vm.goods = vm.create.goods_received[vm.index].goods_details;

    function go(predicate,id,index) {
        $state.go('app.'+predicate, {
            id: id,
            index: index
        });
    }
}
