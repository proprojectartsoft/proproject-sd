angular.module($APP.name).controller('CommentsCtrl', CommentsCtrl)

CommentsCtrl.$inject = ['$rootScope', '$state', '$stateParams', 'SiteDiaryService', 'ProjectService'];

function CommentsCtrl($rootScope, $state, $stateParams, SiteDiaryService, ProjectService) {
    var vm = this;
    vm.go = go;
    vm.getInitials = getInitials;
    vm.addComentAtEnter = addComentAtEnter;
    vm.addComment = addComment;

    vm.local = {};
    vm.diaryId = localStorage.getObject('diaryId');
    vm.editMode = localStorage.getObject('editMode');
    vm.local.comments = localStorage.getObject('sd.comments');
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.myProfile = localStorage.getObject('my_account');
    vm.create = localStorage.getObject('sd.diary.create');
    vm.local.list = vm.create.comments;

    function addComment() {
        var comment = vm.local.comment;
        vm.local.comment = "";
        if (!vm.diaryId) {
            if (comment) {
                var request = {
                    site_diary_id: vm.diaryId,
                    comment: comment,
                };
                var aux = {
                    comment: comment,
                    first_name: vm.myProfile.first_name,
                    date: new Date()
                }
                vm.local.comments.push(comment);
                vm.local.list.push(aux);
                localStorage.setObject('sd.comments', vm.local.comments);
            }
        } else {
            if (comment) {
                var request = {
                    site_diary_id: vm.diaryId,
                    comment: comment,
                };
                vm.local.list.push(request);
                var proj = localStorage.getObject('currentProj');
                var diary = $filter('filter')(proj.value.diaries, {
                    id: (vm.diaryId)
                })[0];
                diary.data.comments.push(request);
                localStorage.setObject('currentProj', proj);
            }
        }
    }

    function addComentAtEnter(event) {
        if (event.keyCode === 13) {
            vm.addComment();
        }
    }

    function getInitials(str) {
        var aux = str.split(" ");
        return (aux[0][0] + aux[1][0]).toUpperCase();
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
