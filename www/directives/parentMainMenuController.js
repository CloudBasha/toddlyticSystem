'use strict';
angular.module('toddlytics')
  .controller('parentMainMenuCtrl', function ($scope, $state, $log, GlobalService, $rootScope, $ionicPopover, $cordovaCamera, $cordovaFile, $ionicModal, $cordovaSQLite, $ionicPopup, $ionicHistory, $timeout, $window) {

    $timeout(function(){
      $scope.stateName = $state.current.views.ParentMainMenuContent.name;
      $scope.haveChild = $rootScope.loginResponse.haveChild;
    }, 300)

    $scope.$watch('contactResponse', function(val){
      $log.debug("CONTACT RESPONSE CHANGED ", val);
      $rootScope.contactResponse = val;
      $rootScope.init();
      $scope.userName = contactResponse.name;
    });

//    $scope.$watch('profilePhotoChanged', function(val){
//      if(val == true){
//        $log.debug("profilePhotoChanged CHANGED ", val);
//        contactResponse = JSON.parse(localStorage.getItem('contactResponse'));
//        $scope.profilePicUrl = $rootScope.checkImageUrl(contactResponse.photoUrl);
//        $timeout(function(){
//          $window.location.reload();
//        }, 500);
//      }
//    });

    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams){
      $scope.haveChild = $rootScope.loginResponse.haveChild;
      $scope.showBackButton = false;
      $log.debug("State ", $state.current);
      $scope.currentState = $state.current;
      if($state.current.views != undefined && ('ParentMainMenuContent' in $state.current.views)){
        $scope.stateName = $state.current.views.ParentMainMenuContent.name;
        $log.debug("$stateChangeSuccess ", $scope.stateName);
        if($scope.stateName == 'Settings' || $scope.stateName == 'Student Details' || $scope.stateName == 'Photos' || $scope.stateName == 'Programs' || $scope.stateName == 'Health Check' || $scope.stateName == 'Activities' || ($scope.stateName == 'Notifications' && $state.current.name == 'pApp.composer')){
          $scope.showBackButton = true;
        }
        else if($scope.stateName == 'School Finder Specific'){
          $scope.showBackButton = true;
          $timeout(function(){
            $log.debug("School Name ", $scope.schoolName);
            $scope.stateName = $rootScope.schoolName;
          }, 500);
        }
        else if ($scope.stateName === 'Kid') {
          $timeout(function(){
            $scope.stateName = toParams.kid.name;
          }, 100);
        }
        else if($scope.stateName == 'Add New Action'){
          $scope.showBackButton = true;
          $timeout(function(){
            if($rootScope.editAction){
              $scope.stateName = 'Edit Action'
            }
          }, 500);
        }
        else if($state.current.name == 'pApp.kid' || $state.current.name == 'pApp.publicCalendar' || $state.current.name == 'pApp.schoolFinderCalendar' || $state.current.name == 'pApp.kids' || $state.current.name == 'pApp.schoolFinderMain' || $state.current.name == 'pApp.appointments' || $state.current.name == 'pApp.inviteSchool' || $state.current.name == "pApp.referSchool" || $state.current.name == 'pApp.myProfile'){
          $scope.showBackButton = true;
        }
        else{
          $scope.showBackButton = false;
        }
      }
    });

    $scope.goBack = function(){
      $log.debug("STATE ", $state.current);
      if('ParentMainMenuContent' in $state.current.views){
        if($state.current.views.ParentMainMenuContent.name == 'School Finder Specific'){
          $state.go('pApp.schoolFinderMain');
        }
        else if($state.current.views.ParentMainMenuContent.name == 'Programs' || $state.current.name == "pApp.referSchool" || ($state.current.name == 'pApp.schoolFinderCalendar')){
          $state.go('pApp.schoolFinderSpecific');
        }
        else if(($state.current.name == 'pApp.calendar' && $rootScope.loginResponse.haveChild == true) || $state.current.name == 'pApp.notifications'){
          $state.go('pApp.newsfeed');
        }
        else if ($state.current.name == 'pApp.inviteSchool') {
          $state.go('pApp.schoolFinderMain');
        }
        else if($state.current.name == 'pApp.publicCalendar' || $state.current.name == 'pApp.schoolFinderMain' || $state.current.name == 'pApp.appointments' || $state.current.name == 'pApp.myProfile'){
          $state.go('pApp.parentLanding');
        }
        else if($state.current.name == 'pApp.kid'){
           $state.go('pApp.kids');
        }
        else{
          $window.history.back();
        }
      }
    }

    var contactResponse = $rootScope.contactResponse;
    $scope.type = $rootScope.loginResponse.type;
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

    $ionicPopover.fromTemplateUrl('directives/kids-menu.html', {
        scope: $scope,
        backdropClickToClose: true,
        animation: 'slide-in-up'
    }).then(function(popover) {
      $scope.popover = popover;
    });


    $scope.openPopover = function($event) {
      $scope.popover.show($event);
    };
    $scope.closePopover = function() {
      $scope.popover.hide();
    };
    //Cleanup the popover when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.popover.remove();
    });
    // Execute action on hidden popover
    $scope.$on('popover.hidden', function() {
      // Execute action
    });

    $rootScope.setFavoriteStudent = function(student, state){
      if(!state){
        localStorage.setItem('favoriteStudentInfo', JSON.stringify(student));
        var favStudentIdObj = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $scope.favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $rootScope.favStudentId = favStudentIdObj.studentId;
        GlobalService.showToast('You have selected '+$scope.favoriteStudent.name, 'long', 'bottom');
        $scope.closePopover();
        $rootScope.getParentNewsFeedData();
        $state.go('pApp.newsfeed');
      }
      else if(state == 'billing'){
        localStorage.setItem('favoriteStudentInfo', JSON.stringify(student));
        var favStudentIdObj = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $scope.favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $rootScope.favStudentId = favStudentIdObj.studentId;
        $rootScope.getParentNewsFeedData();
        $state.go('pApp.billing');
      }
      else if(state == 'calendar'){
        localStorage.setItem('favoriteStudentInfo', JSON.stringify(student));
        var favStudentIdObj = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $scope.favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $rootScope.favStudentId = favStudentIdObj.studentId;
        $rootScope.getParentNewsFeedData();
        $state.go('pApp.calendar');
      }
      else if(state == 'newsfeed'){
        localStorage.setItem('favoriteStudentInfo', JSON.stringify(student));
        var favStudentIdObj = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $scope.favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        $rootScope.favStudentId = favStudentIdObj.studentId;
        $rootScope.getParentNewsFeedData();
        $state.go('pApp.newsfeed');
      }
    }

    $rootScope.init = function(){
      $scope.students = [];
      var localStudents = JSON.parse(localStorage.getItem('studentInfo'));
      angular.forEach(localStudents, function(student){
        if(student.programSchoolId != null){
          $scope.students.push(student);
        }
      });
      var favoriteStudent = localStorage.getItem('favoriteStudentInfo');
      if(favoriteStudent !== 'undefined' && favoriteStudent){
        $scope.favoriteStudent = JSON.parse(favoriteStudent);
      }
      if($scope.favoriteStudent !== undefined){
        $rootScope.favStudentId = $scope.favoriteStudent.studentId;
      }
    }


    $rootScope.init();

  });
