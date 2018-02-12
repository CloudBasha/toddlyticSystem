'use strict';
angular.module('toddlytics')
  .controller('kidsCtrl', function ($scope, $state, $log, GlobalService, $rootScope, $window) {

    $scope.students = JSON.parse(localStorage.getItem('studentInfo'));
    console.log($scope.students)
});