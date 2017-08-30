angular.module($APP.name).controller('CommentsCtrl', CommentsCtrl)

CommentsCtrl.$inject = ['$rootScope', '$state', '$stateParams', '$filter', 'SiteDiaryService', 'ProjectService', '$indexedDB', 'orderByFilter', '$ionicPopup', 'SettingService'];

function CommentsCtrl($rootScope, $state, $stateParams, $filter, SiteDiaryService, ProjectService, $indexedDB, orderBy, $ionicPopup, SettingService) {
    var vm = this;
    vm.go = go;
    vm.getInitials = getInitials;
    vm.addComentAtEnter = addComentAtEnter;
    vm.addComment = addComment;
    vm.local = {};
    vm.diaryId = sessionStorage.getObject('diaryId');
    vm.editMode = sessionStorage.getObject('editMode');
    vm.local.comments = sessionStorage.getObject('sd.comments');
    vm.loggedIn = localStorage.getObject('loggedIn');
    vm.myProfile = localStorage.getObject('my_account');
    $indexedDB.openStore('projects', function(store) {
        store.find(sessionStorage.getObject('projectId')).then(function(proj) {
            vm.create = proj.temp;
            //if create is not loaded correctly, redirect to home and try again
            if (vm.create == null || vm.create == {}) {
                SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
                $state.go('app.home');
                return;
            }
            vm.local.list = vm.create.comments || [];
            vm.diaries = orderBy(proj.value.diaries, 'date', true);
            //adding colors to tiles by user
            angular.forEach(vm.local.list, function(value, key) {
                var aux = $filter('filter')(vm.diaries, {
                    id: (value.site_diary_id)
                })[0];
                vm.local.list[key].color = aux.color;
            });
        });
    });

    function addComment() {
        var seen = sessionStorage.getObject('sd.seen');
        seen.comment = true;
        sessionStorage.setObject('sd.seen', seen);
        var comment = vm.local.comment;
        vm.local.comment = "";
        angular.forEach(vm.local.list, function(value, key) {
            if (value.first_name === vm.myProfile.first_name) vm.color = value.color;
        });
        if (!vm.diaryId) {
            if (comment) {
                var request = {
                    comment: comment,
                    first_name: vm.myProfile.first_name,
                    last_name: vm.myProfile.last_name,
                    date: new Date(),
                    color: vm.color
                };
                if (!vm.create.comments || !vm.create.comments.length) {
                    vm.create.comments = [];
                }
                vm.create.comments.push(request);
                vm.local.list = vm.create.comments;
                SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
            }
        } else {
            if (comment) {
                var request = {
                    site_diary_id: vm.diaryId,
                    comment: comment,
                    first_name: vm.myProfile.first_name,
                    last_name: vm.myProfile.last_name,
                    date: new Date(),
                    color: vm.color
                };
                var commToAdd = {
                    site_diary_id: vm.diaryId,
                    comment: comment
                };
                vm.local.list.push(request);
                if (!vm.local.comments || (vm.local.comments && !vm.local.comments.length)) {
                    vm.local.comments = [];
                }
                vm.local.comments.push(commToAdd);
                sessionStorage.setObject('sd.comments', vm.local.comments); //TODO:
                //store in indexedDB the new info for SD
                SettingService.update_temp_sd(sessionStorage.getObject('projectId'), vm.create);
            }
        }
        $('textarea').css({
            'height': '45px',
            'overflow-y': 'hidden'
        });
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
