sdApp.controller('NavCtrl', NavCtrl);

NavCtrl.$inject = ['$ionicSideMenuDelegate', '$rootScope', '$state', '$ionicPopup', 'AuthService', 'SyncService', '$timeout'];

function NavCtrl($ionicSideMenuDelegate, $rootScope, $state, $ionicPopup, AuthService, SyncService, $timeout) {
	var vm = this,
		loadingTemplate = "<center><ion-spinner icon='android'></ion-spinner></center>";
	vm.toggleSidemenu = toggleSidemenu;
	vm.sync = sync;
	vm.go = go;
	vm.logout = logout;
	vm.username = localStorage.getObject('dsremember');
	vm.loggedIn = localStorage.getObject('loggedIn');
	
	function toggleSidemenu($event) {
		$ionicSideMenuDelegate.toggleLeft();
	}
	
	function sync() {
		$ionicSideMenuDelegate.toggleLeft();
		if (navigator.onLine) {
			var syncPopup = loadingPopover("Sync", loadingTemplate, "loading");
		}
		SyncService.addDiariesToSync().then(function () {
			SyncService.sync().then(function () {
				if (syncPopup)
					syncPopup.close();
			});
		})
	}
	
	function go(predicate) {
		$state.go('app.' + predicate);
	}
	
	function logout() {
		if (navigator.onLine) {
			$state.go('login');
			localStorage.removeItem('dsremember');
			SyncService.clearDb(function (e) {
				AuthService.logout().then(function (result) {
					localStorage.setObject('loggedOut', true);
				});
			});
		} else {
			var errorTemplate = "<center>Can't log out now. You are offline.</center>";
			loadingPopover("Error", errorTemplate, "error");
		}
	}
	
	$rootScope.$watch(function () {
		return $ionicSideMenuDelegate.isOpen();
	}, function (isOpen) {
		$('#ds-menu-btn')
			.toggleClass("ion-navicon")
			.toggleClass("ion-android-arrow-back");
	});
	
	function loadingPopover(title, template, loadingOrError) {
		var pop = $ionicPopup.show({
			title: title,
			template: template,
			content: "",
			buttons: loadingOrError === "error" ? [{
				text: 'Ok',
				type: 'button-positive',
				onTap: function () {
					pop.close();
				}
			}] : []
		});
		return pop;
	}
}