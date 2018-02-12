'use strict';
angular.module('toddlytics')
  .controller('schoolFinderProgramsCtrl',
    function ($scope, $state, $http, $timeout, GlobalService, $stateParams, $rootScope, $ionicPopup, deviceDetector, $log, API_URL) {
      $scope.programs = $stateParams.obj;
      $log.debug("Programs ", $scope.programs);
    
  });
