angular.module($APP.name).controller('MaterialsCtrl', MaterialsCtrl)

MaterialsCtrl.$inject = ['$state', '$scope', '$ionicModal', '$stateParams', 'SiteDiaryService', 'SettingService', '$filter'];

function MaterialsCtrl($state, $scope, $ionicModal, $stateParams, SiteDiaryService, SettingService, $filter) {
    var vm = this;
    vm.go = go;
    vm.unit = "materials.unit";
    vm.diaryId = localStorage.getObject('diaryId');
    vm.showSearch = showSearch;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addGood = addGood;
    vm.addNewGood = addNewGood;
    vm.addUnit = addUnit;
    vm.editMode = localStorage.getObject('editMode');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.index = $stateParams.id;
    vm.currency = SettingService.get_currency_symbol(
        $filter('filter')(localStorage.getObject('companySettings'), {
            name: "currency"
        })[0]);

    vm.local = {};
    vm.local.search = '';
    vm.settings = '';
    vm.material = {}
    vm.total_formated = '';
    vm.subtotal_formated = '';
    vm.newGood = '';

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    $scope.$watch(function() {
        var t = (vm.material.quantity * vm.material.unitCost) + ((vm.material.quantity * vm.material.unitCost) * (vm.material.tax / 100));
        var st = vm.material.quantity * vm.material.unitCost;
        if (t !== 0 && !isNaN(t))
            vm.total_formated = vm.currency + " " + $filter('number')(t, 2);
        else
            vm.total_formated = '';
        if (st !== 0 && !isNaN(st))
            vm.subtotal_formated = vm.currency + " " + $filter('number')(st, 2);
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
            tax_formated: vm.create.plant_and_material_used[vm.index].tax && (vm.create.plant_and_material_used[vm.index].tax + " %") || '',
            unitCost_formated: vm.create.plant_and_material_used[vm.index].cost_per_unit && (vm.currency + " " + $filter('number')(vm.create.plant_and_material_used[vm.index].cost_per_unit, 2)) || ''
        };
    }
    vm.materials = vm.create.plant_and_material_used;
    vm.goods = localStorage.getObject('companyLists').resources;
    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
    });

    vm.units = localStorage.getObject('companyLists').units;
    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
        vm.searchUnit = popover;
    });

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

    function addNewGood() {
        vm.material.name = vm.newGood;
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
        if (vm.index === 'create') {
            vm.create.plant_and_material_used.push(vm.material);
        } else {
            vm.create.plant_and_material_used[vm.index] = vm.material
        }
        localStorage.setObject('sd.diary.create', vm.create);

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if (vm.editMode) {
                if (vm.index === 'create') {
                    diary.data.plant_and_material_used.push(vm.material);
                } else {
                    diary.data.plant_and_material_used[vm.index] = vm.material;
                }
            } else {
                diary.data.plant_and_material_used.push(vm.material);
            }
            localStorage.setObject('currentProj', proj);
        }
    }

    function go(predicate, id) {
        if (predicate == "materials")
            save();
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
