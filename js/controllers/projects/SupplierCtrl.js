angular.module($APP.name).controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', 'SettingService', '$stateParams'];

function SupplierCtrl($rootScope, $scope, $state, $filter, SettingService, $stateParams) {
    var vm = this;
    vm.go = go;
    vm.local = {}
    vm.suppNo = 0;
    vm.index = $stateParams.id;
    if(!$rootScope.seen) $rootScope.seen = localStorage.getObject('sd.seen');

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function addSupplier() {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.backup = angular.copy(vm.create.goods_received);
        vm.supplier = {
            grn_ref: vm.local.refference,
            supplier: vm.local.supplier_name,
            goods_details: []
        }
        vm.create.goods_received.push(vm.supplier);
        vm.suppNo = vm.create.goods_received.length - 1;
        if (vm.index === 'create') {
            vm.create.goods_received.push(vm.supplier);
        } else {
            vm.create.goods_received[vm.suppNo] = vm.supplier;
        }

        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.create.id)
        })[0];
        diary.data.goods_received.push(vm.supplier);
        localStorage.setObject('currentProj', proj);
        // localStorage.setObject('sd.diary.create', vm.create);
    }

    function go(predicate) {
        addSupplier();
        if(JSON.stringify(vm.create.goods_received) !==  JSON.stringify(vm.backup)) {
          $rootScope.seen.good = true;
        }
        $state.go('app.' + predicate, {
            id: vm.suppNo,
            index: 'create'
        });
    }
}
