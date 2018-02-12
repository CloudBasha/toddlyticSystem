angular.module('toddlytics')
  .controller('signupCtrl',
    function ($scope, $state, $stateParams, $http, $timeout, GlobalService, $rootScope, $ionicPopup, $ionicPlatform, signupService, authService, NewsfeedService, $ionicHistory, $log, $ionicLoading, $cordovaPushV5) {
      console.log($stateParams.user);
      $scope.user = {};
      var smsVerification = null;
      $scope.manual = null;
      $scope.submitRegister = false;
      $scope.stateParams = {};
      if ($stateParams.user) {
        $scope.user.name = $stateParams.user.displayName || $stateParams.user.name || $stateParams.user.fullName;
        $scope.user.email = $stateParams.user.email;
        $scope.user.socialType = $stateParams.user.socialType || '';
        $scope.user.idToken = $stateParams.user.idToken;
        $scope.stateParams = $stateParams.user;
      }
      var number_pattern = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;

      $scope.showInfo = function() {
       var alertPopup = $ionicPopup.alert({
         title: 'Information',
         template: 'Please key in this mobile phone\'s number(including your country code) to automatically verify your phone number via SMS. Sample phone number format: \n+60161234567'
       });

       alertPopup.then(function(res) {
         console.log('Thank you for not eating my delicious ice cream cone');
       });
      };
      $scope.submit = function(form) {
        if($scope.user.password != $scope.user.cPassword){
          GlobalService.showToast("Please try again these passwords don't match", 'long', 'bottom');
				}
				else{
          var registerParentObj = {
            name : $scope.user.name,
            email : $scope.user.email,
            idToken : $scope.user.idToken || '',
            socialType: $scope.user.socialType || '',
            phone : $scope.user.phone || '',
            password : $scope.user.password
          };

          $scope.submitted = true;
          if (form.$invalid) {
            return;
          }
          GlobalService.showLoading('Registering');

          signupService.register(registerParentObj).then(function(resp) {
            GlobalService.hideLoading();
            if (resp.remark) {
              GlobalService.showToast(resp.remark, 'long', 'bottom');
              return;
            }
            console.log(resp);
            if(resp.status == 'SUCCESS'){
              $scope.submitRegister = true;
              startTimer();
              $scope.verifyEmailLoginTimer = setInterval(function() {
                authenticate();
              }, 5000);
            }
            else{
              GlobalService.hideLoading();
              GlobalService.showToast("You registration attempt was unsuccessful. " + resp.data.remark, 'long', 'bottom');
  //            $state.go('signin');
            }
          },function (err) {
              console.log('SMS err ->', err);
          });
        }
      };
  
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
  
      function authenticate(){
        var data = {
          userEmail: $scope.user.email,
          userPassword: $scope.user.password || '',
          browsertype: "mobile",
          devicetype: $rootScope.model,
          httpreferer: $rootScope.remoteIp,
          idToken: $scope.user.idToken,
          socialType: $scope.user.socialType,

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


              var settings = localStorage.getItem('settings');
              settings = JSON.parse(settings);
              var sound = "true";
              if (settings && settings.notification === 'Muted') {
                sound = "false";
              }

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


                    // getNewsFeedData($rootScope.loginResponse.organizationId);


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
                    if (response.data.type === 'PARENT') {
                       localStorage.setItem('studentInfo', JSON.stringify(response.data.students));
//                       $timeout.cancel(timer);
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
//              else {
//                GlobalService.hideLoading();
//                GlobalService.showToast("You login attempt was unsuccessful. " + response.data.remark, 'long', 'bottom');
//                $state.go('signin');
//              }
            }
//            else {
//              GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
//            }
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
              // $scope.user.phone = result.phoneNumber;
              var PNF = window.libphonenumber.PhoneNumberFormat;
              var phoneUtil = window.libphonenumber.PhoneNumberUtil.getInstance();
              var number = phoneUtil.parse(result.phoneNumber, result.countryCode.toUpperCase());
              number = phoneUtil.format(number, PNF.INTERNATIONAL);
              number = number.replace(/ /g, '');
              number = number.replace('-', '');
              $scope.user.phone = number;
              console.log(number);
              // $scope.user.phone = libphonenumber.PhoneNumberFormat(result.phone, result.countryCode.toUpperCase());
            }
          }, errorCallback);

          if(!hasReadPermission) {
            requestReadPermission();
          }
      });
//
//      $scope.submitTac = function(manual) {
//        console.log(manual);
//        $scope.tac_submitted = true;
//        if (!manual.tac) {
//          return;
//        }
//        smsVerification.tac = manual.tac.toString();
//        signupService.submit_tac(smsVerification).then(function(resp){
//          console.log(resp);
//          if(resp.data.status === 'Fail') {
//            GlobalService.showToast("Invalid TAC", 'long', 'bottom');
//            $scope.data = {};
//            var myPopup = $ionicPopup.show({
//                template: '<input type="number" ng-model="data.tac">',
//                title: 'SMS Verification',
//                subTitle: "There was an issue with the SMS verification, if you still received it, please enter it below",
//                scope: $scope,
//                buttons: [
//                  {
//                    text: '<b>Submit</b>',
//                    type: 'button-positive',
//                    onTap: function(e) {
//                      if (!$scope.data.tac) {
//                        //don't allow the user to close unless he enters wifi password
//                        e.preventDefault();
//                      } else {
//                        return $scope.data;
//                      }
//                    }
//                  }
//                ]
//              });
//
//              myPopup.then(function(res) {
//                console.log('Tapped!', res);
//                $scope.submitTac(res);
//              });
//          }
//          else {
//            GlobalService.hideLoading();
//            var data = {
//            userEmail: $scope.user.email,
//            userPassword: "",
//            browsertype: "mobile",
//            devicetype: $rootScope.model,
//            httpreferer: $rootScope.remoteIp,
//            idToken: $scope.user.idToken,
//            socialType: $scope.user.socialType,
//
//          };
//          var APIname = 'login';
//
//
//          console.log("Login Request ", data);
//          authService.authenticate(data, APIname).then(function (response) {
//          console.log("Login Response ", response);
//            if (typeof response.status && response.status === 422) {
//              GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
//            }
//            else {
//              if (angular.isDefined(response.data) && response.data !== '') {
//
//                var res = response.data;
//
//                if (res.loginStatus == "SUCCESS") {
//                  $ionicPlatform.ready(function(){
//                      // register to get registrationId
//                      $cordovaPushV5.register().then(function(registrationId) {
//                        $log.debug("PUSH Token Registration ", registrationId);
//                        var deviceInfo = {
//                            contactId : res.contactId,
//                            modelName : $rootScope.model,
//                            imei : $rootScope.deviceId,
//                            gcmId : registrationId,
//                            platform : $rootScope.platform,
//                            ip : $rootScope.remoteIp
//                        };
//
//                        var APIname = 'app/updateDevice';
//
//                        authService.registerPushDevice(deviceInfo, APIname).then(function (res) {
//                          if (typeof res.status && res.status === 422) {
//                            GlobalService.showToast("Please Check your Submission", 'long', 'bottom');
//                          }
//                          else {
//                            $log.debug("Push Registration with our Server ", res);
//                          }
//                        });
//                      }, function(err) {
//                        $log.debug("Registration error: " + err)
//                      });
//                  });
//                  localStorage.setItem("token", res.sessionid);
//                  $rootScope.token = res.sessionid;
//                  localStorage.setItem('loginResponse', JSON.stringify(res));
//                  $rootScope.loginResponse = res;
//                  getNewsFeedData($rootScope.loginResponse.organizationId);
//
//
//                  var contactObj = {
//                    contactId: res.contactId.toString()
//                  };
//
//                  var APIname = 'app/getContactsById';
//
//                  authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
//                    if (typeof contactResponse.status && contactResponse.status === 422) {
//                      GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
//                    }
//                    else {
//                      $rootScope.contactResponse = contactResponse.data.contact;
//                      localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
//                      GlobalService.hideLoading();
//                      $state.go('app.newsfeed');
//                    }
//                  });
//                }
//                else {
//                  GlobalService.hideLoading();
//                  GlobalService.showToast("You login attempt was unsuccessful. " + res.remark, 'long', 'bottom');
//                  $state.go('signin');
//                }
//              }
//              else {
//                GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
//              }
//            }
//          });
//          }
//        }).then(function() {
//
//        });
//      };

      function successCallback(result) {
        console.log(result);
        return result;
      }

      function errorCallback(error) {
        console.log(error);
      }

      function hasReadPermission() {
        return window.plugins.sim.hasReadPermission(successCallback, errorCallback);
      }

      // Android only: request permission
      function requestReadPermission() {
        window.plugins.sim.requestReadPermission(successCallback, errorCallback);
      }

    });
