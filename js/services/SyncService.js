sdApp.service('SyncService', [
	'$q',
	'$http',
	'$timeout',
	'$ionicPopup',
	'$state',
	'$filter',
	'pendingRequests',
	'ProjectService',
	'SiteDiaryService',
	'AttachmentsService',
	'SettingService',
	'AuthService',
	'SharedService',
	'IndexedService',
	function ($q, $http, $timeout, $ionicPopup, $state, $filter, pendingRequests,
	          ProjectService, SiteDiaryService, AttachmentsService, SettingService, AuthService, SharedService, IndexedService) {
		
		var service = this;
		
		IndexedService.createDB(function () {
			console.log('DB creation done');
		});
		
		service.setSettings = function (data, callback) {
			try {
				IndexedService.runCommands({
					data: data,
					operation: 'setSettings'
				}, function (result) {
					callback(result);
				});
			} catch (e) {
				throw ('Error setting data: ' + e);
			}
		};
		
		service.getSettings = function (callback) {
			try {
				IndexedService.runCommands({
					data: {},
					operation: 'getSettings'
				}, function (result) {
					callback(result.results);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.getSetting = function (name, callback) {
			try {
				IndexedService.runCommands({
					data: {
						name: name
					},
					operation: 'getSetting'
				}, function (result) {
					callback(result.results[0]);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.setProjects = function (data, callback) {
			try {
				IndexedService.runCommands({
					data: data,
					operation: 'setProjects'
				}, function (result) {
					callback(result);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.getProjects = function (callback) {
			try {
				IndexedService.runCommands({
					data: {},
					operation: 'getProjects'
				}, function (result) {
					callback(result.results);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.getProject = function (id, callback) {
			if (!id) {
				return false;
			}
			try {
				IndexedService.runCommands({
					data: {
						id: id
					},
					operation: 'getProject'
				}, function (result) {
					callback(result.results[0]);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.clearDb = function (callback) {
			try {
				IndexedService.runCommands({
					data: {},
					operation: 'eraseDb'
				}, function (result) {
					callback(result);
				});
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.getme = function () {
			return $http.get($APP.server + '/api/me')
				.success(function (user) {
					return user;
				})
				.error(function (data, status) {
					return status;
				})
		};
		
		service.login = function () {
			var prm = $q.defer();
			if (sessionStorage.getObject('isLoggedIn')) {
				prm.resolve("logged");
			} else {
				var user = {};
				user.username = localStorage.getObject('sdremember').username;
				user.password = localStorage.getObject('sdremember').password;
				user.remember = localStorage.getObject('sdremember').remember;
				user.id = localStorage.getObject('sdremember').id;
				AuthService.login(user, function () {
					prm.resolve("logged");
				}, function () {
					prm.resolve("error");
				});
			}
			return prm.promise;
		};
		
		service.sync = function () {
			var deferred = $q.defer();
			if (navigator.onLine) {
				service.login().then(function (res) {
					if (res === "logged") {
						service.getme()
							.success(function (data) {
								service.clearDb(function () {
									buildData().then(
										function () {
											deferred.resolve('sync_done');
										}, function (reason) {
											deferred.reject(reason);
										}
									);
								});
								
								function setCompanySettings(callback) {
									SiteDiaryService.get_company_settings().success(function (sett) {
										var lists = [];
										angular.forEach(sett, function (res) {
											lists.push({
												name: res.name,
												value: res.value
											});
										});
										callback(lists);
									})
								}
								
								function setCompanyLists(lists, callback) {
									var absenceReq = SiteDiaryService.absence_list().success(function (result) {
											angular.forEach(result, function (value) {
												value.name = value.reason;
											});
											lists.push({
												name: 'absence',
												value: result
											});
										}).error(function (err) {
											lists.push({
												name: 'absence',
												value: []
											});
										}),
										resourceReq = SiteDiaryService.get_resources().success(function (result) {
											lists.push({
												name: 'resources',
												value: result
											});
										}).error(function (err) {
											lists.push({
												name: 'resources',
												value: []
											});
										}),
										unitReq = SiteDiaryService.get_units().success(function (result) {
											lists.push({
												name: 'units',
												value: result
											});
										}).error(function (err) {
											lists.push({
												name: 'units',
												value: []
											});
										}),
										staffReq = SiteDiaryService.get_staff().success(function (result) {
											lists.push({
												name: 'staff',
												value: result
											});
										}).error(function (err) {
											lists.push({
												name: 'staff',
												value: []
											});
										});
									Promise.all([absenceReq, resourceReq, unitReq, staffReq]).then(function () {
										callback(lists);
									})
								}
								
								function getProjects() {
									var def = $q.defer();
									ProjectService.sync_projects().success(function (projects) {
										//there are no projects to store
										if (!projects.length) def.resolve([]);
										var projectsArray = [];
										angular.forEach(projects, function (value) {
											projectsArray.push({
												"id": value.id,
												"value": value
											});
										});
										def.resolve(projectsArray);
									}).error(function (err) {
										console.log('Server error getting projects', err);
										def.reject(err);
									});
									return def.promise;
								}
								
								function buildData() {
									var def = $q.defer();
									// get all the settings then insert them - this can be done in sync
									setCompanySettings(function (list) {
										setCompanyLists(list, function (lists) {
											service.setSettings(lists, function () {
												getProjects().then(function (projects) {
													//no projects stored
													if (!projects || !projects.length) return def.resolve();
													service.setProjects(projects, function (projects) {
														def.resolve(projects);
													});
												}, function (reason) {
													def.reject('Error loading projects from the server. Reason: ' + reason);
												});
											});
										});
									});
									return def.promise;
								}
							}).error(function (data, status) {
							deferred.resolve();
							if (!navigator.onLine) {
								var loggedIn = localStorage.getObject('sdremember');
								SettingService.show_message_popup("You are offline", "<center>You can sync your data when online</center>");
								if (loggedIn) {
									$state.go('app.home');
								}
							}
						});
					} else {
						deferred.resolve();
						SettingService.show_message_popup("Error", "An unexpected error occured during authentication and sync could not be done. Please try again.");
					}
				})
			} else {
				var loggedIn = localStorage.getObject('sdremember');
				deferred.resolve();
				SettingService.show_message_popup("You are offline", "<center>You can sync your data when online</center>");
				if (loggedIn) {
					$state.go('app.home');
				}
			}
			
			if (sessionStorage.getObject('sd.diary.shares')) {
				var shares = sessionStorage.getObject('sd.diary.shares');
				for (var a = 0; a < shares.length; a++) {
					SharedService.share_diary(shares[a].id, shares[a].res).then(function (result) {
					});
				}
			}
			return deferred.promise;
		};
		
		//method to add new diaries storred in indexedDB to server
		service.addDiariesToSync = function () {
			var prm = $q.defer();
			//if online and there are offline added diaries, add them to server
			if (navigator.onLine && localStorage.getObject('diariesToSync')) {
				service.login().then(function (res) {
					if (res === "logged") {
						var diariesToAdd = [];
						service.getProjects(function (projects) {
							//method to select all diaries added offline (id starts with "off")
							angular.forEach(projects, function (project) {
								angular.forEach($filter('filter')(project.value.site_diaries, function (d) {
									return /^off.*/g.test(d.id);
								}), function (sd) {
									diariesToAdd.push(sd);
								})
							});
							localStorage.removeItem('diariesToSync');
							//there are no diaries to be added to server
							if (diariesToAdd && !diariesToAdd.length) {
								prm.resolve();
							}
							var attToAdd = [],
								commentsToAdd = [];
							angular.forEach(diariesToAdd, function (diaryToAdd) {
								//keep attachments and comments
								var attachments = [],
									comments = [];
								angular.copy(diaryToAdd.attachments, attachments);
								angular.copy(diaryToAdd.comments, comments);
								//prepare the format required by server
								diaryToAdd.id = 0;
								//delete fields used for local purpose
								delete diaryToAdd.backColor;
								delete diaryToAdd.foreColor;
								delete diaryToAdd.attachments;
								delete diaryToAdd.comments;
								delete diaryToAdd.sd_no;
								//add the diaries to server
								SiteDiaryService.add_diary(diaryToAdd)
									.success(function (result) {
										angular.forEach(attachments.pictures, function (value) {
											if (!value.path) {
												value.site_diary_id = result.id;
												attToAdd.push(AttachmentsService.upload_attachment(value).then(function (result) {
												}));
											}
										});
										angular.forEach(comments, function (value) {
											var request = {
												site_diary_id: result.id,
												comment: value.comment
											};
											commentsToAdd.push(SiteDiaryService.add_comments(request).then(function (result) {
											}));
										});
										//last diary added along with its attachments and comments
										if (diariesToAdd[diariesToAdd.length - 1] === diaryToAdd) {
											Promise.all([attToAdd, commentsToAdd]).then(function (res) {
												prm.resolve();
											});
										}
									}).error(function (err) {
									if (diariesToAdd[diariesToAdd.length - 1] === diaryToAdd) {
										Promise.all([attToAdd, commentsToAdd]).then(function (res) {
											prm.resolve();
										});
									}
								})
							})
						});
					} else {
						//cannot authenticate on server with the stored credentials
						prm.resolve();
						SettingService.show_message_popup("Error", "An unexpected error occured during authentication and sync could not be done. Please try again.");
					}
				});
			} else {
				prm.resolve();
			}
			return prm.promise;
		};
	}
]);