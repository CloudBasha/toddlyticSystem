angular.module('toddlytics')
  .controller('socialLoginCtrl',
    function ($scope, $state, $http, $timeout, authService, GlobalService, $rootScope, $ionicPopup, $log) {
      $scope.gLogin = function () {
        window.plugins.googleplus.login({
          webClientId: '306322274255-gh1tdmfnshlc4i2f5ua0jd4skobkumh2.apps.googleusercontent.com',
          offline: true
        }, function(obj) {
          $scope.user = obj;
          $scope.user.socialType = 'google';
          window.plugins.googleplus.logout(
              function (msg) {
              $log.debug("LOGOUT2 ", msg);
              $state.go('registrationSelection', { user: $scope.user });
              }
          );
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
            var url2 = "/" + result.authResponse.userID + "/picture?type=large&redirect=0";
            facebookConnectPlugin.api(url2, [], function (resp) {
              console.log(resp);
              $scope.user.picture = resp.data.url;
              $state.go('registrationSelection', { user: $scope.user });
            }, function (error) {
              console.log('error -> ', error);
            });
          }, function (error) {
            console.log('error -> ', error);
          });
        }, function (error) {
          console.log('error -> ', error);
        });
      };
    });
