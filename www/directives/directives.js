angular.module('toddlytics')
  .directive('slideMenu', function () {
    return {
      restrict: 'E',
      controller: function ($scope, $state, $rootScope, GlobalService, $ionicPopup, $timeout, $cordovaSQLite) {

        var contactResponse = $rootScope.contactResponse;

        $scope.userName = contactResponse.name;
//        $scope.profilePicUrl = contactResponse.photoUrl;
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
      },
      templateUrl: 'directives/mainMenu.html'
    };
  });
