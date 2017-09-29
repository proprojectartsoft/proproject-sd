sdApp.service('SyncService', [
	'$q',
	'$http',
	'$timeout',
	'$ionicPopup',
	'$state',
	'$filter',
	'pendingRequests',
	'SettingService',
	'AuthService',
	'IndexedService',
	'PostService',
	function ($q, $http, $timeout, $ionicPopup, $state, $filter, pendingRequests,
	          SettingService, AuthService, IndexedService, PostService) {

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
						PostService.post({
							method: 'GET',
							url: 'me',
							data: {}
						}, function () {
							service.clearDb(function () {
								buildData().then(
									function () {
										deferred.resolve('sync_done');
									},
									function (reason) {
										deferred.reject(reason);
									}
								);
							});

							function getAllSettings(callback) {
								var lists = [];

								var getFromServer = function (url, name, optionalFunc, isCompany) {
									var sdef = $q.defer();
									PostService.post({
										url: url,
										method: 'GET',
										data: {}
									}, function (result) {
										if (optionalFunc)
											optionalFunc(result.data);
										if (!isCompany)
											lists.push({
												name: name,
												value: result.data
											});
										sdef.resolve();
									}, function (error) {
										if (!isCompany)
											lists.push({
												name: name,
												value: []
											});
										// SettingService.close_all_popups();
										console.log("Could not get setting from server: ", error);
										sdef.resolve();
									});
									return sdef.promise;
								};

								var resourceReq = getFromServer('resource', 'resources'),
									staffReq = getFromServer('staff', 'staff'),
									unitReq = getFromServer('unit', 'units'),
									settingsReq = getFromServer('companysettings', null, function (data) {
										angular.forEach(data, function (res) {
											lists.push({
												name: res.name,
												value: res.value
											});
										});
									}, true);

								var absenceReq = getFromServer('absenteeismreasons/list', 'absence', function (data) {
									angular.forEach(data, function (value) {
										value.name = value.reason;
									});
								});
								Promise.all([settingsReq, absenceReq, resourceReq, unitReq, staffReq]).then(function () {
									callback(lists);
								})
							}

							function getProjectsFromServer() {
								var def = $q.defer();
								PostService.post({
									url: 'sync/sd',
									method: 'GET',
									data: {}
								}, function (projects) {
									//there are no projects to store
									if (!projects.data.length) def.resolve([]);
									var projectsArray = [];
									angular.forEach(projects.data, function (value) {
										projectsArray.push({
											"id": value.id,
											"value": value
										});
									});
									def.resolve(projectsArray);
								}, function (error) {
									SettingService.close_all_popups(); //TODO: check where close all popups is needed
									console.log("Could not get projects from server: ", error);
									def.reject(err);
								});
								return def.promise;
							}

							function buildData() {
								var def = $q.defer();
								// get all the settings then insert them - this can be done in sync
								getAllSettings(function (lists) {
									service.setSettings(lists, function () {
										getProjectsFromServer().then(function (projects) {
											console.log(projects);
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
								return def.promise;
							}
						}, function (error) {
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

			return deferred.promise;
		};

		//method to add new diaries storred in indexedDB to server
		service.addDiariesToSync = function () {
			var prm = $q.defer();
			//if online and there are offline added diaries, add them to server
			if (navigator.onLine && localStorage.getObject('diariesToSync')) {
				service.login().then(function (res) {
					if (res === "logged") {
						service.getProjects(function (projects) {
							var diariesToAdd = [];

							//method to add the attachments for a sd to server
							function addAttachmentsForSd(attachments, sd_id) {
								var def = $q.defer(),
									cnt = 0;
								angular.forEach(attachments.pictures, function (value) {
									cnt++;
									//if attachment not already on server, add it
									if (!value.path) {
										value.site_diary_id = sd_id;
										//upload attachment
										PostService.post({
											url: 'sdattachment/uploadfile',
											method: 'POST',
											data: value
										}, function (result) {
											//last attachment uploaded
											if (cnt >= attachments.pictures.length) return def.resolve();
										}, function (error) {
											console.log("Could not upload attachment: ", error);
											//last attachment uploaded
											if (cnt >= attachments.pictures.length) return def.resolve();
										})
									}
								});
								return def.promise;
							}

							//method to add the comments for a sd to server
							function addCommentsForSd(comments, id) {
								var def = $q.defer(),
									cnt = 0;
								angular.forEach(comments, function (value) {
									cnt++;
									var request = {
										site_diary_id: id,
										comment: value.comment
									};
									//add comment
									PostService.post({
										url: 'sitediary/comment',
										method: 'POST',
										data: request
									}, function (result) {

										//last comment added
										if (cnt >= comments.length) return def.resolve();
									}, function (error) {
										console.log("Could not add comment: ", error);
										//last comment added
										if (cnt >= comments.length) return def.resolve();
									})

								});
								return def.promise;
							}

							//store shared diaries to server
							if (sessionStorage.getObject('sd.diary.shares')) {
								var shares = sessionStorage.getObject('sd.diary.shares');
								for (var a = 0; a < shares.length; a++) {
									PostService.post({
										url: 'sharesitediary',
										method: 'POST',
										params: {
											siteDiaryId: shares[a].id,
											email: shares[a].res
										},
										data: {}
									}, function (result) {
									}, function (error) {
										console.log("Could not share diaries: ", error);
									})
								}
							}

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

							//if there are diaries to be synced with the server, add them
							var count = 0;
							angular.forEach(diariesToAdd, function (sd) {
								console.log("foreach ", sd);
								//keep attachments and comments
								var attachments = [],
									comments = [];
								angular.copy(sd.attachments, attachments);
								angular.copy(sd.comments, comments);

								//prepare the format required by server and delete all fields used for local purpose
								sd.id = 0;
								delete sd.backColor;
								delete sd.foreColor;
								delete sd.attachments;
								delete sd.comments;
								delete sd.sd_no;

								//add the diaries to server
								PostService.post({
									url: 'sitediary',
									method: 'POST',
									data: sd
								}, function (result) {
									var attToAdd = addAttachmentsForSd(attachments, result.data.id),
										commentsToAdd = addCommentsForSd(comments, result.data.id);
									count++;

									Promise.all([attToAdd, commentsToAdd]).then(function (res) { //TODO: check if not needed also in error clause
										console.log("syncService addDiariesToSync all diaries added (Promise all)");
										//last diary added along with its attachments and comments
										if (count >= diariesToAdd.length) {
											prm.resolve();
										}
									});
								}, function (error) {
									console.log("Could not add diary to server: ", error);
									count++;
									if (count >= diariesToAdd.length) {
										prm.resolve();
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
