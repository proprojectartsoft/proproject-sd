angular.module($APP.name).config(appconfig)

function appconfig($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/util/menu.html",
            controller: 'NavCtrl as vm'
        })
        .state('forgot', {
            url: "/forgot/",
            templateUrl: "templates/util/forgotPassword.html",
            controller: 'LoginCtrl as vm'
        })
        .state('login', {
            url: "/login/",
            templateUrl: "templates/util/login.html",
            controller: 'LoginCtrl as vm'
        })
        .state('app.home', {
            url: "/home/",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/list.html",
                    controller: 'ProjectsCtrl as vm'
                }
            }
        })
        .state('app.account', {
            url: "/account/",
            views: {
                'menuContent': {
                    templateUrl: "templates/util/account.html",
                    controller: 'AccountCtrl as vm'
                }
            }
        })
        .state('app.shared', {
            url: "/shared/",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/shared.html",
                    controller: 'SharedCtrl as vm'
                }
            }
        })
        .state('app.project', {
            url: "/project/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/diaries.html",
                    controller: 'ProjectDiariesCtrl as vm'
                }
            }
        })
        .state('app.diary', {
            url: "/diary/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/diary.html",
                    controller: 'ProjectDiaryCtrl as vm'
                }
            }
        })
        .state('app.contractNotes', {
            url: "/contract-notes/",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/contract.html",
                    controller: 'ContractCtrl as vm'
                }
            }
        })
        .state('app.siteAttendance', {
            url: "/siteAttendance",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/siteAtt.html",
                    controller: 'SiteAttendanceCtrl as vm'
                }
            }
        })
        .state('app.staffMember', {
            url: "/siteAttendance/staff-member/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/staff-member.html",
                    controller: 'StaffMemberCtrl as vm'
                }
            }
        })
        .state('app.contractor', {
            url: "/siteAttendance/contractor/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/contractor.html",
                    controller: 'ContractorCtrl as vm'
                }
            }
        })
        .state('app.visitors', {
            url: "/siteAttendance/visitors/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/visitors.html",
                    controller: 'VisitorsCtrl as vm'
                }
            }
        })
        .state('app.weather', {
            url: "/weather/",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/weather.html",
                    controller: 'WeatherCtrl as vm'
                }
            }
        })
        .state('app.materials', {
            url: "/materials/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/materials.html',
                    controller: 'MaterialsCtrl as vm'
                }
            }
        }).state('app.comments', {
            url: "/comments/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/comments.html',
                    controller: 'CommentsCtrl as vm'
                }
            }
        }).state('app.sitenotes', {
            url: "/sitenotes/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/site-notes.html',
                    controller: 'SiteNotesCtrl as vm'
                }
            }
        }).state('app.supplier', {
            url: "/supplier/",
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/supplier.html",
                    controller: 'SupplierCtrl as vm'
                }
            }
        }).state('app.goods', {
            url: "/goods/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/goods.html',
                    controller: 'GoodsCtrl as vm'
                }
            }
        }).state('app.goodsUsed', {
            url: "/goods/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/goods-used.html',
                    controller: 'GoodsUsedCtrl as vm'
                }
            }
        })
        .state('app.item', {
            url: "/goods/goodsUsed/item/:id/:index",
            params: {
                id: null,
                index: null,
            },
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/item.html',
                    controller: 'ItemCtrl as vm'
                }
            }
        })
        .state('app.material', {
            url: "/materials/material/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/material.html",
                    controller: 'MaterialsCtrl as vm'
                }
            }
        })
        .state('app.incidents', {
            url: "/incidents/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/incidents.html',
                    controller: 'IncidentsCtrl as vm'
                }
            }
        })
        .state('app.incident', {
            url: "/incidents/incident/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/incident.html",
                    controller: 'IncidentsCtrl as vm'
                }
            }
        })
        .state('app.ohs', {
            url: "/ohs/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/ohs.html',
                    controller: 'OhsCtrl as vm'
                }
            }
        })
        .state('app.ohsadd', {
            url: "/ohs/ohsadd/:id",
            params: {
                id: null
            },
            views: {
                'menuContent': {
                    templateUrl: "templates/projects/ohsAdd.html",
                    controller: 'OhsCtrl as vm'
                }
            }
        })
        .state('app.attachements', {
            url: "/attachements/",
            views: {
                'menuContent': {
                    templateUrl: 'templates/projects/attachements.html',
                    controller: 'AttachementsCtrl as vm'
                }
            }
        })


    $urlRouterProvider.otherwise('/login/'); //hardcoded for start
}
