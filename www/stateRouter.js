angular.module('toddlytics')
  .config(function ($stateProvider) {
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'directives/mainMenu.html',
        controller: "mainMenuCtrl",
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'directives/mainMenuController.js',
                'actions/actionsService.js',
                'authentication/authenticationService.js',
              ]
            });
          }]
        }
      })
      .state('pApp', {
        url: '/pApp',
        abstract: true,
        templateUrl: 'directives/parentMainMenu.html',
        controller: "parentMainMenuCtrl",
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'directives/parentMainMenuController.js',
              ]
            });
          }]
        }
      })
      .state('signin', {
        url: '/',
        templateUrl: 'authentication/signin.html',
        controller: "signInCtrl",
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'authentication/authenticationController.js',
                'authentication/authenticationService.js',
                'newsfeed/newsfeedService.js',
                'social/signupService.js'
              ]
            });
          }]
        }
      })
      .state('registrationSelection', {
        url: '/',
        templateUrl: 'registration/registrationSelection.html',
        controller: "registrationSelectionCtrl",
        cache: false,
        params: {
          user: null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'registration/registrationSelectionController.js'
              ]
            });
          }]
        }
      })
      .state('app.gettingStarted', {
        url: '/getting-started',
        views: {
          'MainMenuContent': {
            templateUrl: 'getting-started/getting-started.html',
            controller: "gettingStartedCtrl",
            name : "Getting Started",
          }
        },
        cache: false,
        params: {
          user: null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'getting-started/gettingStartedCtrl.js',
                'getting-started/gettingStartedService.js',
                'newsfeed/newsfeedService.js',
                'people/peopleService.js',
              ]
            });
          }]
        }
      })
      .state('pApp.inviteSchool', {
        url: '/inviteSchool',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'registration/parentInviteSchool.html',
            controller: "registrationSelectionCtrl",
            name : "Refer a School",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'registration/registrationSelectionController.js'
              ]
            });
          }]
        }
      })
      .state('pApp.referSchool', {
        url: '/referSchool',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'registration/parentReferSchool.html',
            controller: "registrationSelectionCtrl",
            name : "Refer School",
          }
        },
        params: {
          placeParams: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'registration/registrationSelectionController.js'
              ]
            });
          }]
        }
      })
      .state('schoolRegistration', {
        url: '/',
        templateUrl: 'registration/schoolRegistration.html',
        controller: "schoolRegistrationCtrl",
        cache: false,
        params: {
          user: null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'registration/schoolRegistrationController.js',
                'newsfeed/newsfeedService.js',
                'authentication/authenticationService.js',
              ]
            });
          }]
        }
      })
      .state('socialLogin', {
        url: '/',
        templateUrl: 'social/socialLogin.html',
        controller: "socialLoginCtrl",
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'social/socialLoginController.js'
              ]
            });
          }]
        }
      })
      .state('signup', {
        url: '/',
        templateUrl: 'social/signup.html',
        controller: "signupCtrl",
        params: {
          user: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'social/signupController.js',
                'newsfeed/newsfeedService.js',
                'social/signupService.js'
              ]
            });
          }]
        }
      })
      .state('app.schoolFinderMain', {
        url: '/',
        views: {
          'MainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderMain.html',
            controller: "schoolFinderMainCtrl",
            name : "School Finder",
          }
        },
        cache: true,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'schoolFinder/schoolFinderMainController.js'
              ]
            });
          }]
        }
      })
      .state('pApp.schoolFinderMain', {
        url: '/',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderMain.html',
            controller: "schoolFinderMainCtrl",
            name : "School Finder",
          }
        },
        cache: true,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleService.js',
                'newsfeed/newsfeedService.js',
                'schoolFinder/schoolFinderMainController.js'
              ]
            });
          }]
        }
      })
      .state('pApp.billing', {
        url: '/',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'billing/billing.html',
            controller: "billingCtrl",
            name : "Billing",
          }
        },
        cache: false,
        params: {
          push: null,
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleService.js',
                'newsfeed/newsfeedService.js',
                'billing/billingService.js',
                'billing/billingCtrl.js'
              ]
            });
          }]
        }
      })
      .state('pApp.profile', {
        url: '/profile',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'profile/profile.html',
            controller: "profileCtrl",
            name : "My Profile",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleService.js',
                'newsfeed/newsfeedService.js',
                'profile/profileService.js',
                'profile/profileCtrl.js',
                'authentication/authenticationService.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.myProfile', {
        url: '/profile',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'profile/profile.html',
            controller: "profileCtrl",
            name : "My Profile",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleService.js',
                'newsfeed/newsfeedService.js',
                'profile/profileService.js',
                'profile/profileCtrl.js',
                'authentication/authenticationService.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('app.profile', {
        url: '/profile',
        views: {
          'MainMenuContent': {
            templateUrl: 'profile/profile.html',
            controller: "profileCtrl",
            name : "My Profile",
          }
        },
        cache: true,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleService.js',
                'newsfeed/newsfeedService.js',
                'profile/profileService.js',
                'profile/profileCtrl.js',
                'authentication/authenticationService.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('app.schoolFinderSpecific', {
        url: '/',
        views: {
          'MainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderSpecific.html',
            controller: "schoolFinderSpecificCtrl",
            name : "School Finder Specific",
          }
        },
        cache: false,
        params : {obj : null},
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                  'schoolFinder/schoolFinderSpecificController.js',
                  'schoolFinder/schoolFinderService.js',
                  'kids/kidsService.js'
                  ]
            });
          }]
        }
      })
      .state('pApp.schoolFinderSpecific', {
        url: '/',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderSpecific.html',
            controller: "schoolFinderSpecificCtrl",
            name : "School Finder Specific",
          }
        },
        cache: false,
        params : {obj : null, myCoord : null},
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                  'schoolFinder/schoolFinderSpecificController.js',
                  'schoolFinder/schoolFinderService.js',
                  'kids/kidsService.js'
                  ]
            });
          }]
        }
      })
      .state('app.schoolFinderPrograms', {
        url: '/',
        views: {
          'MainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderPrograms.html',
            controller: "schoolFinderProgramsCtrl",
            name : "Programs",
          }
        },
        cache: false,
        params : {obj : null},
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                  'schoolFinder/schoolFinderProgramsController.js'
                  ]
            });
          }]
        }
      })
      .state('pApp.schoolFinderPrograms', {
        url: '/',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'schoolFinder/schoolFinderPrograms.html',
            controller: "schoolFinderProgramsCtrl",
            name : "Programs",
          }
        },
        cache: false,
        params : {obj : null},
        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
              return $ocLazyLoad.load({
                files: [
                  'schoolFinder/schoolFinderProgramsController.js'
                  ]
            });
          }]
        }
      })
      .state('app.newsfeed', {
        url: "/newsfeed",
        views: {
          'MainMenuContent': {
            templateUrl: 'newsfeed/newsfeed.html',
            controller: "newsfeedCtrl",
            name : "Newsfeed",
          }
        },
        cache: false,
        params: {
          push: null,
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'newsfeed/newsfeedController.js',
                'newsfeed/newsfeedService.js',
                'people/peopleService.js',
                'albums/albumsService.js',
                'actions/actionsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.newsfeed', {
        url: "/parentNewsfeed",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'newsfeed/newsfeed.html',
            controller: "newsfeedCtrl",
            name : "Newsfeed",
          }
        },
        cache: false,
        params: {
          push: null,
          refresh : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'newsfeed/newsfeedController.js',
                'newsfeed/newsfeedService.js',
                'people/peopleService.js',
                'albums/albumsService.js',
                'actions/actionsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.appointments', {
        url: "/",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'appointments/appointments.html',
            controller: "appointmentsCtrl",
            name : "My Appointments",
          }
        },
        cache: false,
        params: {
          push: null,
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'appointments/appointmentsCtrl.js',
                'appointments/appointmentsService.js',
                'authentication/authenticationService.js',
                'newsfeed/newsfeedService.js',
                'people/peopleService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.kids', {
        url: "/",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'kids/kids.html',
            controller: "kidsCtrl",
            name : "My Kids",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'kids/kidsCtrl.js',
                'kids/kidsService.js',
                'newsfeed/newsfeedService.js',
                'people/peopleService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.kid', {
        url: "/",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'kids/kid.html',
            controller: "kidCtrl",
            name : "Kid",
          }
        },
        params: {
          kid: null,
          adding: false,
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'kids/kidCtrl.js',
                'kids/kidsService.js',
                'newsfeed/newsfeedService.js',
                'albums/albumsService.js',
                'people/peopleService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.parentLanding', {
        url: "/parentLanding",
        views: {
          'ParentMainMenuContent': {
        templateUrl: 'landing/parent-landing.html',
        controller: "parentLandingCtrl",
        name : "Home",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'landing/parentLandingCtrl.js',
              ]
            });
          }]
        }
      })
      .state('app.calendar', {
        url: "/calendar",
        views: {
          'MainMenuContent': {
            templateUrl: 'calendar/calendar.html',
            controller: "calendarCtrl",
            name : "Calendar",
          }
        },
        cache: false,
        params : {
          obj : null,
          push : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'calendar/calendarController.js',
                'calendar/calendarService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.calendar', {
        url: "/parentCalendar",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'calendar/calendar.html',
            controller: "calendarCtrl",
            name : "Calendar",
          }
        },
        cache: false,
        params : {
          obj : null,
          publicCalendar : null,
          push : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'calendar/calendarController.js',
                'calendar/calendarService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.publicCalendar', {
        url: "/publicCalendar",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'calendar/calendar.html',
            controller: "calendarCtrl",
            name : "Calendar",
          }
        },
        cache: false,
        params : {
          obj : null,
          publicCalendar : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'calendar/calendarController.js',
                'calendar/calendarService.js'
              ]
            });
          }]
        }
      })
      .state('app.schoolFinderCalendar', {
        url: "/schoolFinderCalendar",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'calendar/calendar.html',
            controller: "calendarCtrl",
            name : "Calendar",
          }
        },
        cache: false,
        params : {
          obj : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'calendar/calendarController.js',
                'calendar/calendarService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.schoolFinderCalendar', {
        url: "/schoolFinderCalendar",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'calendar/calendar.html',
            controller: "calendarCtrl",
            name : "Calendar",
          }
        },
        cache: false,
        params : {
          obj : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'calendar/calendarController.js',
                'calendar/calendarService.js'
              ]
            });
          }]
        }
      })
      .state('app.settings', {
        url: "/settings",
        views: {
          'MainMenuContent': {
            templateUrl: 'settings/settings.html',
            controller: "settingsCtrl",
            name : "Settings",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'settings/settingsController.js',
              ]
            });
          }]
        }
      })
      .state('pApp.settings', {
        url: "/settings",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'settings/settings.html',
            controller: "settingsCtrl",
            name : "Settings",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'settings/settingsController.js',
              ]
            });
          }]
        }
      })
      .state('app.popupAlbums', {
        url: "/popupAlbums",
        views: {
          'MainMenuContent': {
            templateUrl: 'newsfeed/popupAlbums.html',
            controller: "popupAlbumsCtrl",
            name : "Select Albums",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'newsfeed/newsfeedController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.popupAlbums', {
        url: "/parentPopupAlbums",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'newsfeed/popupAlbums.html',
            controller: "popupAlbumsCtrl",
            name : "Select Albums",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'newsfeed/newsfeedController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('app.notifications', {
        url: "/notifications",
        views: {
          'MainMenuContent': {
            templateUrl: 'notifications/notifications.html',
            controller: "NotificationsCtrl",
            name : "Notifications",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'notifications/notificationsController.js',
                'notifications/notificationsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.notifications', {
        url: "/notifications",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'notifications/notifications.html',
            controller: "NotificationsCtrl",
            name : "Notifications",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'notifications/notificationsController.js',
                'notifications/notificationsService.js'
              ]
            });
          }]
        }
      })
      .state('app.composer', {
        url: '/composer?notifyType',
        views: {
          'MainMenuContent': {
            templateUrl: 'notifications/composer.html',
            controller: "ComposerCtrl",
            name : "Notifications",
          }
        },
        params: {
          info: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'notifications/composerController.js',
                'notifications/notificationsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.composer', {
        url: '/composer?notifyType',
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'notifications/composer.html',
            controller: "ComposerCtrl",
            name : "Notifications",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'notifications/composerController.js',
                'notifications/notificationsService.js'
              ]
            });
          }]
        }
      })
      .state('app.actions', {
        url: "/actions",
        views: {
          'MainMenuContent': {
            templateUrl: 'actions/actions.html',
            controller: "ActionsCtrl",
            name : "Actions"
          }
        },
        cache: false,
        params : {
          push : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'actions/actionsController.js',
                'actions/actionsService.js'
              ]
            });
          }]
        }
      })
      .state('app.addNewAction', {
        url: "/addNewAction",
        views: {
          'MainMenuContent': {
            templateUrl: 'actions/addNewAction.html',
            controller: "addNewActionCtrl",
            name : "Add New Action",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'actions/addNewActionController.js',
                'actions/actionsService.js'
              ]
            });
          }]
        }
      })
      .state('app.people', {
        url: "/people",
        views: {
          'MainMenuContent': {
            templateUrl: 'people/people.html',
            controller: 'PeopleCtrl',
            name : "People",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'people/peopleController.js',
                'studentDetails/studentDetailsService.js',
                'people/peopleService.js'
              ]
            });
          }]
        }
      })
      .state('app.albums', {
        url: "/albums",
        views: {
          'MainMenuContent': {
            templateUrl: 'albums/albums.html',
            controller: "AlbumsCtrl",
            name : "Gallery",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'albums/albumsController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.albums', {
        url: "/albums",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'albums/albums.html',
            controller: "AlbumsCtrl",
            name : "Albums",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'albums/albumsController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('app.photos', {
        url: "/photos",
        views: {
          'MainMenuContent': {
            templateUrl: 'albums/photos.html',
            controller: "PhotosCtrl",
            name : "Photos",
          }
        },
        params: {
          albumId: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'albums/photosController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('pApp.photos', {
        url: "/parentPhotos",
        views: {
          'ParentMainMenuContent': {
            templateUrl: 'albums/photos.html',
            controller: "PhotosCtrl",
            name : "Photos",
          }
        },
        cache: false,
        params : {
          photos : null
        },
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'albums/photosController.js',
                'albums/albumsService.js'
              ]
            });
          }]
        }
      })
      .state('app.studentDetails', {
        url: "/studentDetails",
        views: {
          'MainMenuContent': {
            templateUrl: 'studentDetails/studentDetails.html',
            controller: "studentDetailsCtrl",
            name : "Student Details",
          }
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'studentDetails/studentDetailsController.js',
                'studentDetails/studentDetailsService.js',
                'people/peopleService.js',
                'albums/albumsService.js',
                'newsfeed/newsfeedService.js'
              ]
            });
          }]
        }
      })
      .state('app.studentDetailsPopup', {
        url: "/studentDetailsPopup",
        views: {
          'MainMenuContent': {
            templateUrl: 'studentDetails/studentDetailsPopup.html',
            controller: "studentDetailsPopupCtrl",
            name : "Activities",
          }
        },
        params: {
          students: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'studentDetails/studentDetailsPopupController.js',
                'studentDetails/studentDetailsService.js'
              ]
            });
          }]
        }
      })
      .state('app.healthCheck', {
        url: "/healthCheck",
        views: {
          'MainMenuContent': {
            templateUrl: 'studentDetails/healthCheck.html',
            controller: "healthCheckCtrl",
            name : "Health Check",
          }
        },
        params: {
          students: null
        },
        cache: false,
        resolve: {
          deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            return $ocLazyLoad.load({
              files: [
                'studentDetails/studentDetailsController.js',
                'studentDetails/studentDetailsService.js'
              ]
            });
          }]
        }
      });
  });
