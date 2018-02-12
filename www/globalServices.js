'use strict';
angular.module('toddlytics')
  .factory('GlobalService', function ($ionicLoading, $cordovaToast, $log, $rootScope, $http, API_URL, authService) {
    var photoData = '';
    return {
      showToast: function (message, duration, location) {
        $cordovaToast.show(message, duration, location).then(function (success) {
          $log.debug("The toast was shown");
        }, function (error) {
          $log.debug("The toast was not shown due to " + error);
        });
      },
      showLoading: function (msg) {
        msg = msg || 'Loading...';
        $ionicLoading.show({
          template: '<ion-spinner></ion-spinner><div>' + msg + '</div>',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          duration : 15000
        });
      },

      hideLoading: function () {
        $ionicLoading.hide();
      },
      setCameraFile: function (data) {
        photoData = data;
      },
      getCameraFile: function () {
        return photoData;
      },
      logout: function () {
        $http.get(API_URL + 'logout')
        .success(function (response) {
          var res = JSON.parse(localStorage.getItem('loginResponse'));
          var deviceInfo = {
              contactId : res.contactId,
              modelName : $rootScope.model,
              imei : $rootScope.deviceId,
              gcmId : '',
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
              $log.debug("LOGOUT ", response);
              $rootScope.token = '';
              window.localStorage.removeItem("token");
              window.localStorage.removeItem("contactResponse");
              window.localStorage.removeItem("favoriteStudentInfo");
              window.localStorage.removeItem("loginResponse");
              window.localStorage.removeItem("school");
              window.localStorage.removeItem("studentInfo");
              window.localStorage.removeItem("preferences");
              window.localStorage.removeItem("settings");
              window.plugins.googleplus.logout(
                  function (msg) {
                  $log.debug("LOGOUT2 ", msg);
                  }
              );
              facebookConnectPlugin.logout(function(result) {
                console.log("LOGOUT2", result);
              }, function (error) {
                console.log('error -> ', error);
              });
            }
          });
        }, function (err) {
            // fail case
            $log.debug("Error ", err);
        });
      }
    }
  });
