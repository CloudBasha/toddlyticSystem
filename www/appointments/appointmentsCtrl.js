'use strict';
angular.module('toddlytics')
  .controller('appointmentsCtrl', function ($scope, $state, GlobalService, $rootScope, $stateParams, appointmentsService, authService, $log, $ionicPopup, $window, $cordovaEmailComposer) {

     if($stateParams.push){
      GlobalService.showToast($stateParams.push.additionalData.pushToast, 'long', 'bottom');
    }
    
    var service = new google.maps.places.PlacesService(document.getElementById('appointmentContent').appendChild(document.createElement('div')));
    var data = {
      contactId: $rootScope.contactResponse.contactId.toString()
    };
    GlobalService.showLoading('Loading Appointments');
    appointmentsService.appointmentList(data).then(function(res) {
      $scope.appointments = res;
      console.log('APPOINTMENTS', $scope.appointments);
      var counter = 0;
      for(var i=0; i<$scope.appointments.list.length;i++){
        console.log('Index ', res.list[i]);
        if($scope.appointments.list[i].appointment.school.googlePlaceUrl !== null && $scope.appointments.list[i].appointment.school.googlePlaceUrl !== ''){
          console.log('Index2 ', res.list[i]);
          getSchoolLatLng($scope.appointments.list[i].appointment.school.googlePlaceUrl, i);
        }
      }
      GlobalService.hideLoading();
    });

    $scope.acceptReject = function(appointment, acceptReject){
      GlobalService.showLoading('Loading');
      var data = {
        leadId: appointment.appointment.lead.leadsId.toString(),
        appointmentId: appointment.appointment.appointmentId.toString(),
        contactEmail: $rootScope.contactResponse.email,
        status: acceptReject
      };
      
      var data2 = {
        contactId: $rootScope.contactResponse.contactId.toString()
      };
      appointmentsService.acceptRejectEnrollment(data).then(function(res){
        console.log(res);
        appointmentsService.appointmentList(data2).then(function(res2) {
          $scope.appointments = res2;
          console.log('APPOINTMENTS', $scope.appointments);
          GlobalService.hideLoading();
        });
        if(res.status == 'Success'){
          GlobalService.showToast(res.remark, 'long', 'bottom');
          refreshParentLogin();
        }
        else{
          GlobalService.showToast(res.remark, 'long', 'bottom');
        }
      });
    };
  
    $scope.navigateToLocation = function(lat, lng){
      $log.debug("CHECKING NAVIGATION");
      launchnavigator.navigate([lat , lng]);
    }
  
//    $scope.navigateToLocation = function(lat, lng) {
//      var options = {destinationName : $scope.placeDetails.name};
//      var destination = [lat, lng];
////      var start = [$scope.myLatLng.latitude, $scope.myLatLng.longitude];
//        launchnavigator.navigate(destination).then(function(res) {
//          alert("Navigator launched " + res);
//        }, function (err) {
//          alert("Navigator error " + error);
//          console.error(err);
//        });
//    };
  
    
    $scope.contactSchool = function(school){
      window.plugins.CallNumber.callNumber(onSuccess, onError, school.contactNumber, true);
    }
    
    $scope.mailSchool = function(obj){
        var email = obj.appointment.school.email;
        var subject = 'Inquiry from '+obj.appointment.lead.nameOfParent;
        var message = 'Hi '+obj.adminName+',<br><br>Regarding '+obj.childName+',<br><br>';
      
      $cordovaEmailComposer.isAvailable().then(function() {
         // is available
       }, function () {
         // not available
       });

        var email = {
          to: obj.appointment.school.email,
          subject: subject,
          body: message,
          isHtml: true
        };

       $cordovaEmailComposer.open(email).then(null, function () {
         // user cancelled email
       });
    };
  
    function refreshParentLogin(){
      var data = {
        userEmail: $rootScope.contactResponse.email,
        userPassword: null,
        browsertype: 'mobile',
        devicetype: $rootScope.model,
        httpreferer: $rootScope.remoteIp,
        idToken: null,
        socialType: null,
      };
      
      var APIname = 'refreshLogin';
      
      authService.refreshLogin(data, APIname).then(function (response) {
        console.log("Login Response ", response);
          if (typeof response.status && response.status === 422) {
//            GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response.data) && response.data !== '') {

              var res = response.data;

              if (res.loginStatus == "SUCCESS") {
                localStorage.setItem("token", res.sessionid);
                $rootScope.token = res.sessionid;
                localStorage.setItem('loginResponse', JSON.stringify(res));
                $rootScope.loginResponse = res;
                
                if (response.data.type === 'PARENT') {
                   localStorage.setItem('studentInfo', JSON.stringify(response.data.students));
                }

                var contactObj = {
                  contactId: res.contactId.toString()
                };

                var APIname = 'app/getContactsById';

                authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
                  if (typeof contactResponse.status && contactResponse.status === 422) {
//                    GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                  }
                  else {
                    $rootScope.contactResponse = contactResponse.data.contact;
                    localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                    var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
                    $log.debug("Student Info ", getStudentInfo);
                    var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
                    if(getStudentInfo.length > 0){
                      if(getFavStudent == undefined){
                        var studentsArray = _.filter(getStudentInfo, function(o) { return o.programSchoolId != null; });
                        localStorage.setItem('favoriteStudentInfo', JSON.stringify(studentsArray[0]));
                      }
                    }
                    GlobalService.hideLoading();
                    $state.go('pApp.newsfeed');
                  }
                });
              }
              else {
                GlobalService.hideLoading();
//                GlobalService.showToast("You login attempt was unsuccessful. " + response.data.remark, 'long', 'bottom');
              }
            }
            else {
//              GlobalService.showToast("You login attempt was unsuccessful. ", 'long', 'bottom');
            }
          }
      });
    }

    function onSuccess(result){
      console.log("Success:"+result);
    }

    function onError(result) {
      console.log("Error:"+result);
    }
  
    $scope.doRefresh = function () {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.$apply();
      var data = {
        contactId: $rootScope.contactResponse.contactId.toString()
      };
      GlobalService.showLoading('Loading Appointments');
      appointmentsService.appointmentList(data).then(function(res) {
        $scope.appointments = res;
        console.log('APPOINTMENTS', $scope.appointments);
        GlobalService.hideLoading();
      });
    };
  
    $scope.moreInfo = function(appointment){
      if($rootScope.currency != undefined){
        if(appointment.billingPeriod != null){
          var myPopup = $ionicPopup.show({
            title: 'Enrollment Info',
            template: 'Program Name - '+appointment.programName+'<br>Billing Period - '+appointment.billingPeriod + '<br>Billing Fee - '+$rootScope.currency + appointment.billingFee,
            buttons: [
              {
                text: 'Close',
                type: 'button-calm',
              }
            ]
          });
        }
        else{
          var myPopup = $ionicPopup.show({
            title: 'Enrollment Info',
            template: 'Program Name - '+appointment.programName,
            buttons: [
              {
                text: 'Close',
                type: 'button-calm',
              }
            ]
          });
        }
      }
      else{
        if(appointment.billingPeriod != null){
          var myPopup = $ionicPopup.show({
            title: 'Enrollment Info',
            template: 'Program Name - '+appointment.programName+'<br>Billing Period - '+appointment.billingPeriod + '<br>Billing Fee - '+appointment.billingFee,
            buttons: [
              {
                text: 'Close',
                type: 'button-calm',
              }
            ]
          });
        }
        else{
          var myPopup = $ionicPopup.show({
            title: 'Enrollment Info',
            template: 'Program Name - '+appointment.programName,
            buttons: [
              {
                text: 'Close',
                type: 'button-calm',
              }
            ]
          });
        }
      }
    };
  
    function getSchoolLatLng(placeId, index){
      var placeDetailsRequest = {
          placeId: placeId
      };
      service.getDetails(placeDetailsRequest, getDetailsCallback);

      function getDetailsCallback(getDetailsResults, getDetailsStatus) {
          if (getDetailsStatus == google.maps.places.PlacesServiceStatus.OK) {
              $log.debug("Place Detail Info ", getDetailsResults);
              $scope.appointments.list[index].lat = getDetailsResults.geometry.location.lat();
              $scope.appointments.list[index].lng = getDetailsResults.geometry.location.lng();
              
          }
      }
    }
});
