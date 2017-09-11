sdApp.controller('CommentsCtrl', CommentsCtrl)

CommentsCtrl.$inject = ['$rootScope', '$state', '$stateParams', '$filter', 'SiteDiaryService', 'ProjectService', 'SyncService', 'orderByFilter', '$ionicPopup', 'SettingService'];

function CommentsCtrl($rootScope, $state, $stateParams, $filter, SiteDiaryService, ProjectService, SyncService, orderBy, $ionicPopup, SettingService) {
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
	// SyncService.getProject(sessionStorage.getObject('projectId'), function (proj) {
	// 	$rootScope.currentSD = proj.temp;
	// 	//if create is not loaded correctly, redirect to home and try again
	// 	if ($rootScope.currentSD === null || $rootScope.currentSD === {}) {
	// 		SettingService.show_message_popup("Error", '<span>An unexpected error occured and Site Diary did not load properly.</span>');
	// 		$state.go('app.home');
	// 		return;
	// 	}
	// 	vm.local.list = $rootScope.currentSD.comments || [];
	// 	vm.diaries = orderBy(proj.value.site_diaries, 'date', true);
	// 	//adding colors to tiles by user
	// 	angular.forEach(vm.local.list, function (value, key) {
	// 		var aux = $filter('filter')(vm.diaries, {
	// 			id: (value.site_diary_id)
	// 		})[0];
	// 		vm.local.list[key].color = aux.color;
	// 	});
	// });

	initFields();

	function initFields(){
		vm.local.list = $rootScope.currentSD.comments || [];
		//adding colors to tiles by user
		angular.forEach(vm.local.list, function (value, key) {
			var aux = $filter('filter')(vm.diaries, {
				id: (value.site_diary_id)
			})[0];
			vm.local.list[key].color = aux.color;
		});
	}

	function addComment() {
		var seen = sessionStorage.getObject('sd.seen');
		seen.comment = true;
		sessionStorage.setObject('sd.seen', seen);
		var comment = vm.local.comment;
		vm.local.comment = "";
		angular.forEach(vm.local.list, function (value, key) {
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
				if (!$rootScope.currentSD.comments || !$rootScope.currentSD.comments.length) {
					$rootScope.currentSD.comments = [];
				}
				$rootScope.currentSD.comments.push(request);
				vm.local.list = $rootScope.currentSD.comments;
				// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
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
				// SyncService.update_temp_sd(sessionStorage.getObject('projectId'), $rootScope.currentSD);
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
