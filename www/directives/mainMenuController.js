'use strict';
angular.module('toddlytics')
  .controller('mainMenuCtrl', function ($scope, $state, peopleService, $log, GlobalService, $rootScope, $ionicPopover, $cordovaCamera, $cordovaFile, $ionicModal, $cordovaSQLite, actionsService, $ionicPopup, $ionicHistory, $timeout, $window) {

    $timeout(function(){
      $scope.stateName = $state.current.views.MainMenuContent.name;
    }, 300)
    
    $scope.$watch('contactResponse', function(val){
//      $log.debug("CONTACT RESPONSE CHANGED ", val);
      contactResponse = JSON.parse(localStorage.getItem('contactResponse'));
      $scope.userName = contactResponse.name;
    });
  
    $scope.$watch('studentDetailsHeader', function(val){
      $scope.stateName = $rootScope.studentDetailsHeader;
    });
    
    $rootScope.$on('$stateChangeSuccess', 
    function(event, toState, toParams, fromState, fromParams){ 
      $scope.showBackButton = false;
      $log.debug("State ", $state.current);
      $scope.currentState = $state.current;
      if($state.current.views != undefined && ('MainMenuContent' in $state.current.views)){
        $scope.stateName = $state.current.views.MainMenuContent.name;
        $log.debug("$stateChangeSuccess ", $scope.stateName);
        if($scope.stateName == 'Settings' || $scope.stateName == 'Student Details' || $scope.stateName == 'Photos' || $scope.stateName == 'Programs' || $scope.stateName == 'Calendar' || $scope.stateName == 'Health Check' || $scope.stateName == 'Activities' || ($scope.stateName == 'Notifications' && $state.current.name == 'app.composer')){
          $scope.showBackButton = true;
        }
        else if($scope.stateName == 'School Finder Specific'){
          $scope.showBackButton = true;
          $timeout(function(){   
            $log.debug("School Name ", $scope.schoolName);
            $scope.stateName = $rootScope.schoolName;
          }, 500);
        }
        else if($scope.stateName == 'Add New Action'){
          $scope.showBackButton = true;
          $timeout(function(){   
            if($rootScope.editAction){
              $scope.stateName = 'Edit Action'
            }
          }, 500);
        }
        else{
          $scope.showBackButton = false;
        }  
      }
    });
  
    $scope.goBack = function(){
      $log.debug("STATE ", $state.current);
      if('MainMenuContent' in $state.current.views){
        if($state.current.views.MainMenuContent.name == 'School Finder Specific'){
          $state.go('app.schoolFinderMain');
        }
        else if($state.current.views.MainMenuContent.name == 'Programs' || $state.current.views.MainMenuContent.name == 'Calendar'){
          $state.go('app.schoolFinderSpecific');
        }
        else{
          $window.history.back();
        }
      }
      else if('ParentMainMenuContent' in $state.current.views){
        $window.history.back();
      }
    }
    
    var contactResponse = $rootScope.contactResponse;

    $scope.userName = contactResponse.name;
    $scope.profilePicUrl = contactResponse.photoUrl;
    $scope.userType = contactResponse.type;

    $scope.logout = function () {
      var myPopup;
      myPopup = $ionicPopup.show({
        template: 'Are you sure you want to logout',
        title: 'Confirm logout',
        scope: $scope,
        buttons: [
          {text: 'No'},
          {
            text: '<b>Yes</b>',
            type: 'button-calm',
            onTap: function () {
              $cordovaSQLite.execute(db, "DELETE FROM newfeedData");
              GlobalService.logout();
              $state.go('signin');
            }
          }
        ]
      });
      $timeout(function () {
        myPopup.close();
      }, 30000);
    };
  
    $scope.goToState = function(state){
      if(state == 'app.schoolFinderMain'){
        $ionicHistory.clearCache().then(function () {
          $log.debug("Clear Cache ");
          $state.go(state);
        });
      }
      else if(state == 'app.people'){
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
