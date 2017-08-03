angular.module($APP.name).controller('IncidentsCtrl', IncidentsCtrl)

IncidentsCtrl.$inject = ['$scope', '$state', '$ionicModal', '$stateParams', 'SiteDiaryService', 'SettingService', '$filter', '$indexedDB', '$rootScope'];

function IncidentsCtrl($scope, $state, $ionicModal, $stateParams, SiteDiaryService, SettingService, $filter, $indexedDB, $rootScope) {
    var vm = this;
    vm.showSearchUnit = showSearchUnit;
    vm.backSearch = backSearch;
    vm.addUnit = addUnit;
    vm.go = go;
    vm.deleteEntry = deleteEntry;

    vm.editMode = localStorage.getObject('editMode');
    vm.local = {};
    vm.index = $stateParams.id;
    vm.actionReq = 'incident.actionReq';
    vm.type = 'incident.type';
    vm.units = 'incident.units';
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.incidents = vm.create.incidents;

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

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

    vm.units = localStorage.getObject('companyLists').units;
    $ionicModal.fromTemplateUrl('templates/projects/_popover.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(popover) {
        vm.searchModal = popover;
        vm.searchUnit = popover;
    });

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
        var seen = localStorage.getObject('sd.seen');
        seen.incident = true;
        localStorage.setObject('sd.seen', seen);
    }

    function saveIncident() {
        vm.newType = localStorage.getObject('sd.diary.incident.type')
        vm.action_required = localStorage.getObject('sd.diary.incident.actionReq')
        var incident = {
            type: {
                id: vm.newType && vm.newType[0].id || '',
                name: vm.newType && vm.newType[0].name || ''
            },
            description: vm.incident && vm.incident.description || '',
            quantity: vm.incident && vm.incident.quantity || '',
            unit_name: vm.local.unit_name,
            unit_id: vm.local.unit_id,
            action_required: vm.action_required && vm.action_required[0] || ''
        }

        if (vm.index !== 'create') {
            vm.create.incidents[vm.index] = incident;
        } else {
            vm.create.incidents.push(incident);
            var seen = localStorage.getObject('sd.seen');
            seen.incident = true;
            localStorage.setObject('sd.seen', seen);
        }
        localStorage.setObject('sd.diary.create', vm.create);

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if ((vm.editMode) && (vm.index !== 'create')) {
                diary.data.incidents[vm.index] = incident;
            } else {
                diary.data.incidents.push(incident);
            }
            localStorage.setObject('currentProj', proj);
        }
    }

    function deleteEntry(entry){
        $('.item-content').css('transform', '');
        vm.create.incidents.forEach(function(el, i) {
            if(el === entry){
              vm.create.incidents.splice(i, 1);
            }
        })
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.incidents = vm.create.incidents;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        SiteDiaryService.update_diary(vm.create);
        var seen = localStorage.getObject('sd.seen');
        seen.incident = true;
        localStorage.setObject('sd.seen', seen);
    }

    function saveChanges(project) {
        $indexedDB.openStore('projects', function(store) {
            store.upsert(project).then(
                function(e) {},
                function(err) {
                    var offlinePopup = $ionicPopup.alert({
                        title: "Unexpected error",
                        template: "<center>An unexpected error occurred while trying to update Site Diary.</center>",
                        content: "",
                        buttons: [{
                            text: 'Ok',
                            type: 'button-positive',
                            onTap: function(e) {
                                offlinePopup.close();
                            }
                        }]
                    });
                }
            )
        })
    }

    function go(predicate, id) {
        if (predicate == "incidents" && ($rootScope.selected || vm.incident.type)){
            saveIncident();
        }
        $rootScope.selected = undefined;
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

    function watchChanges() {
        $("input").change(function() {
            var seen = localStorage.getObject('sd.seen');
            seen.incident = true;
            localStorage.setObject('sd.seen', seen);
        });
    }
    watchChanges();
}
