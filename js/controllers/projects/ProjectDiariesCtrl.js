angular.module($APP.name).controller('ProjectDiariesCtrl', ProjectDiariesCtrl)

ProjectDiariesCtrl.$inject = [
  '$scope',
  '$timeout',
  '$ionicModal',
  '$ionicPopup',
  '$state',
  '$stateParams',
  '$indexedDB',
  'SiteDiaryService',
  'SettingService',
  'SharedService',
  'SyncService',
  'orderByFilter'
];

function ProjectDiariesCtrl($scope, $timeout, $ionicModal, $ionicPopup, $state, $stateParams, $indexedDB, SiteDiaryService, SettingService, SharedService, SyncService, orderBy) {
  var vm = this, shares = [];
  vm.showDiary = showDiary;
  vm.backDiary = backDiary;
  vm.togglePlus = togglePlus;
  vm.go = go;
  vm.deleteDiary = deleteDiary;

  localStorage.setObject('sd.diary.create', null);
  localStorage.setObject('editMode', null);
  SettingService.clearWeather();
  localStorage.setObject('diaryId', null);
  localStorage.setObject('sd.attachments', null);
  localStorage.setObject('projectId', $stateParams.id);
  localStorage.setObject('sd.diary.shares', null);

  vm.offlineDiary = localStorage.getObject('diaryToSync');
  vm.filter = {};
  vm.shareId = {};
  vm.state = '';
  vm.show = false;
  vm.local = {};
  vm.local.data = {};
  vm.local.search = '';
  vm.selectOpt = [{
    id: 0,
    name: 'Annual leave'
  }, {
    id: 1,
    name: 'Inclement weather'
  }, {
    id: 2,
    name: 'No show'
  }, {
    id: 3,
    name: 'On other site'
  }, {
    id: 4,
    name: 'Public holiday'
  }, {
    id: 5,
    name: 'RDO'
  }, {
    id: 6,
    name: 'Sick leave'
  }, {
    id: 7,
    name: 'Unpaid leave'
  }, {
    id: 8,
    name: 'Training'
  }, {
    id: 9,
    name: 'Went home sick'
  }, {
    id: 10,
    name: 'Went to another project'
  }, {
    id: 11,
    name: 'Other'
  }];

  $indexedDB.openStore('projects', function(store) {
    vm.diaryModal = $ionicModal.fromTemplateUrl('templates/projects/diarySearch.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(popover) {
      vm.diaryModal = popover;
    });
    vm.projectId = parseInt($stateParams.id);
    store.find(vm.projectId).then(function(e) {
      localStorage.setObject('currentProj', e);
      vm.diary = e.value.diaries;
      vm.diaries = orderBy(e.value.diaries, 'date', true);
      vm.diaries = [vm.diaries[0], vm.diaries[1]];
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Aranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Branco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Cranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Dranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Eranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Franco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Zrnco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Zranco Vst"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Granco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Hranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Iranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"Jranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"kranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"lranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"mranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"nranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"oranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"pranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"qranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"rranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"sranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"tranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"uranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"vranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"wranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"xranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"anco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yran Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranco ist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranco Vst"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranco Vit"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranco Vis"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"ranco Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yanco Vifvfvst"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrnco Viasasst"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yraco dfvdfvVist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrano Vjmjmist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrasxxsnc Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrancdfs Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrauync Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrtanc Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"eryranc Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranc Visert"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranc Vistyu"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranc Viasst"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yranc fgVist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"yrangfc Vist"
      })
      vm.diaries.push({
        'created_for_date':0,
        'date':1500639817822,
        'id':"5971f24900336f51169b1792",
        'userName':"ysdfranc Vist"
      })
    });
  });

  $scope.filter = {};

  function createPopup(id) {
    return {
      template: '<input type="email" ng-model="filter.email">',
      title: 'Share form',
      subTitle: 'Please enter a valid e-mail address.',
      scope: $scope,
      buttons: [{
        text: '<i class="ion-person-add"></i>',
        onTap: function(e) {
          $scope.importContact(id);
        }
      }, {
        text: 'Cancel',
      }, {
        text: 'Send',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.filter.email) {
            e.preventDefault();
            var alertPopup = $ionicPopup.alert({
              title: 'Share',
              template: "",
              content: "Please insert a valid e-mail address.",
              buttons: [{
                text: 'OK',
                type: 'button-positive',
                onTap: function(e) {
                  alertPopup.close();
                }
              }]
            });
          } else {
            sendEmail($scope.filter.email, id);
          }
        }
      }]
    }
  }

  function sendEmail(res, id) {
    if (res && navigator.onLine) {
      var alertPopup1 = $ionicPopup.alert({
        title: "Sending email",
        template: "<center><ion-spinner icon='android'></ion-spinner></center>",
        content: "",
        buttons: []
      });
      SharedService.share_diary(id, res).then(function(response) {
          alertPopup1.close();
          if (response.message === "Site diary Shared!") {
            res = "";
            var alertPopup = $ionicPopup.alert({
              title: 'Share',
              template: 'Email sent.'
            });
            alertPopup.then(function(res) {});
          }
          localStorage.setObject('sd.diary.shares', null);
        },
        function(err) {
          alertPopup1.close();
          if (err.status == 422) {
            res = "";
            var alertPopup = $ionicPopup.alert({
              title: 'Share',
              template: 'Form already shared to this user.'
            });
          } else {
            var alertPopupC = $ionicPopup.alert({
              title: 'Share',
              template: 'An unexpected error occured while sending the e-mail.'
            });
          }
        });
    } else {
      $ionicPopup.alert({
        title: 'Share',
        template: 'The email will be sent once you go online.'
      });
      shares.push({id: id, res: res})
      localStorage.setObject('sd.diary.shares', shares);
    }
  }

  $scope.importContact = function(id) {
    $timeout(function() {
      navigator.contacts.pickContact(function(contact) {
        if (contact.emails) {
          $scope.filter.email = contact.emails[0].value;
          $timeout(function() {
            var popup = $ionicPopup.show(createPopup(id));
          });
        } else {
          var alertPopup1 = $ionicPopup.alert({
            title: 'Share',
            template: "",
            content: "No e-mail address was found. Please enter one manually.",
            buttons: [{
              text: 'OK',
              type: 'button-positive',
              onTap: function(e) {
                alertPopup1.close();
                var popup = $ionicPopup.show(createPopup(id));
              }
            }]
          });
        }
      }, function(err) {
        var alertPopup1 = SecuredPopups.show('alert', {
          title: "Import contact failed",
          template: 'An unexpected error occured while trying to import contact',
        });
        $timeout(function() {
          var popup = $ionicPopup.show(createPopup(id));
        });
      });
    });
  }

  $scope.data = {}; //TODO:
  $scope.showPopup = function(predicate) {
    //TODO: scope data here
    var popup = $ionicPopup.show(createPopup(predicate.id));
  };

  function deleteDiary(id) {
    $('.delete-btn').attr("disabled", true);
    $('.item-content').css('transform', '');
    var syncPopup = $ionicPopup.show({
      title: "Removing Site Diary",
      template: "<center><ion-spinner icon='android'></ion-spinner></center>",
      content: "",
      buttons: []
    });
    SiteDiaryService.delete_diary(id).success(function(result) {
      SyncService.addDiariesToSync().then(function() {
        SyncService.sync().then(function() {
          $('.delete-btn').attr("disabled", false);
          syncPopup.close();
          $state.reload();
        })
      })
    }).error(function(res) {
      syncPopup.close();
      var errPopup = $ionicPopup.show({
        title: "You are offline",
        template: "<center>You can remove Site Diaries when online.</center>",
        content: "",
        buttons: [{
          text: 'Ok',
          type: 'button-positive',
          onTap: function(e) {
            errPopup.close();
          }
        }]
      });
      $state.reload();
    })
  }

  function togglePlus() {
    vm.show = !vm.show;
  }

  function showDiary() {
    vm.diaryModal.show();
    vm.state = 'search';
  }

  function backDiary() {
    vm.diaryModal.hide();
    vm.show = false;
  }

  function saveDiary() {
    if (vm && vm.diaryModal) {
      vm.diaryModal.hide();
    }
  };

  function go(predicate, id) {
    $state.go('app.' + predicate, {
      id: id
    });
    vm.diaryModal.hide();
  }

  var red = 0, green = 0, blue = 0,
      colorsForName = {},
      contrastColors = ['navy', 'red', 'blue', 'teal', 'olive', 'orange',
        'green', 'blueviolet', 'maroon', 'fuchsia', 'purple', 'gray', 'violet'];
  $scope.getSdTitleColor = function(userName) {
    var nameExists = Object.keys(colorsForName).some(function(name) {
      return name === userName;
    })
    if(!nameExists) {
      if(Object.keys(colorsForName).length < contrastColors.length) {
        colorsForName[userName] = contrastColors[Object.keys(colorsForName).length];
      } else {
        if(red  + 50 <= 200) {
          red += 50;
        } else if(green + 50 <= 200) {
        	red = 0;
        	green += 50;
        } else if(blue + 50 <= 200) {
          red = 0;
        	green = 0;
        	blue += 50;
        }
        colorsForName[userName] = 'rgb(' + red + ', ' + green + ', ' + blue + ')'
      }
    }
    return colorsForName[userName];
  }


}
