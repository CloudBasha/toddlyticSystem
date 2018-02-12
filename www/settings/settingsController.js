'use strict';
angular.module('toddlytics')
  .controller('settingsCtrl',
    function ($scope, $state, $rootScope, GlobalService, API_URL, $log, $http) {

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;
      var settings = localStorage.getItem('settings');
      $scope.settings = {
        language: 'English',
        notifications: 'true'
      };

      if(settings) {
        $scope.settings = JSON.parse(settings);
      }

      $scope.save = function() {
        console.log($scope.settings);
        var userPrefObj = {
          contactId : contactResponse.contactId.toString(),
          key : 'push',
          value : $scope.settings.notifications
        }
        $log.debug("User Preference  ", userPrefObj);
        $http.post(API_URL+'/app/c_userPreference', userPrefObj).success(function(response) {
          $log.debug("User Preference ", response);
          if(response.status == 'Success'){
            refreshPreferences();
            GlobalService.showToast("Settings Saved Succesfully", 'long', 'bottom');
          }
        }, function(err) {
          // fail case
          $log.debug("Error ", err);
        });
      }
      
      function refreshPreferences(){
        if (contactResponse.type === 'Admin' || contactResponse.type === 'Teacher') {
          var userPrefObj = {
            contactId : contactResponse.contactId.toString(),
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
              var settingsObj = {
                  language: 'English',
                  notifications: userPrefResponse.list[1].value
              }
              localStorage.setItem('settings', JSON.stringify(settingsObj));
            }
          }, function(err) {
            // fail case
            $log.debug("Error ", err);
          });
        }
        if (contactResponse.type === 'Parent') {
           var userPrefObj = {
             contactId : contactResponse.contactId.toString(),
           };
           $log.debug("List User Preference  ", userPrefObj);
           $http.post(API_URL + '/cms/l_userPreference', userPrefObj).success(function(userPrefResponse) {
            var preferenceArray = {};
            $log.debug("User Preference List ", userPrefResponse);
              var settingsObj = {
                  language: 'English',
                  notifications: userPrefResponse.list[0].value
              }

              localStorage.setItem('settings', JSON.stringify(settingsObj));
            }, function(err) {
            // fail case
            $log.debug("Error ", err);
           });
        }
      }

    });
