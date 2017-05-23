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
    vm.loggedIn = localStorage.getObject('loggedIn')
    ProjectService.my_account(vm.loggedIn.id).then(function(result) {
        vm.myProfile = result;
    })

    SiteDiaryService.list_comments(vm.diaryId).then(function(result) {
        vm.local.list = result;
    })

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
                SiteDiaryService.add_comments(request)
                    .success(function(result) {
                        vm.local.comment = '';
                        SiteDiaryService.list_comments(vm.diaryId).then(function(result) {
                            vm.local.list = result
                        })
                    }).error(function(err) {
                        console.log("An unexpected error occured while adding a new comment");
                    })
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
