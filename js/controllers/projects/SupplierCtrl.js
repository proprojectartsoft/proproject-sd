angular.module($APP.name).controller('SupplierCtrl', SupplierCtrl)

SupplierCtrl.$inject = ['$rootScope', '$scope', '$state', '$filter', 'SettingService', '$stateParams', '$ionicPopup'];

function SupplierCtrl($rootScope, $scope, $state, $filter, SettingService, $stateParams, $ionicPopup) {
    var vm = this;
    vm.go = go;
    vm.local = {}
    vm.suppNo = 0;
    vm.index = $stateParams.id;

    $scope.$watch(function() {
        SettingService.show_focus();
    });

    function addSupplier() {
        vm.create = localStorage.getObject('sd.diary.create');
        //if create is not loaded correctly, redirect to home and try again
        if (vm.create == null || vm.create == {}) {
            var errPopup = $ionicPopup.show({
                title: "Error",
                template: '<span>An unexpected error occured and Site Diary did not load properly.</span>',
                buttons: [{
                    text: 'OK',
                    type: 'button-positive',
                    onTap: function(e) {
                        errPopup.close();
                    }
                }]
            });
            $state.go('app.home');
        }
        vm.supplier = {
            grn_ref: vm.local.refference,
            supplier: vm.local.supplier_name,
            goods_details: []
        }
        vm.create.goods_received.push(vm.supplier);
        vm.suppNo = vm.create.goods_received.length - 1;
        if (vm.index === 'create') {
            vm.create.goods_received.push(vm.supplier);
            var seen = localStorage.getObject('sd.seen');
            seen.good = true;
            localStorage.setObject('sd.seen', seen);
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
        $state.go('app.' + predicate, {
            id: vm.suppNo,
            index: 'create'
        });
    }
}
