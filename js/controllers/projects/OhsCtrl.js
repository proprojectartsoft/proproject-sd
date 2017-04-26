angular.module($APP.name).controller('OhsCtrl', OhsCtrl)

OhsCtrl.$inject = ['$state', '$stateParams', '$scope', 'SettingService'];

function OhsCtrl($state, $stateParams, $scope, SettingService) {
    var vm = this;
    vm.save = save;
    vm.go = go;
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

    if (!isNaN(vm.index) && !(vm.index === null)) {
        vm.type = vm.create.oh_and_s[vm.index].type;
        vm.task_completed = vm.create.oh_and_s[vm.index].task_completed;
        vm.form_complete = vm.create.oh_and_s[vm.index].form_to_be_completed;
        vm.ref = vm.create.oh_and_s[vm.index].ref;
        vm.action_required = vm.create.oh_and_s[vm.index].action_required;
        vm.action_message = vm.create.oh_and_s[vm.index].action;
        vm.comment = vm.create.oh_and_s[vm.index].note;
    }
    vm.type = [{
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
        if ((vm.editMode) && (vm.index !== 'create')) {
            vm.create.oh_and_s[vm.index] = vm.oh_and_s;
        } else {
            vm.create.oh_and_s.push(vm.oh_and_s);
        }
        localStorage.setObject('sd.diary.create', vm.create);
        vm.go('ohs');
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
