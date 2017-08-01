angular.module($APP.name).controller('OhsCtrl', OhsCtrl)

OhsCtrl.$inject = ['$state', '$stateParams', '$scope', 'SettingService', '$filter', 'SiteDiaryService', '$indexedDB', '$rootScope'];

function OhsCtrl($state, $stateParams, $scope, SettingService, $filter, SiteDiaryService, $indexedDB, $rootScope) {
    var vm = this;
    vm.go = go;
    vm.deleteEntry = deleteEntry;

    vm.local = {}
    vm.local.type = 'ohs.type';
    vm.create = localStorage.getObject('sd.diary.create');
    vm.diaryId = localStorage.getObject('diaryId');
    vm.index = $stateParams.id
    vm.editMode = localStorage.getObject('editMode');

    $scope.$watch(function() {
        if (vm.editMode)
            SettingService.show_focus();
    });

    if(!$rootScope.seen) $rootScope.seen = localStorage.getObject('sd.seen');

    if (!isNaN(vm.index) && !(vm.index === null)) {
        vm.type = vm.create.oh_and_s[vm.index].type;
        vm.task_completed = vm.create.oh_and_s[vm.index].task_completed;
        vm.form_complete = vm.create.oh_and_s[vm.index].form_to_be_completed;
        vm.ref = vm.create.oh_and_s[vm.index].ref;
        vm.action_required = vm.create.oh_and_s[vm.index].action_required;
        vm.action_message = vm.create.oh_and_s[vm.index].action;
        vm.comment = vm.create.oh_and_s[vm.index].note;
    }
    vm.types = [{
        id: 0,
        name: 'Toolbox Talk'
    }, {
        id: 1,
        name: 'Safety Walk'
    }, {
        id: 2,
        name: 'Incident/Accident Report'
    }, {
        id: 3,
        name: 'PPE Discussion'
    }];
    vm.tools = vm.create.oh_and_s;

    function save() {
        vm.backup = angular.copy(vm.create.incidents);
        vm.newType = localStorage.getObject('sd.diary.ohs.type');
        vm.oh_and_s = {
            type: {
                id: vm.newType && vm.newType[0].id || '',
                name: vm.newType && vm.newType[0].name || ''
            },
            task_completed: vm.task_completed,
            form_to_be_completed: vm.form_complete,
            action_required: vm.action_required,
            action: vm.action_message,
            note: vm.comment
        }
        if (vm.index !== 'create') {
            vm.create.oh_and_s[vm.index] = vm.oh_and_s;
        } else {
            vm.create.oh_and_s.push(vm.oh_and_s);
        }
        localStorage.setObject('sd.diary.create', vm.create);

        if (vm.diaryId) {
            var proj = localStorage.getObject('currentProj');
            var diary = $filter('filter')(proj.value.diaries, {
                id: (vm.diaryId)
            })[0];
            if ((vm.editMode) && (vm.index !== 'create')) {
                diary.data.oh_and_s[vm.index] = vm.oh_and_s;
            } else {
                diary.data.oh_and_s.push(vm.oh_and_s);
            }
            localStorage.setObject('currentProj', proj);
        }
    }

    function deleteEntry(entry){
        $('.item-content').css('transform', '');
        vm.create.oh_and_s.forEach(function(el, i) {
            if(el === entry){
              vm.create.oh_and_s.splice(i, 1);
            }
        })
        localStorage.setObject('sd.diary.create', vm.create);
        var proj = localStorage.getObject('currentProj');
        var diary = $filter('filter')(proj.value.diaries, {
            id: (vm.diaryId)
        })[0];
        diary.data.oh_and_s = vm.create.oh_and_s;
        localStorage.setObject('currentProj', proj);
        saveChanges(localStorage.getObject('currentProj'));
        SiteDiaryService.update_diary(vm.create);
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
        if (predicate == "ohs" && ($rootScope.selected || vm.type)){
            save();
            if(vm.editMode && JSON.stringify(vm.create.ohs) !==  JSON.stringify(vm.backup)) {
              $rootScope.seen.ohs = true;
            }
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
}

//directive for textarea so it can wrap the text and be scaleble
angular.module($APP.name).directive('elastic', [
    '$timeout',
    function($timeout) {
        return {
            restrict: 'A',
						link: function autoResizeLink(scope, element, attributes, controller) {

                  element.css({ 'height': '45px', 'overflow-y': 'hidden' });
                  $timeout(function () {
                      element.css('height', 45  + 'px');
                  }, 100);

                  element.on('input', function () {
                      element.css({ 'height': '45px', 'overflow-y': 'hidden' });
                      element.css('height', element[0].scrollHeight + 'px');
                  });
              }
        };
    }
]);
