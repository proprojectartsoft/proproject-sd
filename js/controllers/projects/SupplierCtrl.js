angular.module($APP.name).controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter'];

function SupplierCtrl($rootScope, $scope, $state, $filter) {
    var vm = this;
    vm.go = go;
    vm.addSupplier = addSupplier;
    vm.local = {}

    function addSupplier(){
      vm.create = localStorage.getObject('sd.diary.create');
      vm.supplier = {
        grn_ref: vm.local.refference,
        supplier: vm.local.supplier_name,
        goods_details: []

      }

      vm.create.goods_received.push(vm.supplier);
      localStorage.setObject('sd.diary.create',vm.create);
      vm.go('goods');
    }
    function go(predicate, id) {

        $state.go('app.' + predicate, {
            id: id
        });
    }
}
