angular.module($APP.name).controller('ItemCtrl', ItemCtrl)

ItemCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', '$filter', '$state', '$stateParams', 'SiteDiaryService', 'SettingService'];

function ItemCtrl($rootScope, $scope, $ionicModal, $filter, $state, $stateParams, SiteDiaryService, SettingService) {
    var vm = this;
    vm.go = go
    vm.showSearch = showSearch;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addGood = addGood;
    vm.addNewGood = addNewGood;
    vm.addUnit = addUnit;
    vm.editMode = localStorage.getObject('editMode');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.local = {};
    vm.local.data = {};
    vm.id = $stateParams.id;
    vm.index = $stateParams.index;
    vm.newGood = '';

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    if (vm.index !== 'create') {
        vm.local.data = {
            good_name: vm.create.goods_received[vm.id].goods_details[vm.index].details,
            good_unit: vm.create.goods_received[vm.id].goods_details[vm.index].unit_name,
            qty: vm.create.goods_received[vm.id].goods_details[vm.index].quantity,
            on_hire: vm.create.goods_received[vm.id].goods_details[vm.index].on_hire,
            off_hire: vm.create.goods_received[vm.id].goods_details[vm.index].off_hire,
            offHireAsString: $filter('date')(vm.create.goods_received[vm.id].goods_details[vm.index].off_hire, "dd/MM/yyyy"),
            onHireAsString: $filter('date')(vm.create.goods_received[vm.id].goods_details[vm.index].on_hire, "dd/MM/yyyy")
        };
    }
    vm.local.search = '';
    vm.data = {};
    vm.settings = '';
    vm.supplier = $stateParams.id;
    vm.goods = localStorage.getObject('companyLists').resources;
    vm.goods.sort(function (a,b){
      var textA = a.name.toUpperCase();
      var textB = b.name.toUpperCase();
      return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
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
        vm.local.data.good_name = item.name;
        vm.local.data.good_id = item.id;
        vm.local.data.good_unit = item.unit_name
        vm.searchModal.hide();
    }

    function addNewGood() {
        vm.local.data.good_name = vm.newGood;
        vm.searchModal.hide();
    }

    function addUnit(item) {
        vm.local.data.unit_id = item.id;
        vm.local.data.good_unit = item.name;
        vm.searchUnit.hide();
    }

    function saveItem() {
        vm.item = {
            details: vm.local.data.good_name,
            unit_name: vm.local.data.good_unit,
            unit_id: vm.local.data.good_id,
            quantity: vm.local.data.qty,
            on_hire: vm.local.data.on_hire,
            off_hire: vm.local.data.off_hire,
            onHireAsString: $filter('date')(vm.local.data.on_hire, "dd/MM/yyyy"),
            offHireAsString: $filter('date')(vm.local.data.off_hire, "dd/MM/yyyy")
        }
        if (vm.index === 'create') {
            vm.create.goods_received[vm.supplier].goods_details.push(vm.item);
        } else {
            vm.create.goods_received[vm.supplier].goods_details[vm.index] = vm.item;
        }
        localStorage.setObject('sd.diary.create', vm.create);

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if ((vm.editMode) && (vm.index !== 'create')) {
                diary.data.goods_received[vm.supplier].goods_details[vm.index] = vm.item;
            } else {
                diary.data.goods_received[vm.supplier].goods_details.push(vm.item);
            }
            localStorage.setObject('currentProj', proj);
        }
    }

    function go(predicate, id) {
        if(vm.editMode) saveItem();
        $state.go('app.' + predicate, {
            id: id
        });
    }
}
