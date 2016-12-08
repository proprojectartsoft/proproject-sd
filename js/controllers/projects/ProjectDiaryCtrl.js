angular.module($APP.name).controller('ProjectDiaryCtrl', ProjectDiaryCtrl)

ProjectDiaryCtrl.$inject = ['$rootScope', '$state', '$stateParams', 'SettingService', 'SiteDiaryService','AttachmentsService'];

function ProjectDiaryCtrl($rootScope, $state, $stateParams, SettingService, SiteDiaryService,AttachmentsService) {
    var vm = this;
    vm.go = go;
    vm.saveCreate = saveCreate;
    vm.toggle = toggle;
    vm.saveEdit = saveEdit;
    vm.createInit = localStorage.getObject('sd.diary.create');
    vm.cancelEdit = false;
    vm.local = {};
    vm.local.data = {};

    vm.edit = localStorage.getObject('editMode');
    if ($stateParams.id) {
        localStorage.setObject('diaryId', $stateParams.id);
        vm.enableCreate = false;
        if(vm.edit){
          vm.create = localStorage.getObject('sd.diary.create');
        }else{
          SiteDiaryService.list_diary($stateParams.id).then(function(result) {
              localStorage.setObject('sd.diary.create', result);
          });
          AttachmentsService.get_attachments($stateParams.id).then(function(result){
            var att = {
              pictures: result
            }
              localStorage.setObject('sd.attachments',att);
              console.log('First DB Call',att)
          });
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
            vm.comments = [];
            localStorage.setObject('sd.comments',vm.comments)
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
          var attachments = localStorage.getObject('sd.attachments');
          var attToAdd = [];
          angular.forEach(attachments.pictures,function(value){
            if (!value.path){
              value.site_diary_id= result;
              attToAdd.push(value);
            }
          });
          AttachmentsService.upload_attachments(attToAdd).then(function(result){
            console.log(result);
          });
          AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result){
            console.log(result);
          });
          vm.local.data.comments = localStorage.getObject('sd.comments');
          angular.forEach(vm.local.data.comments, function(value){
            var request = {
              site_diary_id: result.data.id,
              comment: value,
            };
            SiteDiaryService.add_comments(request).then(function(result){});
          })
          vm.go('project');
        });

    }
    function saveEdit(){
      vm.edit = false;
      localStorage.setObject('editMode',vm.edit);
      vm.create = localStorage.getObject('sd.diary.create');
      console.log(vm.create);
      SiteDiaryService.update_diary(vm.create).then(function(result){
        vm.go('project');
      })
      var attachments = localStorage.getObject('sd.attachments');
      var attToAdd = [];
      angular.forEach(attachments.pictures,function(value){
        if (!value.path){
          attToAdd.push(value);
        }
      });
      AttachmentsService.upload_attachments(attToAdd).then(function(result){
        console.log(result);
      });
      AttachmentsService.delete_attachments(attachments.toBeDeleted).then(function(result){
        console.log(result);
      });


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
