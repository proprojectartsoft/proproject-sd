sdApp.service('SyncService', [
	'$q',
	'$http',
	'$timeout',
	'$ionicPopup',
	'$state',
	'$filter',
	'ProjectService',
	'SiteDiaryService',
	'AttachmentsService',
	'SettingService',
	'AuthService',
	'SharedService',
	function ($q, $http, $timeout, $ionicPopup, $state, $filter,
	          ProjectService, SiteDiaryService, AttachmentsService, SettingService, AuthService, SharedService) {
		
		var service = this,
			worker = false;
		
		service.setSettings = function (data, callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data);
					}
				});
				
				worker.postMessage({
					data: data,
					operation: 'setSettings'
				});
				
			} catch (e) {
				throw ('Error setting data: ' + e);
			}
		};
		
		service.getSettings = function (callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data.results);
					}
				});
				
				worker.postMessage({
					data: {},
					operation: 'getSettings'
				});
				
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.getSetting = function (name, callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data.results[0]);
					}
				});
				
				worker.postMessage({
					data: {
						name: name
					},
					operation: 'getSetting'
				});
				
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.setProjects = function (data, callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data);
					}
				});
				
				worker.postMessage({
					data: data,
					operation: 'setProjects'
				});
				
			} catch (e) {
				throw ('Error setting data: ' + e);
			}
		};
		
		service.getProjects = function (callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data.results);
					}
				});
				
				worker.postMessage({
					data: {},
					operation: 'getProjects'
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
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev.data.results[0]);
					}
				});
				
				worker.postMessage({
					data: {
						id: id
					},
					operation: 'getProject'
				});
				
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.clearDb = function (callback) {
			try {
				worker = new Worker('js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					worker.terminate();
					if (ev.data.finished === true) {
						callback(ev);
					}
				});
				
				worker.postMessage({
					data: {},
					operation: 'eraseDb'
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
				user.username = localStorage.getObject('dsremember').username;
				user.password = localStorage.getObject('dsremember').password;
				user.remember = localStorage.getObject('dsremember').remember;
				user.id = localStorage.getObject('dsremember').id;
				AuthService.login(user).success(function () {
					prm.resolve("logged");
				}).error(function () {
					prm.resolve("error");
				})
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
									buildData().then(function (projects) {
										deferred.resolve('sync_done');
									});
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
										console.log(err);
									});
									return def.promise;
								}
								
								function buildData() {
									var def = $q.defer();
									// get all the settings then insert them - this can be done in sync
									setCompanySettings(function (list) {
										setCompanyLists(list, function (lists) {
											service.setSettings(lists, function () {
												//get projects then store locally - this can be done in sync
												getProjects().then(function (projects) {
													//no projects stored
													if (!projects.length) return def.resolve();
													service.setProjects(projects, function (projects) {
														def.resolve(projects);
													});
												});
											});
										});
									});
									return def.promise;
								}
							}).error(function (data, status) {
							deferred.resolve();
							if (!navigator.onLine) {
								var loggedIn = localStorage.getObject('dsremember');
								var offlinePopup = $ionicPopup.alert({
									title: "You are offline",
									template: "<center>You can sync your data when online</center>",
									content: "",
									buttons: [{
										text: 'Ok',
										type: 'button-positive',
										onTap: function (e) {
											offlinePopup.close();
										}
									}]
								});
								if (loggedIn) {
									$state.go('app.home');
								}
							}
						});
					} else {
						deferred.resolve();
						var offlinePopup = $ionicPopup.alert({
							title: "Error",
							template: "An unexpected error occured during authentication and sync could not be done. Please try again.",
							content: "",
							buttons: [{
								text: 'Ok',
								type: 'button-positive',
								onTap: function (e) {
									offlinePopup.close();
								}
							}]
						});
					}
				})
			} else {
				var loggedIn = localStorage.getObject('dsremember');
				deferred.resolve();
				var offlinePopup = $ionicPopup.alert({
					title: "You are offline",
					template: "<center>You can sync your data when online</center>",
					content: "",
					buttons: [{
						text: 'Ok',
						type: 'button-positive',
						onTap: function (e) {
							offlinePopup.close();
						}
					}]
				});
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
						var offlinePopup = $ionicPopup.alert({
							title: "Error",
							template: "An unexpected error occured during authentication and sync could not be done. Please try again.",
							content: "",
							buttons: [{
								text: 'Ok',
								type: 'button-positive',
								onTap: function (e) {
									offlinePopup.close();
								}
							}]
						});
					}
				});
			} else {
				prm.resolve();
			}
			return prm.promise;
		};
	}
]);
