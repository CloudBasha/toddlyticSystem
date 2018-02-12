'use strict';
angular.module('toddlytics')
  .controller('signInCtrl',
    function ($scope, $state, $http, $timeout, authService, NewsfeedService, GlobalService, $rootScope, $ionicPopup, deviceDetector, $cordovaSQLite, signupService, $ionicHistory, $log, $window, $cordovaPushV5, $cordovaDevice, $ionicPlatform, API_URL) {

    $scope.loginRequest = {};
      var deviceInfo = deviceDetector;

      function getDeviceType() {
        var deviceType = deviceInfo.isMobile();
        if (deviceType == false) {
          deviceType = deviceInfo.isDesktop();
          if (deviceType == false) {
            deviceType = deviceInfo.isTablet();
            if (deviceType == false) {
              deviceType = deviceInfo.isTablet();
            }
            else {
              $scope.deviceType = "Tablet"
            }
          }
          else {
            $scope.deviceType = "Desktop"
          }
        }
        else {
          $scope.deviceType = "Mobile"
        }
      }

      $scope.authenticate = function () {

        GlobalService.showLoading();
        if ($scope.loginRequest.userName != null && $scope.loginRequest.userName != undefined && $scope.loginRequest.userName != '' && $scope.loginRequest.password != null && $scope.loginRequest.password != undefined && $scope.loginRequest.password != '') {

          $scope.browser = deviceInfo.browser;

          getDeviceType();

          var loginObj = {
            userEmail: $scope.loginRequest.userName,
            userPassword: $scope.loginRequest.password,
            browsertype: $scope.browser,
            devicetype: $scope.deviceType,
            httpreferer: $rootScope.remoteIp,
            idToken : null,
            socialType : null
          };

          var APIname = 'login';


          console.log("Login Request ", loginObj);
          callAuthenticate(loginObj, APIname);
        }
        else {
          GlobalService.hideLoading();
          GlobalService.showToast('Please Enter Valid Username and Password', 'long', 'bottom');
        }
      };

      $scope.sendForgotPasswordEmail = function (forgotPwdEmail) {

        if (forgotPwdEmail != null && forgotPwdEmail != undefined && forgotPwdEmail != '') {

          var userEmail = {email: forgotPwdEmail};
          var APIname = 'sendForgotPasswordEmail';

          authService.authenticate(userEmail, APIname).then(function (res) {
            if (typeof res.status && res.status === 422) {
              GlobalService.showToast("Please Check your Submission", 'long', 'bottom');
            }
            else {
              if (angular.isDefined(res.data) && res.data !== '' && res.data.status === 'Success') {
                GlobalService.showToast("Email sent successfully", 'long', 'bottom');
              }
              else {
                GlobalService.showToast("Please Check your Submission" + res.remark, 'long', 'bottom');
              }
            }
          });
        }
        else {
          GlobalService.showToast("Please Check your Submission", 'long', 'bottom');
        }
      };

      $scope.showAlert = function () {

        $scope.forgotPassword = {};

        var myPopup = $ionicPopup.show({
          title: 'Forgot Password',
          subTitle: 'Please enter your email',
          scope: $scope,
          template: '<input type="email" ng-model="forgotPassword.email">',
          buttons: [
            {text: 'Cancel'},
            {
              text: '<b>Submit</b>',
              type: 'button-calm',
              onTap: function (e) {
                $scope.sendForgotPasswordEmail($scope.forgotPassword.email);
              }
            }
          ]
        });
        $timeout(function () {
          myPopup.close();
        }, 30000);
      };

      $scope.gLogin = function () {
        window.plugins.googleplus.login({
          webClientId: '306322274255-gh1tdmfnshlc4i2f5ua0jd4skobkumh2.apps.googleusercontent.com',
          offline: true
        }, function(obj) {
          $scope.user = obj;
          $scope.user.socialType = 'google';
          var data = {
            userEmail: obj.email,
            userPassword: "",
            browsertype: "mobile",
            devicetype: $rootScope.model,
            httpreferer: $rootScope.remoteIp,
            idToken: obj.idToken,
            socialType: 'google',
          };
          var APIname = 'login';


          console.log("Login Request ", data);
          window.plugins.googleplus.logout(
            function (msg) {
              $log.debug("LOGOUT2 ", msg);
              callAuthenticate(data, APIname);
          });
        }, function(msg) {
          console.log('error -> ', msg);
        });
      };

      $scope.fbLogin = function () {
        facebookConnectPlugin.login(["email", "public_profile"], function(result) {
          console.log(result);
          var url = "/" + result.authResponse.userID + "?fields=email,name";
          facebookConnectPlugin.api(url, [], function(resp) {
            console.log(resp);
            $scope.user = resp;
            $scope.user.idToken = "";
            $scope.user.socialType = 'facebook';
            var data = {
              userEmail: resp.email,
              userPassword: "",
              browsertype: "mobile",
              devicetype: $rootScope.model,
              httpreferer: $rootScope.remoteIp,
              idToken: '',
              socialType: 'facebook',
            };

//          var loginObj = {
//            userEmail: $scope.loginRequest.userName,
//            userPassword: $scope.loginRequest.password,
//            browsertype: $scope.browser,
//            devicetype: $scope.deviceType,
//            httpreferer: $scope.remoteIp,
//            idToken : null,
//            socialType : null
//          };

          var APIname = 'login';


          console.log("Login Request ", data);
          callAuthenticate(data, APIname);

          }, function (error) {
            console.log('error -> ', error);
          });
        }, function (error) {
          console.log('error -> ', error);
        });
      };


  function callAuthenticate(data, APIname){
    authService.authenticate(data, APIname).then(function (response) {
      console.log("Login Response ", response);
        if (typeof response.status && response.status === 422) {
          GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
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
              localStorage.setItem("token", res.sessionid);
              $rootScope.token = res.sessionid;
              localStorage.setItem('loginResponse', JSON.stringify(res));
              $rootScope.loginResponse = res;
//              if(res.type == 'ADMIN'){
//                getNewsFeedData($rootScope.loginResponse.organizationId);
//              }
//              else if(res.type == 'PARENT'){
//                if(res.haveChild == true && res.students.length > 0){
//                  getParentNewsFeedData(res.students[0].studentId.toString());
//                }
//              }


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
                  if (response.data.type === 'ADMIN' || response.data.type === 'TEACHER') {
                    var userPrefObj = {
                      contactId : res.contactId.toString(),
                    };
                    $log.debug("List User Preference  ", userPrefObj);
                    $http.post(API_URL + '/cms/l_userPreference', userPrefObj).success(function(userPrefResponse) {
                      var preferenceArray = {};
                      $log.debug("User Preference List ", userPrefResponse);
                      $log.debug("AJSDJASDJASJDASDJ ", Array.isArray(preferenceArray['FilterProgramSelection']));
                      if(userPrefResponse.list.length){
                        angular.forEach(userPrefResponse.list, function(item){
                          if(!Array.isArray(preferenceArray[item.key])){
                            preferenceArray[item.key] = [];
                          }
                          var splitOptions = item.value.split(',');
                          angular.forEach(splitOptions, function(option){
                            if(option == 'Graduated' || option == 'Unenrolled' || option == 'Frozen'){
                                preferenceArray[item.key].push(option);
                            }
                            else{
                                preferenceArray[item.key].push(parseInt(option));
                            }
                          });
                        });
                        localStorage.setItem('preferences', JSON.stringify(preferenceArray));
                        
                        if(userPrefResponse.list.length){
                          var filter = _.filter(userPrefResponse.list, function(o) { return o.key == 'push'; });
                          console.log("Push Value ", filter);
                          var settingsObj = {
                              language: 'English',
                              notifications: filter[0].value
                          }
                          localStorage.setItem('settings', JSON.stringify(settingsObj));
                        }
                      }
                      $ionicHistory.clearCache().then(function () {
                        $log.debug("Clear Cache ");
                        $state.go('app.newsfeed');
                      });
                    }, function(err) {
                      // fail case
                      $log.debug("Error ", err);
                    });
                  }
                  if (response.data.type === 'PARENT') {
                     localStorage.setItem('studentInfo', JSON.stringify(response.data.students));
                    
                     var userPrefObj = {
                       contactId : res.contactId.toString(),
                     };
                     $log.debug("List User Preference  ", userPrefObj);
                     $http.post(API_URL + '/cms/l_userPreference', userPrefObj).success(function(userPrefResponse) {
                      var preferenceArray = {};
                      $log.debug("User Preference List ", userPrefResponse);
                       var filter = _.filter(userPrefResponse.list, function(o) { return o.key == 'push'; });
                       console.log("Push Value ", filter);
                       var settingsObj = {
                          language: 'English',
                          notifications: filter[0].value
                       } 
//                       var settingsObj = {
//                            language: 'English',
//                            notifications: userPrefResponse.list[0].value
//                        }

                        localStorage.setItem('settings', JSON.stringify(settingsObj));
                      }, function(err) {
                      // fail case
                      $log.debug("Error ", err);
                     });
                     $ionicHistory.clearCache().then(function () {
                      $log.debug("Clear Cache ");
                      if (response.data.haveChild) {
                        $state.go('pApp.newsfeed');
                      }
                      else {
                        $state.go('pApp.parentLanding');
                      }
                    });
                  }
                }
              });
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("You login attempt was unsuccessful. " + response.data.remark, 'long', 'bottom');
            }
          }
          else {
            GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
          }
        }
    });
  }
});