'use strict';
angular.module('toddlytics')
  .controller('schoolRegistrationCtrl',
    function ($scope, $state, $stateParams, $http, $timeout, authService, NewsfeedService, GlobalService, $rootScope, $ionicPopup, deviceDetector, $log, $ionicPlatform, API_URL, $cordovaSQLite, $cordovaPushV5) {

      $scope.registerObj = {
        timezone: moment.tz.guess()
      };
      $scope.stateParams = {};
      $scope.current = 'first';
      $scope.submitRegister = false;
      $log.log("YOLO ", $stateParams.user);

      if ($stateParams.user) {
        $scope.registerObj.fullName = $stateParams.user.displayName || $stateParams.user.name;
        $scope.registerObj.email = $stateParams.user.email;
        $scope.stateParams = $stateParams.user;
        $scope.user = $stateParams.user;
      }

      $scope.registerSchool = function(isValid, form){
        console.log(form);
        console.log($scope.registerObj);
        if(isValid){
          if($scope.registerObj.password != $scope.registerObj.cPassword){
          GlobalService.showToast("Please try again these passwords don't match", 'long', 'bottom');
          }
          else{
            GlobalService.showLoading();
            $scope.registerSchoolObj = {
              name : $scope.registerObj.fullName,
              email : $scope.registerObj.email,
              mobilePhone : $scope.registerObj.mobilePhone,
              companyName : $scope.registerObj.companyName,
              isAdmin : "true",
              socialType: $scope.stateParams.socialType || '',
              timezone : $scope.registerObj.timezone,
              password : $scope.registerObj.password
            };

            $log.debug("Register School Obj", $scope.registerSchoolObj);
            $http.post(API_URL+'register', $scope.registerSchoolObj)
            .success(function(response) {
              if(response.status == "SUCCESS"){
                GlobalService.hideLoading();
                $log.debug("Register School Success ", response);
  //                  $scope.registerObj = {};
                $scope.submitRegister = true;
                startTimer();
                $scope.verifyEmailLoginTimer = setInterval(function() {
                  authenticate();
                }, 5000);
              }
              else{
                GlobalService.hideLoading();
                GlobalService.showToast("Registration Unsuccessful. " + response.remark, 'long', 'bottom');
                    $log.debug("Register Error Success ", response.remark);
              }
            }, function(err) {
                  //fail case
                  $log.debug("Error ", err);
            });
          }
        }
		  }
      
      function startTimer(){
        $scope.counter = 90;
          $scope.onTimeout = function(){
              $scope.counter--;
              mytimeout = $timeout($scope.onTimeout,1000);
          }
          var mytimeout = $timeout($scope.onTimeout,1000);

          $scope.stop = function(){
              $timeout.cancel(mytimeout);
          }
      }
  
      $scope.$watch('counter', function(val){
        if(val == 0){
          console.log("Timer reached maximum time");
          clearInterval($scope.verifyEmailLoginTimer);
          $scope.stop();
          $state.go('signin');
        }
      })
      
      $scope.showView = function(view, isValid){
        if(view == 'second'){
          if(isValid){
            $scope.current = view;
          }
        }
        else{
          $scope.current = view;
        }
      }
      
      
      function authenticate(){
        var data = {
          userEmail: $scope.registerObj.email,
          userPassword: $scope.registerObj.password || '',
          browsertype: "mobile",
          devicetype: $rootScope.model,
          httpreferer: $rootScope.remoteIp,
          idToken: $scope.stateParams.idToken,
          socialType: $scope.registerSchoolObj.socialType,
        };
        var APIname = 'login';


        console.log("Login Request ", data);
        authService.authenticate(data, APIname).then(function (response) {
        console.log("Login Response ", response);
          if (typeof response.status && response.status === 422) {
            GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response.data) && response.data !== '') {

              var res = response.data;

//              var settings = localStorage.getItem('settings');
//              settings = JSON.parse(settings);
              var sound = "true";
//              if (settings && settings.notification === 'Muted') {
//                sound = "false";
//              }

              if (res.loginStatus == "SUCCESS") {
                clearInterval($scope.verifyEmailLoginTimer);
                var options = {
                  android: {
                    senderID: "773892175021",
                    sound: sound
                  },
                  ios: {
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
                        ip : $rootScope.remoteIp
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
                localStorage.setItem("token", res.sessionid);
                $rootScope.token = res.sessionid;
                localStorage.setItem('loginResponse', JSON.stringify(res));
                $rootScope.loginResponse = res;
                getNewsFeedData($rootScope.loginResponse.organizationId);


                var contactObj = {
                  contactId: res.contactId.toString()
                };

                var APIname = 'app/getContactsById';

                authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
                  if (typeof contactResponse.status && contactResponse.status === 422) {
                    GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                  }
                  else {
                    $rootScope.contactResponse = contactResponse.data.contact;
                    localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                    GlobalService.hideLoading();
                    if (response.data.type === 'ADMIN' && response.data.isFirstLogin === "true") {
                      $state.go('app.gettingStarted');
                    }
                    else if (response.data.type === 'ADMIN') {
                      $state.go('app.newsfeed');
                    }
                    else if (response.data.type === 'PARENT') {
                      $state.go('pApp.newsfeed');
                    }

                  }
                });
              }
//              else {
//                GlobalService.hideLoading();
//                GlobalService.showToast("You login attempt was unsuccessful. " + response.data.remark, 'long', 'bottom');
//              }
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
            }
          }
        });
      }

      function getNewsFeedData(orgId) {

        GlobalService.showLoading();

        var organization = {
          orgId: orgId
        };

        var APIname = 'getNewFeedByOrgId';

        NewsfeedService.getNewsfeeds(organization, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response) && response.status == 200) {
              GlobalService.hideLoading();
              $scope.displayNewsFeed = response.data.list;
              console.log("TIME ZONE ", $rootScope.timeZone);
              angular.forEach($scope.displayNewsFeed, function(newsItem){
                    var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                    var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                    newsItem.auditLog.formattedDateTime = finalDateTime;
              });
              console.log("TIME ZONE ", $scope.displayNewsFeed);
              var newsFeed = JSON.stringify($scope.displayNewsFeed);
              $cordovaSQLite.execute(db, 'insert into newfeedData(news) values(?)', [newsFeed])
                .then(function (res) {
                    console.log('inserted');
                  },
                  function (error) {
                  }
                );
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      $ionicPlatform.ready().then(function() {
          window.plugins.sim.getSimInfo(function (result) {
            console.log(result);
            if (result.countryCode) {
              $scope.countryCode = result.countryCode;
            }
            if(result.phoneNumber) {
              // $scope.registerObj.mobilePhone = result.phoneNumber;
              var PNF = window.libphonenumber.PhoneNumberFormat;
              var phoneUtil = window.libphonenumber.PhoneNumberUtil.getInstance();
              var number = phoneUtil.parse(result.phoneNumber, result.countryCode.toUpperCase());
              number = phoneUtil.format(number, PNF.INTERNATIONAL);
              number = number.replace(/ /g, '');
              number = number.replace('-', '');
              $scope.registerObj.mobilePhone = number;
              console.log($scope.registerObj);
              // $scope.user.phone = libphonenumber.PhoneNumberFormat(result.phone, result.countryCode.toUpperCase());
            }
          }, errorCallback);

          if(!hasReadPermission) {
            requestReadPermission();
          }
      });

      function successCallback(result) {
        console.log(result);
        return result;
      }

      function hasReadPermission() {
        return window.plugins.sim.hasReadPermission(successCallback, errorCallback);
      }

      // Android only: request permission
      function requestReadPermission() {
        window.plugins.sim.requestReadPermission(successCallback, errorCallback);
      }

      function errorCallback(error) {
        console.log(error);
      }

//      $scope.showInfo = function() {
//       var alertPopup = $ionicPopup.alert({
//         title: 'Information',
//         template: 'Please fill this mobile phone\'s number to automatically verify your phone number via SMS. Sample phone number format: +60161234567'
//       });
//
//       alertPopup.then(function(res) {
//         console.log('Thank you for not eating my delicious ice cream cone');
//       });
//      };
    });
