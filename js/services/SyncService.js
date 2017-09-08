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
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
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
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
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
		
		service.setProjects = function (data, callback) {
			try {
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
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
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
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
			try {
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
						callback(ev.data.results);
					}
				});
				
				worker.postMessage({
					data: {id: id},
					operation: 'getProject'
				});
				
			} catch (e) {
				throw ('Error getting data: ' + e);
			}
		};
		
		service.clearDb = function (callback) {
			try {
				worker = new Worker('/js/system/worker.js');
				
				worker.addEventListener('message', function (ev) {
					if (ev.data.finished === true) {
						worker.terminate();
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
			if (localStorage.getObject('isLoggedIn')) {
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
		
		service.update_temp_sd = function (projId, temp) {
			service.getProject(projId, function (proj) {
				proj.temp = temp;
				service.setProjects([proj], function () {
					console.log('Temp set on project');
				});
			});
		};
		
		service.sync = function () {
			var deferred = $q.defer();
			if (navigator.onLine) {
				service.login().then(function (res) {
					if (res === "logged") {
						service.getme()
							.success(function (data) {
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
								
								function addDiariesDetails(projects) {
									var def = $q.defer();
									angular.forEach(projects, function (project) {
										if (project.value.diaries.length) {
											var diaries = project.value.diaries;
											angular.forEach(diaries, function (diary) {
												//store details for SDs
												SiteDiaryService.list_diary(diary.id).then(function (data) {
													diary.data = data;
													//store comments for SDs
													var listComm = SiteDiaryService.list_comments(diary.id).then(function (result) {
														if (diary.data) {
															diary.data.comments = result;
														}
													});
													//store attachments for SDs
													var getAtt = AttachmentsService.get_attachments(diary.id).then(function (result) {
														diary.data.attachments = {
															pictures: result
														};
													});
													Promise.all([listComm, getAtt]).then(function (res) {
														if (diaries[diaries.length - 1] === diary) {
															$timeout(function () {
																//sttore data for current diary
																//saveChanges(project);
																//last project and last diary
																if ((projects[projects.length - 1] === project)) {
																	$timeout(function () {
																		def.resolve(projects);
																	}, 500);
																}
															}, 500);
														}
													})
												});
											});
										} else {
											//no diaries and last project
											if ((projects[projects.length - 1] === project)) {
												$timeout(function () {
													def.resolve(projects);
												}, 5000);
											}
										}
									});
									return def.promise;
								}
								
								function addDiaries(projects) {
									var def = $q.defer();
									angular.forEach(projects, function (project) {
										//get a list of all diaries for project having the given id
										SiteDiaryService.list_diaries(project.id).then(function (diaries) {
											//store diaries for project
											project.value.diaries = diaries;
											//saveChanges(project);
											$timeout(function () {
												if (projects[projects.length - 1] === project) {
													def.resolve(projects);
												}
											}, 100);
										});
									});
									return def.promise;
								}
								
								function getProjects() {
									var def = $q.defer();
									ProjectService.projects().then(function (projects) {
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
									});
									return def.promise;
								}
								
								function buildData() {
									var def = $q.defer();
									// get all the settings then insert them - this can be done in sync
									setCompanySettings(function (list) {
										setCompanyLists(list, function (lists) {
											service.setSettings(lists, function () {
												console.log('Setting inserted');
												//get projects then store locally - this can be done in sync
												getProjects().then(function (projects) {
													console.log('Projects gathered', projects);
													//no projects stored
													if (!projects.length) return def.resolve();
													//store diaries for stored projects
													addDiaries(projects).then(function (projects) {
														console.log('Diaries added', projects);
														//store diaries details
														addDiariesDetails(projects).then(function (projectsArray) {
															console.log('Diary details added', projectsArray);
															// store the projects in the DB
															service.setProjects(projectsArray, function (projects) {
																def.resolve(projects);
															});
														});
													});
												});
											});
										});
									});
									return def.promise;
								}
								
								function init() {
									service.clearDb(function () {
										buildData().then(function (projects) {
											if (!projects.length) deferred.resolve('sync_done');
											for (var i = 0; i < projects.length; i++) {
												var project = projects[i];
												if (tempSD !== {} && tempSD.project_id === project.id) {
													//store the temp SD on indexedDB
													project.temp = tempSD;
													service.setProjects([tempSD], function () {
														deferred.resolve('sync_done');
													});
													break;
												}
											}
										});
									});
								}
								
								var tempSD = {};
								if (sessionStorage.getObject('projectId')) {
									service.getProject(sessionStorage.getObject('projectId'), function (project) {
										console.log('Here', project);
										if (project.temp) tempSD = project.temp;
										init();
									});
								} else {
									init();
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
		
		service.addDiariesToSync = function () {
			var prm = $q.defer();
			if (navigator.onLine && localStorage.getObject('diariesToSync')) {
				service.login().then(function (res) {
					if (res === "logged") {
						var diariesToAdd = [];
						service.getProjects(function (projects) {
							angular.forEach(projects, function (project) {
								angular.forEach($filter('filter')(project.value.diaries, function (d) {
									return /^off.*/g.test(d.id);
								}), function (sd) {
									diariesToAdd.push(sd);
								})
							});
							localStorage.removeItem('diariesToSync');
							if (diariesToAdd && !diariesToAdd.length) {
								prm.resolve();
							}
							angular.forEach(diariesToAdd, function (diaryToAdd) {
								diaryToAdd.id = 0;
								SiteDiaryService.add_diary(diaryToAdd.data)
									.success(function (result) {
										var attachments = diaryToAdd.attachments;
										var attToAdd = [];
										angular.forEach(attachments.pictures, function (value) {
											if (!value.path) {
												value.site_diary_id = result.id;
												attToAdd.push(value);
											}
										});
										if (attToAdd) {
											AttachmentsService.upload_attachments(attToAdd).then(function (result) {
											});
										}
										var comments = diaryToAdd.data.comments;
										angular.forEach(comments, function (value) {
											var request = {
												site_diary_id: result.id,
												comment: value.comment
											};
											SiteDiaryService.add_comments(request).then(function (result) {
											});
										});
										if (diariesToAdd[diariesToAdd.length - 1] === diaryToAdd) {
											prm.resolve();
										}
									}).error(function (err) {
									if (diariesToAdd[diariesToAdd.length - 1] === diaryToAdd) {
										prm.resolve();
									}
								})
							})
						});
					} else {
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