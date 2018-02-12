'use strict';
angular.module('toddlytics')
  .controller('gettingStartedCtrl', function ($scope, $state, GlobalService, $rootScope, $ionicPopover, $cordovaCamera, $cordovaFile, $ionicModal, $cordovaSQLite, ionicDatePicker, $ionicSlideBoxDelegate, gettingStartedService, $log) {
    $scope.options = {
      loop: false,
      effect: 'fade',
      speed: 500,
    };

    $scope.school = {
      student_list: [],
      ageFrom: {
        years: '',
        months: ''
      },
      ageTo: {
        years: '',
        months: ''
      }
    };

    $scope.student = {
      name: '',
      dob: ''
    };

    $scope.getGooglePlaceInfo = function(place){
			if(place.name != undefined){
				$log.debug("Google Place ", place);
				$scope.school.googlePlaceUrl = place.place_id;
				$scope.school.name = place.name;
        if(place.international_phone_number){
					$scope.school.schoolPhone = place.international_phone_number.replace(/-|\s/g,"");
				}
			}
			else{
				$log.debug("Google Place Url Reset");
				$scope.school.googlePlaceUrl = null;
        $scope.school.schoolPhone = null;
			}
		}

    $scope.addStudent = function() {
      if (!$scope.student.name || !$scope.student.dob) {
        GlobalService.showToast('Please enter Student Name and Date of Birth', 'long', 'bottom');
        return;
      }
      var temp = angular.copy($scope.student);
      $scope.school.student_list.push(temp);
      $scope.student = {
        name: '',
        dob: ''
      };
    };

    $scope.removeStudent = function(index) {
      $scope.school.student_list.splice(index, 1);
    };

    var datePickerOptions = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.student.dob = moment(val).format('DD-MM-YYYY');
        $scope.addStudent();
      },
      from: '',
      to: new Date(), //Optional
      closeOnSelect: true,       //Optional
      templateType: 'popup'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(datePickerOptions);
    };

    $scope.lockSlide = function() {
      $ionicSlideBoxDelegate.enableSlide(false);
    };

    $rootScope.skip = function() {
      GlobalService.hideLoading();
      $state.go('app.newsfeed');
    };

    $scope.back = function() {
      $ionicSlideBoxDelegate.previous();
    };

    $scope.submit = function() {
      GlobalService.showLoading();
      var startAge = $scope.school.ageFrom.years;
      var endAge = $scope.school.ageTo.years;
      var data = {
        orgId: $rootScope.loginResponse.organizationId,
        schoolName: $scope.school.name,
        programName: $scope.school.program_name,
        startAge: startAge.toString(),
        endAge: endAge.toString(),
        students: $scope.school.student_list,
        googlePlaceUrl : $scope.school.googlePlaceUrl,
        contactEmail: $rootScope.contactResponse.email
      };
      console.log(data);
      gettingStartedService.gettingStarted(data).then(function(resp) {
        $rootScope.skip();
      });
    };

    $scope.schoolDetails = function() {
      if (!$scope.school.name || !$scope.school.program_name || !$scope.school.ageFrom || !$scope.school.ageTo) {
        $scope.showError = true;
        return;
      }
      if($scope.school.ageFrom.years >= $scope.school.ageTo.years) {
        $scope.showError = true;
        GlobalService.showToast('Start age cannot be greater than or equal to end age', 'long', 'bottom');
        return;
      }
//      if($scope.school.ageTo.months > 12 || $scope.school.ageTo.months < 0) {
//        $scope.showTo = true;
//        return;
//      }
      $ionicSlideBoxDelegate.next();
    };

    $scope.studentDetails = function () {
      if(!$scope.school.student_list.length) {
        GlobalService.showToast('Please enter atleast one student.', 'long', 'bottom');
        return;
      }
      $ionicSlideBoxDelegate.next();
    };

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
    });
  });
