sdApp.controller('ProjectsCtrl', [
	'$rootScope',
	'$state',
	'SyncService',
	'SettingService',
	function ($rootScope, $state, SyncService, SettingService) {
		var vm = this;
		vm.go = go;
		vm.header = 'Select a project';
		vm.username = localStorage.getObject('dsremember');
		vm.local = {};
		$rootScope.projectName = '';
		vm.local.data = {};
		vm.loggedIn = localStorage.getObject('loggedIn');
		
		SyncService.getProjects(function (result) {
			vm.projects = result;
			var projIds = "";
			angular.forEach(vm.projects, function (proj) {
				projIds += proj.id + ", ";
			})
		}, function (err) {
			SettingService.show_message_popup('Error', '<span>Could not get the projects from store!</span>');
		});
		
		
		function go(project) {
			sessionStorage.setObject('projectId', project.id);
			$rootScope.projectName = project.value.name;
			$state.go('app.project', {
				id: project.id
			});
		}
	}
]);
