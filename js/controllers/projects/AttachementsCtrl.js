angular.module($APP.name).controller('AttachementsCtrl', AttachementsCtrl)

AttachementsCtrl.$inject = ['$state'];

function AttachementsCtrl($state) {
    var vm = this;
    vm.go = go;
    vm.diaryId = localStorage.getObject('diaryId');

    vm.pictures = [];

    function go(predicate, id) {
      if((vm.diaryId) && (predicate ==='diary')){
        $state.go('app.' + predicate, {
            id: vm.diaryId
        });
      }else{
        $state.go('app.' + predicate, {
            id: id
        });
      }
    }
}
