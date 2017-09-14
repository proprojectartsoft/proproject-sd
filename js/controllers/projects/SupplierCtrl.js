sdApp.controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', 'SettingService', '$stateParams', 'SyncService'];

function SupplierCtrl($rootScope, $scope, $state, SettingService, $stateParams, SyncService) {
    var vm = this;
    vm.go = go;
    vm.local = {}
    vm.index = $stateParams.id;
    var suppNo = 0;
    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function initFields() {
        //initialize the data for a new supplier
        var supplier = {
            grn_ref: vm.local.refference,
            supplier: vm.local.supplier_name,
            goods_details: []
        };
        $rootScope.currentSD.goods_received.push(supplier);
        suppNo = $rootScope.currentSD.goods_received.length - 1;
        if (vm.index === 'create' || vm.index === 0) {
            //add a new supplier
            $rootScope.currentSD.goods_received.push(supplier);
            var seen = sessionStorage.getObject('sd.seen');
            seen.good = true;
            sessionStorage.setObject('sd.seen', seen);
        } else {
            //add goods for an existing supplier
            $rootScope.currentSD.goods_received[suppNo] = supplier;
        }
    }

    function go(predicate) {
        initFields();
        $state.go('app.' + predicate, {
            id: suppNo,
            index: 'create'
        });
    }
}
