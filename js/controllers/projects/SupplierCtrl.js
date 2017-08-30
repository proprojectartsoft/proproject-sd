angular.module($APP.name).controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', 'SettingService', '$stateParams', '$ionicPopup', '$indexedDB'];

function SupplierCtrl($rootScope, $scope, $state, $filter, SettingService, $stateParams, $ionicPopup, $indexedDB) {
    var vm = this;
    vm.go = go;
    vm.local = {}
    vm.suppNo = 0;
    vm.index = $stateParams.id;

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function addSupplier() {
        $indexedDB.openStore('projects', function(store) {
            store.find(sessionStorage.getObject('projectId')).then(function(proj) {
                vm.create = proj.temp;
                //if create is not loaded correctly, redirect to home and try again
                if (vm.create == null || vm.create == {}) {
                    SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                    $state.go('app.home');
                    return;
                }
                //initialize the data for a new supplier
                vm.supplier = {
                    grn_ref: vm.local.refference,
                    supplier: vm.local.supplier_name,
                    goods_details: []
                }
                vm.create.goods_received.push(vm.supplier);
                vm.suppNo = vm.create.goods_received.length - 1;
                if (vm.index === 'create' || vm.index == 0) {
                    //add a new supplier
                    vm.create.goods_received.push(vm.supplier);
                    var seen = sessionStorage.getObject('sd.seen');
                    seen.good = true;
                    sessionStorage.setObject('sd.seen', seen);
                } else {
                    //add goods for an existing supplier
                    vm.create.goods_received[vm.suppNo] = vm.supplier;
                }
                //store the new data in temp SD
                SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
            });
        });
    }

    function go(predicate) {
        addSupplier();
        $indexedDB.openStore('projects', function(store) {
            store.find(sessionStorage.getObject('projectId')).then(function(proj) {
                var test = proj.temp;
                $state.go('app.' + predicate, {
                    id: vm.suppNo,
                    index: 'create'
                });
            });
        });

    }
}
