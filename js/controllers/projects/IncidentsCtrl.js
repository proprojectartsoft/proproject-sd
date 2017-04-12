angular.module($APP.name).controller('IncidentsCtrl', IncidentsCtrl)

IncidentsCtrl.$inject = ['$scope', '$state', '$ionicModal', '$stateParams', 'SiteDiaryService'];

function IncidentsCtrl($scope, $state, $ionicModal, $stateParams, SiteDiaryService) {
    var vm = this;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.saveIncident = saveIncident;
    vm.addUnit = addUnit;
    vm.go = go;

    vm.editMode = localStorage.getObject('editMode');
    vm.local = {};
    vm.index = $stateParams.id
    vm.actionReq = 'incident.actionReq';
    vm.type = 'incident.type';
    vm.units = 'incident.units';
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.incidents = vm.create.incidents;
    if (!isNaN(vm.index)) {
        vm.incident = {
            description: vm.create.incidents[vm.index].description,
            quantity: vm.create.incidents[vm.index].quantity,
            unit_name: vm.create.incidents[vm.index].unit_name,
            action_required: vm.create.incidents[vm.index].action_required,
            type: vm.create.incidents[vm.index].type,
            unit_id: vm.create.incidents[vm.index].unit_id
        }
    }
    vm.local.type = [{
        id: 0,
        name: 'Incident'
    }, {
        id: 1,
        name: 'Accident'
    }, {
        id: 2,
        name: 'Non conformance'
    }];

    vm.actions = [{
        id: 0,
        name: 'Raise NCR'
    }, {
        id: 1,
        name: 'Raise incident report'
    }, {
        id: 2,
        name: 'Raise accident report'
    }, {
        id: 3,
        name: 'Other'
    }];
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

    function showSearchUnit() {
        vm.settings = 'units';
        vm.searchUnit.show();
    }

    function backSearch() {
        vm.searchModal.hide();
        vm.searchUnit.hide();
    }

    function addUnit(item) {
        vm.local.unit_id = item.id;
        vm.local.unit_name = item.name;
        vm.searchUnit.hide();
    }

    function saveIncident() {
        vm.newType = localStorage.getObject('sd.diary.incident.type')
        vm.action_required = localStorage.getObject('sd.diary.incident.actionReq')
        var incident = {
            type: {
                id: vm.newType[0].id,
                name: vm.newType[0].name
            },
            description: vm.incident.description,
            quantity: vm.incident.quantity,
            unit_name: vm.local.unit_name,
            unit_id: vm.local.unit_id,
            action_required: vm.action_required[0]
        }
        if ((vm.editMode) && (vm.index !== 'create')) {
            vm.create.incidents[vm.index] = incident
        } else {
            vm.create.incidents.push(incident);
        }

        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('incidents');
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
