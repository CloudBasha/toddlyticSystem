'use strict';
angular.module('toddlytics')
  .controller('parentLandingCtrl', function ($scope, $state, $rootScope, $ionicHistory, $log) {
  
  $scope.goToState = function(state){
    if(state == 'pApp.schoolFinderMain'){
      $ionicHistory.clearCache().then(function () {
        $log.debug("Clear Cache ");
        $state.go(state);
      });
    }
    else{
      $state.go(state);
    }
  }

  });
