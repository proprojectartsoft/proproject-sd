angular.module($APP.name).controller('ProjectDiaryCtrl', ProjectDiaryCtrl)

ProjectDiaryCtrl.$inject = ['$rootScope', '$state', '$stateParams', 'SettingService', 'SiteDiaryService'];

function ProjectDiaryCtrl($rootScope, $state, $stateParams, SettingService, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.saveCreate = saveCreate;
    vm.toggle = toggle;
    vm.saveEdit = saveEdit;
    vm.createInit = localStorage.getObject('sd.diary.create');
    vm.cancelEdit = false;
    vm.edit = localStorage.getObject('editMode');
    if ($stateParams.id) {
        localStorage.setObject('diaryId', $stateParams.id);
        vm.enableCreate = false;
        if(vm.edit){
          vm.create = localStorage.getObject('sd.diary.create');
        }else{
          SiteDiaryService.list_diary($stateParams.id).then(function(result) {
              localStorage.setObject('sd.diary.create', result);
          })
        }

    } else {
      vm.enableCreate = true;
      localStorage.setObject('diaryId', false);
        if (vm.createInit === null) {
            vm.createInit = {
              weather: {},
              contract_notes: {},
              site_notes: {},
              site_attendance: {},
              incidents: [],
              plant_and_material_used: [],
              goods_received: [],
              oh_and_s: []
            };
            vm.createInit.site_attendance.staffs = [];
            vm.createInit.site_attendance.contractors = [];
            vm.createInit.site_attendance.visitors = [];
            localStorage.setObject('sd.diary.create', vm.createInit)
        }
    }

    vm.projectId = localStorage.getObject('projectId');


    function saveCreate() {
        vm.create = localStorage.getObject('sd.diary.create');
        vm.create.date = new Date().getTime();
        vm.create.summary = "Please"
        vm.create.project_id = localStorage.getObject('projectId');
        SiteDiaryService.add_diary(vm.create).then(function(result) {
            vm.go('project');
        })
    }
    function saveEdit(){
      vm.edit = false;
      localStorage.setObject('editMode',vm.edit);
      vm.create = localStorage.getObject('sd.diary.create');
      SiteDiaryService.update_diary(vm.create).then(function(result){
        vm.go('project');
      })

    }
    function toggle(){
      vm.edit = !vm.edit;
      localStorage.setObject('editMode',vm.edit)

    }
    function go(predicate, id) {
        if (predicate === 'project') {
            $state.go('app.' + predicate, {
                id: vm.projectId
            });
        } else {
            $state.go('app.' + predicate, {
                id: id
            });
        }
    }
}
