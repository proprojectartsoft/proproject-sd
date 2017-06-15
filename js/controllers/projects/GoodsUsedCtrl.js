angular.module($APP.name).controller('GoodsUsedCtrl', GoodsUsedCtrl)

GoodsUsedCtrl.$inject = ['$rootScope','$state','$stateParams', 'SiteDiaryService'];

function GoodsUsedCtrl($rootScope,$state,$stateParams, SiteDiaryService) {
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
        SiteDiaryService.update_diary(vm.create);
    }

    function go(predicate,id,index) {
        $state.go('app.'+predicate, {
            id: id,
            index: index
        });
    }
}
