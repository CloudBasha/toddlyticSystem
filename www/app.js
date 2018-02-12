// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in directives.js
var db = null;

angular.module('toddlytics', ['ionic', 'ngCordova', 'ng.deviceDetector', 'ionic.rating', 'ionic-datepicker', 'angular-carousel', 'angularMoment', 'angular.filter', 'ui.router', 'oc.lazyLoad', 'base64', 'ngMessages', 'google.places', 'onezone-datepicker', 'ionic-fancy-select',  'ionic-timepicker', 'isoCurrency', 'angular-timezone-selector',  'plug.ionic-segment'])

//  .constant('API_URL', 'https://dev.toddlytic.com/')
// .constant('API_URL', 'https://uat.toddlytic.com/')
//.constant('API_URL', 'https://sit.toddlytic.com/')
     .constant('API_URL', 'https://system.toddlytic.com/')
//    .constant('API_URL', 'http://192.168.1.123:8080/Toddlytics/')
//    .constant('API_URL', 'http://10.0.3.2:8080/Toddlytics/')

  .run(function ($rootScope, $ionicPlatform, $ionicSideMenuDelegate, iso4217, $ionicHistory, $location, $log, $timeout, $state, $cordovaSQLite, $cordovaNetwork, GlobalService, $cordovaSplashscreen, $cordovaPushV5, $cordovaDevice, authService) {


    moment.updateLocale('en', {
        calendar : {
        lastDay : '[Yesterday at] LT',
        sameDay : '[Today at] LT',
        nextDay : '[Tomorrow at] LT',
        lastWeek : '[last] dddd [at] LT',
        nextWeek : 'dddd [at] LT',
        sameElse : 'L [at] H[:]mm A'
      }
    });
    $rootScope._ = window._;
    $rootScope.Utils = {
       keys : Object.keys
    }
    // triggered every time notification received
    $rootScope.$on('$cordovaPushV5:notificationReceived', function(event, data){
      $log.debug("PUSH Message ", data);
      $rootScope.applyPushNotification(data);
    });

    // triggered every time error occurs
    $rootScope.$on('$cordovaPushV5:errorOcurred', function(event, e){
      $log.debug("PUSH Error ", e);
    });

    $rootScope.timeZone = moment.tz.guess(true);
    $rootScope.refreshBoolean = false;
    $rootScope.hardRefresh = true;
    $rootScope.takePictureBoolean = false;
    document.addEventListener("resume", onResume, false);

    function onResume() {
      $rootScope.hardRefresh = false;
      $rootScope.timeZone = moment.tz.guess(true);
      $log.debug("Time Zone Changed ", $rootScope.timeZone);

      var scope = angular.element(document.getElementById('toddlyticApp')).scope();
      var loginInfo = localStorage.getItem('token');
      $log.debug("token ", loginInfo);
      if(loginInfo != undefined){
        $timeout(function(){
          if(!$rootScope.refreshBoolean && !$rootScope.takePictureBoolean){
              $rootScope.refreshLogin();
          }
        }, 2000);
        if (!$rootScope.loginResponse.haveChild) {
          return;
        }
        else{
          scope.checkOfflineNewsFeedGlobal();
        }
      }
    }
   // $rootScope.imgURL = 'https://dev.toddlytic.com/';
//   $rootScope.imgURL = 'https://uat.toddlytic.com/';
// $rootScope.imgURL = 'https://sit.toddlytic.com/';
       $rootScope.imgURL = 'https://system.toddlytic.com/';
//   $rootScope.imgURL = 'http://192.168.1.123:8080/Toddlytics/';
//    $rootScope.imgURL = 'http://10.0.3.2:8080/Toddlytics/';

    $rootScope.toggleLeftMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };

    $rootScope.applyPushNotification = function(obj){
      if($rootScope.token !== ''){
        var localStudents = JSON.parse(localStorage.getItem('studentInfo'));
        var studentObj = _.filter(localStudents, function(o) { return o.studentId == obj.additionalData.studentId; });
        $rootScope.refreshBoolean = true;
        if($rootScope.loginResponse.type == "ADMIN" || $rootScope.loginResponse.type == "TEACHER"){
          var userType = 'app';
          if(obj.additionalData.state == 'newsfeed'){
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
          else if(obj.additionalData.state == 'login'){
            $state.go(userType+'.newsfeed', {push:obj});
          }
          else if(obj.additionalData.state == 'actions'){
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
          else if(obj.additionalData.state == 'newsletters'){
            $state.go(userType+'.'+notifications, {push:obj});
          }
        }
        else if($rootScope.loginResponse.type == "PARENT") {
          var userType = 'pApp';
          if(obj.additionalData.state == 'appointments'){
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
          else if(obj.additionalData.state == 'newsfeed'){
            if(obj.additionalData.studentId){
              $rootScope.setFavoriteStudent(studentObj[0],'newsfeed');
            }
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
          else if(obj.additionalData.state == 'billing'){
            $rootScope.setFavoriteStudent(studentObj[0],'billing');
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
//          else if(obj.additionalData.state == 'login'){
//            $state.go(userType+'.newsfeed', {push:obj});
//          }
          else if(obj.additionalData.state == 'calendar'){
            $rootScope.setFavoriteStudent(studentObj[0],'calendar');
            $state.go(userType+'.'+obj.additionalData.state, {push:obj});
          }
          else if(obj.additionalData.state == 'newsletters'){
            $state.go(userType+'.'+notifications, {push:obj});
          }
        }
        $timeout(function(){
          $rootScope.refreshBoolean = false;
        }, 10000);

      }
      else{
        state.go('signin');
        $timeout(function(){
          $rootScope.refreshBoolean = false;
        }, 10000);
      }
    }


    $rootScope.timerObj = {
      start: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    function successCallback(result) {
      console.log(result);
      return result;
    }

    function errorCallback(error) {
      console.log("SIM ERROR ", error);
    }

    function hasReadPermission() {
      return window.plugins.sim.hasReadPermission(successCallback, errorCallback);
    }

    // Android only: request permission
    function requestReadPermission() {
      window.plugins.sim.requestReadPermission(successCallback, errorCallback);
    }

    $rootScope.startTimer = function () {
      if ($rootScope.timerObj.start == true) {
        $rootScope.timerObj.seconds++;
        if ($rootScope.timerObj.seconds > 59) {
          $rootScope.timerObj.minutes++;
          $rootScope.timerObj.seconds = 0;
        }
        if ($rootScope.timerObj.minutes > 59) {
          $rootScope.timerObj.hours++;
          $rootScope.timerObj.minutes = 0;
        }
        $timeout($rootScope.startTimer, 1000);
      }
    };

    if (window.cordova && window.SQLitePlugin) {
      db = $cordovaSQLite.openDB("newsfeed.db");
    } else {
      db = window.openDatabase('newsfeed', '1.0', '"newsfeed.db"', 50 * 1024 * 1024);
    }

    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS newfeedData (id INTEGER PRIMARY KEY AUTOINCREMENT, news string)");

    $ionicPlatform.ready(function () {

      //      https://api.ipify.org/?format=json
      authService.getIp("http://ipv4.myexternalip.com/json").then(function (response) {
        $rootScope.remoteIp = response.data.ip;
      });

      $rootScope.model = $cordovaDevice.getModel();
      $rootScope.platform = $cordovaDevice.getPlatform();

      if($rootScope.platform == 'Android'){
        window.plugins.sim.getSimInfo(function (result) {
            $rootScope.deviceId = result.deviceId;
//            $rootScope.deviceId = $cordovaDevice.getUUID();
        }, errorCallback);
      }
      else if($rootScope.platform == 'iOS'){
        $rootScope.deviceId = $cordovaDevice.getUUID();
      }

//      if($rootScope.platform == 'Android'){
        if(!hasReadPermission) {
          requestReadPermission();
        }
//      }

      $cordovaSplashscreen.hide();

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(false);
        permissions = cordova.plugins.permissions;

        function requestPermissionCallback(status) {
          $log.debug("Requesting Permission ");
          if(!status.hasPermission) {
               var errorCallback = function() {
                   console.warn('SMS permission is not turned on');
               }

             permissions.requestPermission(
                   permissions.WRITE_EXTERNAL_STORAGE,
                   function(status) {
                   $log.debug("PERMISSION WRITE_EXTERNAL_STORAGE ", status);
                       if(!status.hasPermission) errorCallback();
                   },
                   errorCallback);

              permissions.requestPermission(
                   permissions.READ_PHONE_STATE,
                   function(status) {
                   $log.debug("PERMISSION READ_PHONE_STATE ", status);
                       if(!status.hasPermission) errorCallback();
                   },
                   errorCallback);

              permissions.requestPermission(
                   permissions.READ_SMS,
                   function(status) {
                   $log.debug("PERMISSION READ_SMS ", status);
                   window.plugins.sim.getSimInfo(function (result) {
                      $rootScope.deviceId = result.deviceId;
//                    $rootScope.deviceId = $cordovaDevice.getUUID();
                   }, errorCallback);
                     if(!status.hasPermission) errorCallback();
                   },
                   errorCallback);

              permissions.requestPermission(
                   permissions.GET_ACCOUNTS,
                   function(status) {
                   $log.debug("PERMISSION GET_ACCOUNTS ", status);
                   window.plugins.sim.getSimInfo(function (result) {
                      $rootScope.deviceId = result.deviceId;
//                    $rootScope.deviceId = $cordovaDevice.getUUID();
                   }, errorCallback);
                       if(!status.hasPermission) errorCallback();
                   },
                   errorCallback);

              permissions.requestPermission(
                   permissions.ACCESS_COARSE_LOCATION,
                   function(status) {
                   window.plugins.sim.getSimInfo(function (result) {
                      $rootScope.deviceId = result.deviceId;
//                    $rootScope.deviceId = $cordovaDevice.getUUID();
                   }, errorCallback);
                   $log.debug("PERMISSION ACCESS_COARSE_LOCATION ", status);
                     if(!status.hasPermission) errorCallback();
                   },
                   errorCallback);
          }
          else{
            $log.debug("PERMISSION SUCCESS");
          }
      }


        var list = [
              permissions.WRITE_EXTERNAL_STORAGE,
              permissions.READ_PHONE_STATE,
              permissions.GET_ACCOUNTS,
              permissions.READ_SMS,
              permissions.ACCESS_COARSE_LOCATION
        ];

        permissions.checkPermission(list, success, null);

        function error() {
          console.warn('Camera or Accounts permission is not turned on');
        }

        function success( status ) {
          $log.debug("MAIN PERMISSION STATUS ", status);
          if( !status.hasPermission ) {

            permissions.requestPermission(
              list, requestPermissionCallback, error);
          }
        }
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      ionic.Platform.isFullScreen = true;
      var backTap = 0;
      $ionicPlatform.registerBackButtonAction(function () {
        if ($state.current.name == "signin" || $state.current.name == "app.newsfeed" || $state.current.name == "pApp.newsfeed") {
          if(backTap === 0)
          {
              backTap++;
              GlobalService.showToast("Press again to exit", 'short', 'bottom');
              $timeout(function(){
                backTap = 0;
              }, 2000);
          }
          else
          {
              navigator.app.exitApp();
          }
        }
        else if($state.current.name == "pApp.parentLanding" && !$rootScope.loginResponse.haveChild){
          if(backTap === 0)
          {
              backTap++;
              GlobalService.showToast("Press again to exit", 'short', 'bottom');
              $timeout(function(){
                backTap = 0;
              }, 2000);
          }
          else
          {
              navigator.app.exitApp();
          }
        }
        else if($state.current.name == "pApp.profile" && $rootScope.loginResponse.haveChild){
          $state.go('pApp.newsfeed');
        }
        else if($state.current.name == "pApp.profile" && !$rootScope.loginResponse.haveChild){
          $state.go('pApp.parentLanding');
        }
        else if ($state.current.name == "app.notifications" || $state.current.name == "app.actions" || $state.current.name == "app.people" || $state.current.name == "app.albums" || $state.current.name == "app.profile" || $state.current.name == "app.settings") {
          $state.go('app.newsfeed');
        }
        else {
          if ($state.current.name == "app.addNewAction") {
            $state.go('app.actions');
          }
          if ($state.current.name == "app.composer") {
            $state.go('app.notifications');
          }
          if ($state.current.name == "app.photos") {
            $state.go('app.albums');
          }
          if ($state.current.name == "app.studentDetails") {
            $state.go('app.people');
          }
          if ($state.current.name == "app.studentDetailsPopup") {
            $state.go('app.studentDetails');
          }
          if ($state.current.name == "app.healthCheck") {
            $state.go('app.studentDetailsPopup');
          }
          if ($state.current.name == "registrationSelection") {
            $state.go('signin');
          }
          if ($state.current.name == "inviteSchool") {
            $state.go('registrationSelection');
          }
          if ($state.current.name == "pApp.inviteSchool") {
            $state.go('pApp.schoolFinderMain');
          }
          if ($state.current.name == "socialLogin") {
            $state.go('signin');
          }
          if ($state.current.name == "schoolRegistration") {
            $state.go('registrationSelection');
          }

          if ($state.current.name == "pApp.notifications") {
            $state.go('pApp.newsfeed');
          }
          if ($state.current.name == "pApp.composer") {
            $state.go('pApp.notifications');
          }
          if ($state.current.name == "pApp.calendar") {
            $state.go('pApp.newsfeed');
          }
          if ($state.current.name == "pApp.albums") {
            $state.go('pApp.newsfeed');
          }
          if ($state.current.name == "pApp.photos") {
            $state.go('pApp.albums');
          }
          if ($state.current.name == "pApp.billing" || $state.current.name == "pApp.settings") {
            $state.go('pApp.newsfeed');
          }
          if ($state.current.name == "pApp.schoolFinderMain" || $state.current.name == "pApp.publicCalendar" || $state.current.name == "pApp.kids" || $state.current.name == "pApp.myProfile" || $state.current.name == "pApp.appointments") {
            $state.go('pApp.parentLanding');
          }
          if ($state.current.name == "pApp.schoolFinderPrograms" || $state.current.name == "pApp.referSchool" || $state.current.name == "pApp.schoolFinderCalendar") {
            $state.go('pApp.schoolFinderSpecific');
          }
          if ($state.current.name == "pApp.schoolFinderSpecific") {
            $state.go('pApp.schoolFinderMain');
          }
          if ($state.current.name == "pApp.kid") {
            $state.go('pApp.kids');
          }
          if ($state.current.name == "pApp.parentLanding" && $rootScope.loginResponse.haveChild) {
            $state.go('pApp.newsfeed');
          }

        }
      }, 100);
    });

    $rootScope.refreshLogin = function(){
      var data = {
        userEmail: $rootScope.contactResponse.email,
        userPassword: null,
        browsertype: 'mobile',
        devicetype: $rootScope.model,
        httpreferer: $rootScope.remoteIp,
        idToken: null,
        socialType: null,
      };

      var APIname = 'refreshLogin';

      authService.refreshLogin(data, APIname).then(function (response) {
        console.log("Login Response ", response);
          if (typeof response.status && response.status === 422) {
//            GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response.data) && response.data !== '') {

              var res = response.data;

              var settings = localStorage.getItem('settings');
              settings = JSON.parse(settings);
              var sound = "true";
              if (settings && settings.notification === 'Muted') {
                sound = "false";
              }

              if (res.loginStatus == "SUCCESS") {
                var options = {
                  android: {
                    senderID: "773892175021",
                    "icon": "test",
		                "iconColor": "#1FA3DC",
                    "sound": sound
                  },
                  ios: {
                    senderID: "773892175021",
                    gcmSandbox: "false",
                    alert: "true",
                    badge: "true",
                    sound: sound
                  }
                };
                // initialize
                $cordovaPushV5.initialize(options).then(function() {
                  // start listening for new notifications
                  $cordovaPushV5.onNotification();
                  // start listening for errors
                  $cordovaPushV5.onError();

                  // register to get registrationId
                  $cordovaPushV5.register().then(function(registrationId) {
                    $log.debug("PUSH Token Registration ", registrationId);
  //                      var device = $cordovaDevice.getDevice();

                    var deviceInfo = {
                        contactId : res.contactId,
                        modelName : $rootScope.model,
                        imei : $rootScope.deviceId,
                        gcmId : registrationId,
                        platform : $rootScope.platform,
                        ip : $rootScope.remoteIp,
                        timezone : $rootScope.timeZone
                    };
                    var APIname = 'app/updateDevice';

                    authService.registerPushDevice(deviceInfo, APIname).then(function (res) {
                      if (typeof res.status && res.status === 422) {
                        GlobalService.showToast("Please Check your Submission", 'long', 'bottom');
                      }
                      else {
                        $log.debug("Push Registration with our Server ", res);
                      }
                    });
                  }, function(err) {
                    $log.debug("Registration error: " + err)
                  });
                });

                $rootScope.token = localStorage.getItem("token");
                var loginObj = res;
                loginObj.sessionid = $rootScope.token;
                localStorage.setItem('loginResponse', JSON.stringify(loginObj));
                $rootScope.loginResponse = res;

                if (response.data.type === 'PARENT') {
                   localStorage.setItem('studentInfo', JSON.stringify(response.data.students));
                }

                var contactObj = {
                  contactId: res.contactId.toString()
                };

                var APIname = 'app/getContactsById';

                authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
                  if (typeof contactResponse.status && contactResponse.status === 422) {
//                    GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                  }
                  else {
                    $rootScope.contactResponse = contactResponse.data.contact;
                    localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                    if(res.type == 'PARENT'){
                      var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
                      $log.debug("Student Info ", getStudentInfo);
                      var favoriteStudent = localStorage.getItem('favoriteStudentInfo');
                      if(favoriteStudent != 'undefined'){
                        var getFavStudent = JSON.parse(favoriteStudent);
                      }
                      if(getStudentInfo.length > 0){
                        if(getFavStudent == undefined){
                          var studentsArray = _.filter(getStudentInfo, function(o) { return o.programSchoolId != null; });
                          localStorage.setItem('favoriteStudentInfo', JSON.stringify(studentsArray[0]));
                        }
                        else{
                          var favouriteMatch = _.filter(getStudentInfo, function(o) { return o.studentId == getFavStudent.studentId; });
                          $log.debug("Favorite Match ", favouriteMatch);
                          if(favouriteMatch.length == 0){
                            var studentsArray = _.filter(getStudentInfo, function(o) { return o.programSchoolId != null; });
                            localStorage.setItem('favoriteStudentInfo', JSON.stringify(studentsArray[0]));
                            $rootScope.hardRefresh = true;
                          }
                        }
                        GlobalService.hideLoading();
                        if(!$rootScope.refreshBoolean && $rootScope.hardRefresh){
                          $state.go('pApp.newsfeed', {refresh : true}, {reload : true});
                        }
                      }
                      else{
                        GlobalService.hideLoading();
                        if(!$rootScope.refreshBoolean){
                          $state.go('pApp.parentLanding');
                        }
                      }
                    }
                    else if(res.type == "ADMIN" || res.type == "TEACHER"){
                      GlobalService.hideLoading();
//                      $state.go('app.gettingStarted');
                      if($rootScope.refreshBoolean){
                        $state.go('app.newsfeed');
                      }
                    }
                  }
                });
              }
              else {
                GlobalService.hideLoading();
//                GlobalService.showToast("You login attempt was unsuccessful. " + response.data.remark, 'long', 'bottom');
              }
            }
            else {
//              GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
            }
          }
      });
    }

    $rootScope.token = '';

    var accessToken = localStorage.getItem('token');
    var profilePicSet = localStorage.getItem('profilePicSet');
    var loginResponse = localStorage.getItem('loginResponse');
    var contactResponse = localStorage.getItem('contactResponse');

    if (accessToken) {
      $rootScope.token = accessToken;
      $rootScope.loginResponse = JSON.parse(loginResponse);
      $rootScope.contactResponse = JSON.parse(contactResponse);

      $timeout(function(){
        $rootScope.refreshLogin();
      }, 4000);

      if ($rootScope.loginResponse.type === 'PARENT' && $rootScope.loginResponse.haveChild) {
        if(profilePicSet){
          window.localStorage.removeItem("profilePicSet");
          $location.url('/pApp/profile');
        }
        else{
          $location.url('/pApp/parentNewsfeed');
        }
      }
      else if ($rootScope.loginResponse.type === 'PARENT' && !$rootScope.loginResponse.haveChild) {
        if(profilePicSet){
          window.localStorage.removeItem("profilePicSet");
          $location.url('/pApp/profile');
        }
        else{
          $location.url('/pApp/parentLanding');
        }
      }
      else if ($rootScope.loginResponse.type === 'ADMIN' || $rootScope.loginResponse.type === 'TEACHER') {
        if(profilePicSet){
          window.localStorage.removeItem("profilePicSet");
          $location.url('/app/profile');
        }
        else{
          $location.url('/app/newsfeed');
        }
      }
    }

//    function successCallback(result) {
//      console.log(result);
//      return !!result;
//    }

//    function errorCallback(error) {
//      console.log(error);
//    }


    $rootScope.checkImageUrl = function (imgPath) {
      if(imgPath != undefined){
      var check = imgPath.search("amazonaws.com");
      if (check !== -1) {
        return imgPath;
      }
      else {
        return $rootScope.imgURL + imgPath;
      }
      }
    };

    document.addEventListener("deviceready", function () {
      $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
      });
      //warning user when network is off
      $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
        GlobalService.showToast("Internet connection is unavailable      Please connect to wifi or switch on your data connection", 'long', 'bottom');
      });

      var studentJSON = localStorage.getItem('favoriteStudentInfo');
      if(studentJSON !== 'undefined' && studentJSON){
        student = JSON.parse(studentJSON);
        var currencyCode = student.orgCurrency || "MYR";
        var currencyResp = iso4217.getCurrencyByCode(currencyCode);
        $rootScope.currency = currencyResp.symbol;
      }
    }, false);

  })

  .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $compileProvider, $ocLazyLoadProvider, ionicDatePickerProvider, $ionicConfigProvider, $logProvider) {
//    $logProvider.debugEnabled(false);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|ms-appx|geo|tel):/);
    $ionicConfigProvider.views.forwardCache(true);
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.interceptors.push('authInterceptor');
    $httpProvider.defaults.timeout = 5000;

    $ocLazyLoadProvider.config({
      debug: true,
      events: true
    });

    var datePickerObj = {
      inputDate: new Date(),
      titleLabel: 'Select a Date',
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      mondayFirst: false,
      weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'popup',
      from: new Date(),
      to: new Date(2019, 1, 1),
      showTodayButton: true,
      dateFormat: 'dd MMMM yyyy',
      closeOnSelect: false,
      disableWeekdays: []
    };
    ionicDatePickerProvider.configDatePicker(datePickerObj);

    $urlRouterProvider.otherwise('/');

  })

  .factory('authInterceptor', function ($rootScope, $q, $location, $base64) {
    return {
      request: function (config) {
        var username = 'app';
        var password = 'xb8Icmdam9ZWNc4W';
        config.headers['Authorization'] = "Basic " + $base64.encode(username + ":" + password);
        return config;
      },
      responseError: function (response) {
        if (response.status === 401) {
          $location.path('/');
          $rootScope.token = '';
          return $q.reject(response);
        } else {
          return $q.reject(response);
        }
      }
    };
  });
