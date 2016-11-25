angular.module($APP.name).controller('CommentsCtrl', CommentsCtrl)

CommentsCtrl.$inject = ['$rootScope', '$state', '$stateParams', 'SiteDiaryService'];

function CommentsCtrl($rootScope, $state, $stateParams, SiteDiaryService) {
    var vm = this;
    vm.go = go;
    vm.getInitials = getInitials;
    vm.addComentAtEnter = addComentAtEnter;
    vm.addComment = addComment;

    vm.local = {};
    vm.diaryId = localStorage.getObject('diaryId');

    SiteDiaryService.list_comments(vm.diaryId).then(function(result){
      vm.local.list = result;
    })

    function addComment(){
      if(vm.local.comment){
        var request = {
          site_diary_id: vm.diaryId,
          comment: vm.local.comment,
        };
        SiteDiaryService.add_comments(request).then(function(result){
          vm.local.comment = '';
          SiteDiaryService.list_comments(vm.diaryId).then(function(result){
            vm.local.list = result
          })
        })
      }
    }

    function addComentAtEnter(event){
      if(event.keyCode === 13){
        vm.addComment();
      }
    }

    function getInitials(str) {
      var aux = str.split(" ");
      return (aux[0][0]+aux[1][0]).toUpperCase();
    }

    function go(predicate,id) {
        $state.go('app.'+predicate, {
            id: id
        });
    }
}
