sdApp.controller('MainCtrl', [
	'$rootScope',
	'$timeout',
	'$scope',
	'$state',
	function ($rootScope, $timeout, $scope, $state) {
		/**
		 * Method to go somewhere
		 * @param {String} where - app state to go to
		 * @param {Object} [params] - object with params to send
		 * @param {Boolean} [reload] - boolean to force reload of the page
		 */
		$rootScope.go = function (where, params, reload) {
			// this would be the forced reload of a profile page
			if (where === 'reload') {
				return $state.reload();
			}
			
			if (!reload) reload = false;
			if (!params) params = {};
			
			if (where === $state.current.name) {
				// This could bite us later, need it to reload the URLs with parameters included
				// params = {}
				reload = true;
			}
			
			var reloadParam = {
				'reload': reload
			};
			
			if (reload) {
				reloadParam.location = 'replace';
				reloadParam.inherit = false;
			}
			
			$state.go(where, params, reloadParam);
		};
		
	}
]);
