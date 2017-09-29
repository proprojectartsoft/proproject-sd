sdApp.controller('IncidentsCtrl', IncidentsCtrl);

IncidentsCtrl.$inject = ['$scope', '$state', '$ionicModal', '$stateParams', 'PostService',
    'SettingService', '$rootScope', 'SyncService'
];

function IncidentsCtrl($scope, $state, $ionicModal, $stateParams, PostService,
    SettingService, $rootScope, SyncService) {
    var vm = this;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addUnit = addUnit;
    vm.go = go;
    vm.deleteEntry = deleteEntry;
    vm.editMode = sessionStorage.getObject('editMode');
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.local = {};
    vm.index = $stateParams.id;
    vm.actionReq = 'incident.actionReq';
    vm.type = 'incident.type';
    vm.units = 'incident.units';
    vm.incident = {};
    vm.units = $rootScope.units;
	if (!$rootScope.currentSD) return $rootScope.go('app.home', {}, true);
	vm.incidents = $rootScope.currentSD.incidents;

    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
        vm.searchUnit = popover;
    });

    if (!isNaN(vm.index)) {
        vm.incident = $rootScope.currentSD.incidents[vm.index];
    }

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

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

    function showSearchUnit() {
        vm.settings = 'units';
        vm.searchUnit.show();
    }

    function backSearch() {
        vm.searchModal.hide();
        vm.searchUnit.hide();
    }

    function addUnit(item) {
        vm.incident.unit_id = item.id;
        vm.incident.unit_name = item.name;
        vm.searchUnit.hide();
    }

    function saveIncident() {
        var newType = sessionStorage.getObject('sd.diary.incident.type');
        var action_required = sessionStorage.getObject('sd.diary.incident.actionReq');
        var incident = {
            type: {
                id: newType && newType[0].id || '',
                name: newType && newType[0].name || ''
            },
            description: vm.incident && vm.incident.description || '',
            quantity: vm.incident && vm.incident.quantity || '',
            unit_name: vm.incident.unit_name,
            unit_id: vm.incident.unit_id,
            action_required: action_required && action_required[0] || ''
        };
        if (vm.index !== 'create') {
            $rootScope.currentSD.incidents[vm.index] = incident;
        } else {
            $rootScope.currentSD.incidents.push(incident);
        }
        vm.incidents = $rootScope.currentSD.incidents;
    }

    function deleteEntry(entry) {
        if (!navigator.onLine) {
            SettingService.show_message_popup('You are offline', "<center>You can remove incidents while online.</center>");
            return;
        }
        $('.item-content').css('transform', '');
        $rootScope.currentSD.incidents.forEach(function(el, i) {
            if (el === entry) {
                $rootScope.currentSD.incidents.splice(i, 1);
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
        if (predicate === "incidents" && ($rootScope.selected || vm.incident.type)) {
            saveIncident();
        }
        $rootScope.selected = undefined;
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
