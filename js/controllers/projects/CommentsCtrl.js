sdApp.controller('CommentsCtrl', CommentsCtrl);

CommentsCtrl.$inject = ['$rootScope', '$state', 'ColorService'];

function CommentsCtrl($rootScope, $state, ColorService) {
	var vm = this;
	vm.go = go;
	vm.getInitials = getInitials;
	vm.addComentAtEnter = addComentAtEnter;
	vm.addComment = addComment;
	vm.local = {};
	if (!$rootScope.currentSD) return $state.go('app.home', {}, {reload: true});
	vm.diaryId = sessionStorage.getObject('diaryId');
	vm.editMode = sessionStorage.getObject('editMode');
	vm.myProfile = localStorage.getObject('my_account');
	
	initFields();
	
	function initFields() {
		vm.local.list = $rootScope.currentSD.comments || [];
		ColorService.get_colors().then(function (colorList) {
			var colorsLength = Object.keys(colorList).length;
			//adding background colors by user and customer id
			angular.forEach(vm.local.list, function (value, key) {
				var colorId = (parseInt(vm.myProfile.customer_id + "" + (value.user_id || vm.myProfile.id))) % colorsLength;
				vm.local.list[key].backColor = colorList[colorId].backColor;
				vm.local.list[key].foreColor = colorList[colorId].foreColor;
			});
		})
	}
	
	function addComment() {
		ColorService.get_colors().then(function (colorList) {
			var colorsLength = Object.keys(colorList).length;
			//adding background colors by user and customer id
			var colorId = (parseInt(vm.myProfile.customer_id + "" + vm.myProfile.id)) % colorsLength;
			var request = {};
			if (vm.local.comment) {
				request = {
					comment: vm.local.comment,
					first_name: vm.myProfile.first_name,
					last_name: vm.myProfile.last_name,
					date: new Date(),
					backColor: colorList[colorId].backColor,
					foreColor: colorList[colorId].foreColor
				};
			}
			if (!vm.diaryId) {
				if (vm.local.comment) {
					if (!$rootScope.currentSD.comments || !$rootScope.currentSD.comments.length) {
						$rootScope.currentSD.comments = [];
					}
					$rootScope.currentSD.comments.push(request);
					vm.local.list = $rootScope.currentSD.comments;
				}
			} else {
				if (vm.local.comment) {
					request.site_diary_id = vm.diaryId;
					$rootScope.currentSD.comments.push(request);
					vm.local.list = $rootScope.currentSD.comments;
					var comm = sessionStorage.getObject('sd.comments') || [];
					comm.push({
						site_diary_id: vm.diaryId,
						comment: vm.local.comment
					});
					sessionStorage.setObject('sd.comments', comm);
				}
			}
			vm.local.comment = "";
			$('textarea').css({
				'height': '45px',
				'overflow-y': 'hidden'
			});
		})
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
		//id is undefined and it's an offline SD
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
