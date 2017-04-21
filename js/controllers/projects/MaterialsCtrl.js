angular.module($APP.name).controller('MaterialsCtrl', MaterialsCtrl)

MaterialsCtrl.$inject = ['$state', '$scope', '$ionicModal', '$stateParams', 'SiteDiaryService', 'SettingService'];

function MaterialsCtrl($state, $scope, $ionicModal, $stateParams, SiteDiaryService, SettingService) {
    var vm = this;
    vm.go = go;
    vm.unit = "materials.unit";
    vm.diaryId = localStorage.getObject('diaryId');
    vm.showSearch = showSearch;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addGood = addGood;
    vm.addUnit = addUnit;
    vm.save = save;

    vm.editMode = localStorage.getObject('editMode');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.index = $stateParams.id;
    vm.currency = localStorage.getObject('currency');

    vm.local = {};
    vm.local.data = {};
    vm.local.search = '';
    vm.data = {};
    vm.settings = '';
    vm.material = {}
    vm.total_formated = '';
    vm.subtotal_formated = '';

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    $scope.$watch(function() {
        var t = (vm.material.quantity * vm.material.unitCost) + ((vm.material.quantity * vm.material.unitCost) * (vm.material.tax / 100)) | '';
        var st = vm.material.quantity * vm.material.unitCost | '';
        if (t !== 0)
            vm.total_formated = t + " " + localStorage.getObject('currency');
        else
            vm.total_formated = '';
        if (st !== 0)
            vm.subtotal_formated = st + " " + localStorage.getObject('currency');
        else
            vm.subtotal_formated = '';
    })

    if (!isNaN(vm.index) && (vm.index !== 'create')) {
        vm.material = {
            name: vm.create.plant_and_material_used[vm.index].name,
            description: vm.create.plant_and_material_used[vm.index].description,
            unitCost: vm.create.plant_and_material_used[vm.index].cost_per_unit,
            unit_id: vm.create.plant_and_material_used[vm.index].unit_id,
            unit_name: vm.create.plant_and_material_used[vm.index].unit_name,
            quantity: vm.create.plant_and_material_used[vm.index].quantity,
            tax: vm.create.plant_and_material_used[vm.index].tax,
            tax_formated: vm.create.plant_and_material_used[vm.index].tax + " %",
            unitCost_formated: vm.create.plant_and_material_used[vm.index].cost_per_unit + " " + localStorage.getObject('currency')
        };
    }

    vm.materials = vm.create.plant_and_material_used;

    SiteDiaryService.get_resources().then(function(result) {
        $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.searchModal = popover;
        });
        vm.goods = result;
    })

    SiteDiaryService.get_units().then(function(result) {
        $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(popover) {
            vm.searchModal = popover;
            vm.searchUnit = popover;
        });
        vm.units = result;
    })

    function showSearch() {
        vm.settings = 'goods';
        vm.searchModal.show();
    }

    function showSearchUnit() {
        vm.settings = 'units';
        vm.searchUnit.show();
    }

    function backSearch() {
        vm.searchModal.hide();
        vm.searchUnit.hide();
    }

    function addGood(item) {
        vm.material.name = item.name;
        vm.material.unit_name = item.unit_name;
        vm.material.unitCost = item.direct_cost;
        vm.material.tax = item.vat;
        vm.material.tax_formated = vm.material.tax + " %";
        vm.searchModal.hide();
    }

    function addUnit(item) {
        vm.material.unit_id = item.id;
        vm.material.unit_name = item.name;
        vm.searchUnit.hide();
    }

    function save() {
        vm.material = {
            name: vm.material.name,
            description: vm.material.description,
            cost_per_unit: vm.material.unitCost,
            quantity: vm.material.quantity,
            unit_id: vm.material.unit_id,
            unit_name: vm.material.unit_name,
            subtotal: vm.material.quantity * vm.material.unitCost,
            tax: vm.material.tax,
            total: (vm.material.quantity * vm.material.unitCost) + ((vm.material.quantity * vm.material.unitCost) * (vm.material.tax / 100))
        }
        if (vm.editMode) {
            if (vm.index === 'create') {
                vm.create.plant_and_material_used.push(vm.material);
            } else {
                vm.create.plant_and_material_used[vm.index] = vm.material
            }

        } else {
            vm.create.plant_and_material_used.push(vm.material);
        }

        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('materials');
    }

    function go(predicate, id) {
        if ((predicate === 'diary') && (vm.diaryId)) {
            $state.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }
}
