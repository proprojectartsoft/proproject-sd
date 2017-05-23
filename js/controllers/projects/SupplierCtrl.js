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

    // if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
    //     window.cordova.plugins.Keyboard.disableScroll(true);
    // }
    //TODO:

    function addSupplier() {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.supplier = {
            grn_ref: vm.local.refference,
            supplier: vm.local.supplier_name,
            goods_details: []
        }
        vm.create.goods_received.push(vm.supplier);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.create.id)
        })[0];
        diary.data.goods_received.push(vm.supplier);
        localStorage.setObject('currentProj', proj);
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('goods');
    }

    function go(predicate, id) {
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
