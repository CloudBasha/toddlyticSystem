'use strict';
angular.module('toddlytics')
  .controller('schoolFinderSpecificCtrl',
    function ($scope, $state, $http, $timeout, GlobalService, schoolFinderService, $stateParams, $rootScope, $ionicPopup, deviceDetector, $log, API_URL, $ionicModal, ionicTimePicker, ionicDatePicker, $ionicActionSheet, kidsService, $cordovaLaunchNavigator) {

    if($stateParams.obj != null){
      $scope.school = $stateParams.obj;
      localStorage.setItem('school', JSON.stringify($scope.school));
    }
    else{
      var localSchoolObj = localStorage.getItem('school');
      $scope.school = JSON.parse(localSchoolObj);
    }
  
    $scope.showToddlyticSchoolFunctions = false;
    console.log('SCHOOL', $scope.school);

    if($stateParams.myCoord != null){
      $scope.myLatLng  = $stateParams.myCoord;
    }
    console.log('My coord', $scope.myLatLng);

    $rootScope.schoolName = $scope.school.name;
    $scope.data = {carouselIndex: 0};
    var contactResponse = $rootScope.contactResponse;
    $scope.checkNFindSchool = function(){
      var checkSchoolName = _.filter($scope.allSchools, function(o) {
        return o.schoolName.indexOf($scope.placeDetails.name) >= 0;
      });
      $log.debug("$scope.placeDetails.name ", $scope.placeDetails.name);
      $log.debug("$scope.allSchools ", $scope.allSchools);
      $log.debug("Check School Name ", checkSchoolName);
      var test = checkSchoolName[0].schoolName.indexOf($scope.placeDetails.name);
      $log.debug("Check School Name test", test);
    }

    $scope.getPlaceInfo = function(){
      GlobalService.showLoading();
      var service = new google.maps.places.PlacesService(document.getElementById('main').appendChild(document.createElement('div')));
      $log.debug("PLace ", $scope.school);
      var placeDetailsRequest = {
          placeId: $scope.school.place_id
      };
      service.getDetails(placeDetailsRequest, getDetailsCallback);

      function getDetailsCallback(getDetailsResults, getDetailsStatus) {
          $scope.schoolPhotos = [];
          $scope.schoolReviews = [];
          if (getDetailsStatus == google.maps.places.PlacesServiceStatus.OK) {
              $log.debug("Place Detail Info ", getDetailsResults);
              $scope.placeDetails = getDetailsResults;
              $scope.placeLat = getDetailsResults.geometry.location.lat();
              $scope.placeLong = getDetailsResults.geometry.location.lng();
              GlobalService.hideLoading();
              if(getDetailsResults.photos != undefined && getDetailsResults.photos.length > 0){
                angular.forEach(getDetailsResults.photos, function(photo){
                  var photoUrl = photo.getUrl({maxWidth: 640});
//                  $log.debug("PHOTO URL ", photoUrl);
                  $scope.schoolPhotos.push(photoUrl);
                });
              }
              if(getDetailsResults.reviews != undefined && getDetailsResults.reviews.length > 0){
                $scope.rating = getDetailsResults.rating;
                angular.forEach(getDetailsResults.reviews, function(review){
                  $scope.schoolReviews.push(review);
//                  $timeout(function(){
//                    adjustReviewHeight();
//                  }, 2000)
                });
              }

              var APIname = 'app/p_listSchool';

              schoolFinderService.getSchoolsList({}, APIname).then(function (listResponse) {
                if (typeof listResponse.status && listResponse.status === 422) {
                  GlobalService.hideLoading();
                  GlobalService.showToast("Error Occurred", 'long', 'bottom');
                }
                else if (angular.isDefined(listResponse) && listResponse.status === 200 && listResponse.data.status !== 'FAILED') {
                  GlobalService.hideLoading();
                  var response = listResponse.data;
                  $scope.allSchools = response.list;
                  $log.debug("List Schools ", $scope.allSchools);
                  checkToddlyticSchoolMatch($scope.allSchools, $scope.placeDetails);
                }
                else {
                  GlobalService.hideLoading();
                  GlobalService.showToast("Error Occurred", 'long', 'bottom');
                }
              }, function(err){
                $log.debug("List School Error ", err);
              });
          }
          else if(getDetailsStatus == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              GlobalService.hideLoading();
          }
      }
    }

    $scope.getPlaceInfo();

    function adjustReviewHeight(){
      $scope.checkReviewsHeightArray = [];
      for (var x=0; x < $scope.schoolReviews.length; x++){
        var container = $('#schoolSpecificContainer_'+x).height();
        $log.debug("container ", container);
        $scope.checkReviewsHeightArray.push(container);
      }
      var maxHeight = _.max($scope.checkReviewsHeightArray);
      if(maxHeight != -Infinity){
        $scope.containerHeight = maxHeight;
        $log.debug("$scope.containerHeight ", $scope.containerHeight);
        $log.debug("$scope.checkReviewsHeightArray ",  $scope.checkReviewsHeightArray);
      }
    }

    $scope.setChildInfo = function(child, form){
      if(child == 'Add Child'){
        $log.debug("Child ", child);
        $scope.showNewChildInfo = true;
        $scope.appointment.studentId = null;
        $scope.childValue = child;
      }
      else{
        $log.debug("Child ", JSON.parse(child));
        var newChild = JSON.parse(child);
        $scope.appointment.studentId = newChild.studentId.toString();
        $scope.appointment.childName = null;
        $scope.appointment.childGender = null;
        $scope.appointment.childDob = null;
        $scope.showNewChildInfo = false;
        $scope.childValue = child;
        $log.debug("Form ", form);
      }
    }

    function checkToddlyticSchoolMatch(schools, place){
      var schoolMatch = _.find(schools, function(o) { return o.googlePlaceUrl == place.place_id; });
      if(schoolMatch != undefined){
        $log.debug("School Matched With Toddlytic ", schoolMatch);
        $scope.schoolMatch = schoolMatch;
        var schoolIdObj = {
          schoolId : schoolMatch.schoolId.toString()
        };
        $scope.schoolId = schoolMatch.schoolId.toString();
        $http.post(API_URL +'app/p_getSchoolInfo', schoolIdObj)
        .success(function(response) {
              $log.debug("School Info Response ", response);
              $scope.schoolInfoObj = response;
              $http.post(API_URL +'app/checkOrgIsLeadBySchoolId', schoolIdObj)
              .success(function(response2) {
                    $log.debug("Lead Enabled Response ", response2);
                    if(response2.is_lead_enabled){
                      $scope.showToddlyticSchoolFunctions = true;
                      var getStudents = JSON.parse(localStorage.getItem('studentInfo'));
                      var freeStudents = _.filter(getStudents, function(o){
                        return o.programSchoolId == null;
                      });
                      $scope.freeStudents = freeStudents;
                    }
                    else{
                      $scope.showToddlyticSchoolFunctions = false;
                    }
                }, function(err) {
                    //fail case
                    $log.debug("Error ", err);
                });
          }, function(err) {
              //fail case
              $log.debug("Error ", err);
          });
      }
      $timeout(function(){
        adjustReviewHeight();
      }, 500);
    }

    $ionicModal.fromTemplateUrl('schoolFinder/appointment.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.openAppointmentModal = function() {
      $scope.appointment = {
        contactId: contactResponse.contactId.toString(),
        schoolId: $scope.schoolId
      };
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });



    var timeOptions = {
      callback: function (val) {      //Mandatory
        if (typeof (val) === 'undefined') {
          console.log('Time not selected');
        } else {
          var selectedTime = new Date(val * 1000);
          //$log.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
          $scope.appointment.preferredTime = moment(moment().set('hour', selectedTime.getUTCHours()).set('minute', selectedTime.getUTCMinutes()).unix() * 1000).format('h:mm A');
        }
      },
//      inputEpochTime: (((new Date()).getHours() + 1) * 60 * 60),
      inputTime: 36000,
      format: 12,         //Optional
      step: 30,           //Optional
      setLabel: 'Set'    //Optional
    };

    $scope.openTimePicker = function() {
      ionicTimePicker.openTimePicker(timeOptions);
    }
    
    $scope.fromDate = new Date().setDate(new Date().getDate() + 1);


    $scope.appointmentDatePickerOptions = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.appointment.preferredDate = moment(val).format('DD-MM-YYYY');
      },
      from: new Date(),
      inputDate : new Date($scope.fromDate),
      closeOnSelect: true,       //Optional
      templateType: 'popup'       //Optional
    };



    $scope.childDatePickerOptions = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.appointment.childDob = moment(val).format('DD-MM-YYYY');
      },
      from: '',
      to: new Date(), //Optional
      closeOnSelect: true,       //Optional
      templateType: 'popup',       //Optional
    };

    $scope.openDatePicker = function(options){
      ionicDatePicker.openDatePicker(options);
    };

    $scope.makeAppointment = function (isValid) {
      console.log($scope.appointment);
//      if(isValid){
        if($scope.childValue == 'Add Child' && ($scope.appointment.preferredDate && $scope.appointment.preferredTime && $scope.appointment.childDob != null && $scope.appointment.childGender != null && $scope.appointment.childName != null)){
          GlobalService.showLoading();
          schoolFinderService.makeParentAppointment($scope.appointment).then(function(resp) {
            console.log(resp);
            if(resp.status === "Success") {
              $scope.appointmentChild = '';
              var contactIdObj = {
                contactId : $rootScope.contactResponse.contactId.toString()
              }
              kidsService.refreshStudents(contactIdObj).then(function(resp) {
                console.log("REFRESH STUDENTS ", resp);
                localStorage.setItem('studentInfo', JSON.stringify(resp.list));
                $scope.closeModal();
                GlobalService.hideLoading();
                GlobalService.showToast('Your appointment has been submitted for confirmation', 'long', 'bottom');
              });
            } else {
              GlobalService.hideLoading();
              GlobalService.showToast('Unsuccessful. Try Again in a moment.', 'long', 'bottom');
            }
          });
        }
        else if(isValid){
          GlobalService.showLoading();
          schoolFinderService.makeParentAppointment($scope.appointment).then(function(resp) {
            console.log(resp);
            if(resp.status === "Success") {
              $scope.appointmentChild = '';
              $scope.closeModal();
              GlobalService.hideLoading();
              GlobalService.showToast('Your appointment has been submitted for confirmation', 'long', 'bottom');
            } else {
              GlobalService.hideLoading();
              GlobalService.showToast('Unsuccessful. Try Again in a moment.', 'long', 'bottom');
            }
          });
        }
        else if($scope.childValue != 'Add Child' && ($scope.appointment.preferredDate && $scope.appointment.preferredTime)){
          GlobalService.showLoading();
          schoolFinderService.makeParentAppointment($scope.appointment).then(function(resp) {
            console.log(resp);
            if(resp.status === "Success") {
              $scope.appointmentChild = '';
              $scope.closeModal();
              GlobalService.hideLoading();
              GlobalService.showToast('Your appointment has been submitted for confirmation', 'long', 'bottom');
            } else {
              GlobalService.hideLoading();
              GlobalService.showToast('Unsuccessful. Try Again in a moment.', 'long', 'bottom');
            }
          });
        }
//      }
    }

    $scope.navigateToLocation = function(){
      $log.debug("CHECKING NAVIGATION");
      launchnavigator.navigate([$scope.placeLat , $scope.placeLong], {start: [$scope.myLatLng.latitude, $scope.myLatLng.longitude]});
    }

//    $scope.navigateToLocation = function() {
//      var options = {destinationName : $scope.placeDetails.name};
//      var destination = [$scope.placeLat, $scope.placeLong];
//      var start = [$scope.myLatLng.latitude, $scope.myLatLng.longitude];
//      launchnavigator.navigate(destination).then(function(res) {
//        console.error("Navigator launched ", res);
//      }, function (err) {
//        alert("Navigator error " + error);
//        console.error(err);
//      });
//    };

    $scope.goToSchoolPrograms = function(){
      if($rootScope.loginResponse.type == 'ADMIN'){
        $state.go('app.schoolFinderPrograms', {obj : $scope.schoolInfoObj.programs});
      }
      else if($rootScope.loginResponse.type == 'PARENT'){
        $state.go('pApp.schoolFinderPrograms', {obj : $scope.schoolInfoObj.programs});
      }
    }

    $scope.goToCalendar = function(){
      if($rootScope.loginResponse.type == 'ADMIN'){
        $state.go('app.schoolFinderCalendar', {obj : $scope.schoolInfoObj});
      }
      else if($rootScope.loginResponse.type == 'PARENT'){
        $state.go('pApp.schoolFinderCalendar', {obj : $scope.schoolInfoObj});
      }
    }

    var hideSheet;
    $scope.show = function() {

     // Show the action sheet
     if($scope.schoolMatch.email == null || $scope.schoolMatch.email == ''){
       hideSheet = $ionicActionSheet.show({
       buttons: [
        { text: '<span class="padding"><i class="fa fa-phone" style="font-size: 25px;"> Call School</i></span>' },
       ],
       titleText: '<span class="actionSheetContactSchool">Contact School</span>',
       cancelText: 'Cancel',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
        $scope.contactSchool(index);
       }
     });
     }
     else{
       hideSheet = $ionicActionSheet.show({
         buttons: [
          { text: '<span class="padding"><i class="fa fa-phone" style="font-size: 25px;"> Call School</i></span>' },
           { text: '<span class="padding"><i class="fa fa-envelope" style="font-size: 25px;" aria-hidden="true"> Email School</i></span>' }
         ],
         titleText: '<span class="actionSheetContactSchool">Contact School</span>',
         cancelText: 'Cancel',
         cancel: function() {
              // add cancel code..
            },
         buttonClicked: function(index) {
          $scope.contactSchool(index);
         }
       });
     }

   };

    $scope.contactSchool = function(index){
        if(index == 0){
//          window.open('tel:'+$scope.schoolMatch.contactNumber);
          if($scope.schoolMatch.contactNumber == null || $scope.schoolMatch.contactNumber == ''){
            $scope.schoolMatch.contactNumber = $scope.placeDetails.international_phone_number;
          }

          window.plugins.CallNumber.callNumber(onSuccess, onError, $scope.schoolMatch.contactNumber, true);

        }
        else{
          cordova.plugins.email.open({
              to:      $scope.schoolMatch.email,
              subject: 'I would like to enquire about',
              body:    '',
              isHtml:  true
          });
        }

   }

    function onSuccess(result){
      console.log("Success:"+result);
    }

    function onError(result) {
      console.log("Error:"+result);
    }

    $scope.openSchoolReferral = function(){
      var contactInfo = JSON.parse(localStorage.getItem('contactResponse'));
      var paramObj = {
        schoolName : $scope.placeDetails.name,
        schoolContactNo : $scope.placeDetails.international_phone_number,
        schoolAddress : $scope.placeDetails.formatted_address,
        parentName : contactInfo.name,
        parentEmail : contactInfo.email,
        parentContactNo : contactInfo.mobilePhone
      }
      $state.go('pApp.referSchool', {placeParams : paramObj})
    }
  });
