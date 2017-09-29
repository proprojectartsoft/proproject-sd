sdApp.controller('MaterialsCtrl', MaterialsCtrl)

MaterialsCtrl.$inject = ['$state', '$scope', '$ionicModal', '$stateParams', 'PostService', 'SettingService', '$filter', '$rootScope'];

function MaterialsCtrl($state, $scope, $ionicModal, $stateParams, PostService, SettingService, $filter, $rootScope) {
    var vm = this;
    vm.go = go;
    vm.unit = "materials.unit";
    vm.showSearch = showSearch;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addGood = addGood;
    vm.addNewGood = addNewGood;
    vm.addUnit = addUnit;
    vm.deleteEntry = deleteEntry;
    vm.compute = compute;
    vm.editMode = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.index = $stateParams.id;
    vm.local = {};
    vm.local.search = '';
    vm.settings = '';
    vm.material = {};
    vm.total_formated = '';
    vm.subtotal_formated = '';
    vm.newGood = '';
    if (!$rootScope.currentSD) return $rootScope.go('app.home', {}, true);
    vm.goods = $rootScope.resources;
    vm.goods.sort(function(a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    vm.units = $rootScope.units;
    vm.currency = SettingService.get_currency_symbol($rootScope.currency || "dolar");
    if (!isNaN(vm.index) && (vm.index !== 'create')) {
        vm.material = $rootScope.currentSD.plant_and_material_used[vm.index];
        vm.material.tax_formated = $rootScope.currentSD.plant_and_material_used[vm.index].tax && ($rootScope.currentSD.plant_and_material_used[vm.index].tax + " %") || '';
        vm.material.unitCost_formated = $rootScope.currentSD.plant_and_material_used[vm.index].cost_per_unit && (vm.currency + " " + $filter('number')($rootScope.currentSD.plant_and_material_used[vm.index].cost_per_unit, 2)) || '';
    }
    vm.materials = $rootScope.currentSD.plant_and_material_used;
    compute();

    function getSettingValue(settings, name) {
        var arr = $filter('filter')(settings, {
            name: name
        });
        if (arr && arr.length)
            return arr[0].value;
        return null;
    }

    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
    });

    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
        vm.searchUnit = popover;
    });

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    function compute() {
        var t = (vm.material.quantity * vm.material.cost_per_unit) + ((vm.material.quantity * vm.material.cost_per_unit) * (vm.material.tax / 100));
        var st = vm.material.quantity * vm.material.cost_per_unit;
        if (t !== 0 && !isNaN(t))
            vm.total_formated = vm.currency + " " + $filter('number')(t, 2);
        else
            vm.total_formated = '';
        if (st !== 0 && !isNaN(st))
            vm.subtotal_formated = vm.currency + " " + $filter('number')(st, 2);
        else
            vm.subtotal_formated = '';
    }

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
        vm.material.cost_per_unit = item.direct_cost;
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
        vm.material.subtotal = vm.material.quantity * vm.material.cost_per_unit;
        vm.material.total = (vm.material.quantity * vm.material.cost_per_unit) + ((vm.material.quantity * vm.material.cost_per_unit) * (vm.material.tax / 100));
        if (vm.index === 'create') {
            $rootScope.currentSD.plant_and_material_used.push(vm.material);
        } else {
            $rootScope.currentSD.plant_and_material_used[vm.index] = vm.material
        }
        vm.materials = $rootScope.currentSD.plant_and_material_used;
    }

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove materials while online.</center>");
            return;
        }
        $('.item-content').css('transform', '');
        $rootScope.currentSD.plant_and_material_used.forEach(function(el, i) {
            if (el === entry) {
                $rootScope.currentSD.plant_and_material_used.splice(i, 1);
            }
        });
        PostService.post({
            url: 'sitediary',
            method: 'PUT',
            data: $rootScope.currentSD
        }, function(result) {}, function(error) {
            SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary could not be updated.</span>');
        })
    }

    function go(predicate, id) {
        if (predicate === "materials" && vm.material.name) {
            save();
        }
        if ((predicate === 'diary') && (vm.diaryId)) {
            $rootScope.go('app.' + predicate, {
                id: vm.diaryId
            });
        } else {
            $rootScope.go('app.' + predicate, {
                id: id
            });
        }
    }
}
