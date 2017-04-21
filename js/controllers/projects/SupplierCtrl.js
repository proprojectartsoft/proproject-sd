angular.module($APP.name).controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', 'SettingService'];

function SupplierCtrl($rootScope, $scope, $state, $filter, SettingService) {
    var vm = this;
    vm.go = go;
    vm.addSupplier = addSupplier;
    vm.local = {}

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function addSupplier() {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.supplier = {
            grn_ref: vm.local.refference,
            supplier: vm.local.supplier_name,
            goods_details: []
        }
        vm.create.goods_received.push(vm.supplier);
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('goods');
    }

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
