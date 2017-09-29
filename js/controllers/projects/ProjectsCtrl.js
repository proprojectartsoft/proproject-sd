sdApp.controller('ProjectsCtrl', [
	'$rootScope',
	'$scope',
	'$state',
	'SyncService',
	'SettingService',
	'$filter',
	function ($rootScope, $scope, $state, SyncService, SettingService, $filter) {
		var vm = this;
		vm.go = go;
		vm.header = 'Select a project';
		vm.username = localStorage.getObject('sdremember');
		vm.local = {};
		$rootScope.projectName = '';
		vm.local.data = {};
		$rootScope.currentSD = null;
		vm.projects = $rootScope.projects;

		// running only on REFRESH
		if (!vm.projects) {
			SyncService.getProjects(function (result) {
				setTimeout(function () {
					$scope.$apply(function () {
						vm.projects = $rootScope.projects = result;
					})
				}, 100);
			}, function (err) {
				SettingService.show_message_popup('Error', '<span>Could not get the projects from store!</span>');
			});
			//get necessary settings for company
			SyncService.getSettings(function (lists) {
				lists = angular.copy(lists.settings);
				var getFiltered = function (item) {
					var filtered = $filter('filter')(lists, {
						name: item
					}, true);
					if (filtered && filtered.length) return filtered[0];
					return {
						value: false
					};
				};
				$rootScope.units = getFiltered('units').value;
				$rootScope.absence = getFiltered('absence').value;
				$rootScope.staff = getFiltered('staff').value;
				$rootScope.resources = getFiltered('resources').value;
				$rootScope.currency = getFiltered('currency').value || 'GBP';
				$rootScope.start = getFiltered('start').value;
				$rootScope.finish = getFiltered('finish').value;
				$rootScope.break = getFiltered('break').value;
			});
		}

		function go(project) {
			sessionStorage.setObject('projectId', project.id);
			$rootScope.projectName = project.value.name;
			$rootScope.go('app.project', {
				id: project.id
			});
		}
	}
]);
