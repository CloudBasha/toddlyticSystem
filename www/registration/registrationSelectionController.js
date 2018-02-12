'use strict';
angular.module('toddlytics')
  .controller('registrationSelectionCtrl',
    function ($scope, $state, $stateParams, $http, $timeout, GlobalService, $rootScope, $ionicPopup, deviceDetector, $log, API_URL, $window) {

      $scope.registerObj = {};
      $scope.inviteObj = {};

      if ($stateParams.placeParams) {
        console.log($stateParams.placeParams);
        $scope.inviteObj.schoolName = $stateParams.placeParams.schoolName;
        $scope.inviteObj.contactNo = $stateParams.placeParams.schoolContactNo;
        $scope.inviteObj.schoolAddress = $stateParams.placeParams.schoolAddress;
      }
  
      var loginInfo = localStorage.getItem('token');
      if(loginInfo != undefined){
        var contactInfo = JSON.parse(localStorage.getItem('contactResponse'));
        $scope.inviteObj.parentName = contactInfo.name;
        $scope.inviteObj.parentEmail = contactInfo.email;
        $scope.inviteObj.parentContactNo = contactInfo.mobilePhone;
      }

      if ($stateParams.user) {
        console.log($stateParams.user);
        $scope.registerObj.fullName = $stateParams.user.name;
        $scope.registerObj.email = $stateParams.user.email;
      }

      $scope.goToSignup = function () {
        $state.go('signup', {user: $stateParams.user});
      };

      $scope.goToSchoolRegister = function () {
        $state.go('schoolRegistration', {user: $stateParams.user});
      };

      $scope.inviteSchool = function(isValid){
        if(isValid){
          var inviteSchoolObj = {
            schoolName :$scope.inviteObj.schoolName,
            principalName :$scope.inviteObj.principalName,
            principalEmail :$scope.inviteObj.principalEmail,
            schoolContactNumber :$scope.inviteObj.contactNo,
            parentEmailAddress :$scope.inviteObj.parentEmail,
            parentName :$scope.inviteObj.parentName,
            parentContactNumber :$scope.inviteObj.parentContactNo,
            googlePlaceUrl : $scope.inviteObj.googlePlaceUrl,
            source : 'Mobile'
          }

          $log.debug("Invite School Obj", inviteSchoolObj);
          $http.post(API_URL+'/createLeads', inviteSchoolObj)
          .success(function(response) {
            if(response.status == "SUCCESS"){
              GlobalService.showToast("Your submission was successful. Thank you", 'long', 'bottom');
                  $log.debug("School Invitation Success ", response);
                  $scope.inviteObj = {};
                  $window.history.back();
            }
            else{
              GlobalService.showToast("Your submission was unsuccessful. " + response.remark, 'long', 'bottom');
                  $log.debug("School Invitation Error ", response);
            }
            }, function(err) {
                //fail case
                $log.debug("Error ", err);
            });
        }
      }
      
      $scope.getGooglePlaceInfo = function(place){
        if(place.name != undefined){
          $log.debug("Google Place ", place);
          $scope.inviteObj.googlePlaceUrl = place.place_id;
          $scope.inviteObj.schoolName = place.name;
        }
        else{
          $log.debug("Google Place Url Reset");
          $scope.inviteObj.googlePlaceUrl = null;
        }
      }

      $scope.referSchool = function(isValid){
        if(isValid){
          var inviteSchoolObj = {
            schoolName :$scope.inviteObj.schoolName,
            principalName :$scope.inviteObj.principalName,
            schoolEmail :$scope.inviteObj.principalEmail,
            address :$scope.inviteObj.schoolAddress,
            schoolPhone :$scope.inviteObj.contactNo,
            parentEmail :$scope.inviteObj.parentEmail,
            parentName :$scope.inviteObj.parentName,
            phoneNumber :$scope.inviteObj.parentContactNo,
            googlePlaceUrl : $scope.inviteObj.googlePlaceUrl,
            source : 'Mobile'
          }

          $log.debug("Invite School Obj", inviteSchoolObj);
          $http.post(API_URL+'/app/referSchool', inviteSchoolObj)
          .success(function(response) {
            if(response.status == "Success"){
              GlobalService.showToast("Your submission was successful. Thank you", 'long', 'bottom');
                  $log.debug("School Invitation Success ", response);
                  $scope.inviteObj = {};
                  $state.go('pApp.schoolFinderSpecific');
            }
            else{
              GlobalService.showToast("Your submission was unsuccessful. " + response.remark, 'long', 'bottom');
              $log.debug("School Invitation Error ", response);
            }
            }, function(err) {
                //fail case
                $log.debug("Error ", err);
            });
        }
      }
    });
