'use strict';
angular.module('toddlytics')
  .controller('studentDetailsPopupCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicPopup, $timeout, studentDetailsService, GlobalService, $ionicModal, $log) {

    var loginResponse = $rootScope.loginResponse;
    var contactResponse = $rootScope.contactResponse;
    var student = studentDetailsService.getStudent();
    var students = $stateParams.students;
    $scope.showTimer = true;
    if(students && students.length) {
      $scope.showTimer = false;
      students = students.map(function(s){
          return s.student.studentId.toString();
      });
      console.log(students);
    }

    $rootScope.timerObj = {
      start: false,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    $scope.buttonText = 'Start';
    $scope.btncolor = 'green';
    $scope.timer = "00:00:00";
    $scope.disable = false;
    $scope.disableMilk = false;

    function checkTime() {
      var rootTimer = $rootScope.timerObj;
      if ($rootScope.timerObj.start == true) {
        var hours = rootTimer.hours;
        var minutes = rootTimer.minutes;
        var seconds = rootTimer.seconds;

        if (rootTimer.hours < 10) {
          hours = '0' + rootTimer.hours;
        }
        if (rootTimer.minutes < 10) {
          minutes = '0' + rootTimer.minutes;
        }
        if (rootTimer.seconds < 10) {
          seconds = '0' + rootTimer.seconds;
        }
        $scope.timer = hours + ':' + minutes + ':' + seconds;
        $timeout(checkTime, 1000);
      }
    }

    $scope.startOrStopTimer = function (txt) {
      if (txt == 'Start') {
        $scope.buttonText = 'Stop';
        $scope.btncolor = 'red';
        $rootScope.timerObj.start = true;
        $rootScope.startTimer();
        checkTime();
        submitActivity('sleepometer', 'Start')
      }
      else if (txt == 'Stop') {
        $scope.buttonText = 'Start';
        $scope.btncolor = 'green';
        $rootScope.timerObj = {
          start: false,
          hours: 0,
          minutes: 0,
          seconds: 0
        };
        $rootScope.timerObj.start = false;
        submitActivity('sleepometer', 'Stop');
      }
    };
  
    $scope.takeAttendance = function (txt) {
      if (txt == 'CheckIn') {
        submitActivity('checkIn', null)
      }
      else if (txt == 'CheckOut') {
        submitActivity('checkOut', null);
      }
    };

    $scope.getMeals = function (menuId) {

      GlobalService.hideLoading();

      $scope.mealList = '';

      $scope.disableMilk = true;

      var list = $scope.menuAndMealList;
      var length = list.length;

      for (var i = 0; i < length; i++) {
        if (menuId == list[i].menu.menuId) {
          $scope.mealList = list[i].mealRecipeList;
          break;
        }
      }
    };

    $scope.openHealthCheck = function () {
      $state.go('app.healthCheck', {students: students});
    };

    $scope.enableMealAndMenu = function (val) {
      $scope.disable = !(val === '' || val === 'undefined' || val === null || val === undefined || val === 'null');
    };

    $scope.medicationPopup = function () {

      $scope.medication = {
        remarks: ''
      };
      $ionicPopup.show({
        template: '<input type="text" placeholder="Remarks" ng-model="medication.remarks">',
        title: 'Medication',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'btn-theme',
            onTap: function () {

              if ($scope.medication.remarks !== '' && $scope.medication.remarks !== undefined) {
                submitActivity('medication', $scope.medication)
              }
              else {
                GlobalService.showToast("Please enter remarks", 'long', 'bottom');
              }
            }
          }
        ]
      });
    };

    $scope.mealPopup = function () {

      $scope.meal = {
        milkQty: '',
        menuId: '',
        mealId: ''
      };

      var mealPopup = $ionicPopup.show({
        templateUrl: 'studentDetails/meal.html',
        title: 'Meal',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'btn-theme',
            onTap: function () {
              if ($scope.meal.milkQty != '' && $scope.meal.milkQty != null && $scope.meal.milkQty != undefined) {
                submitActivity('bottleFeeding', $scope.meal)
              }
              else if ($scope.meal.menuId != '' && $scope.meal.menuId != null && $scope.meal.menuId != undefined) {
                if ($scope.meal.mealId != '' && $scope.meal.mealId != null && $scope.meal.mealId != undefined) {
                  submitActivity('meal', $scope.meal)
                }
                else {
                  GlobalService.showToast("Please choose meal items", 'long', 'bottom');
                }
              }
              else {
                GlobalService.showToast("Please enter milk or select menu and meal items", 'long', 'bottom');
              }
            }
          }
        ]
      });
      $timeout(function () {
        mealPopup.close(); //close the popup after 3 seconds for some reason
      }, 300000);
    };

    $scope.hygienePopup = function () {

      GlobalService.hideLoading();

      $scope.hygiene = {
        bathStatus: false,
        smallPotty: false,
        bigPotty: false
      };

      var hygienePopup = $ionicPopup.show({
        templateUrl: 'studentDetails/hygiene.html',
        title: 'Hygiene',
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'btn-theme',
            onTap: function () {
              submitActivity('hygiene', $scope.hygiene)
            }
          }
        ]
      });

      $timeout(function () {
        hygienePopup.close(); //close the popup after 3 seconds for some reason
      }, 300000);
    };

    function submitActivity(activity, data) {
      GlobalService.showLoading();
      var activityArray = [];
      var d = new Date();
//      var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
//        + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":"
//        + ("0" + d.getSeconds()).slice(-2);
      var datestring = moment().tz('Asia/Kuala_Lumpur').format('DD-MM-YYYY HH:mm:ss');

      if (activity == 'hygiene') {

        if (data.bathStatus == true) {

          var submitActivityObj = {
            trackingType: "bath",
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: '',
            remark: '',
            complete_status: '',
            temperature: '',
            rashes: false,
            mouth_ulcer: false,
            blister: '',
            drooling_saliva: false,
            red_watery_eyes: false,
            cough: false,
            runny_nose: false,
            virus: false,
            start_time: datestring,
            end_time: '',
            contactEmail: contactResponse.email
          };
          if (student) {
            submitActivityObj.studentId = student.studentId.toString()
            activityArray.push(submitActivityObj);
          } else {
            students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
            })
          }
        }

        if (data.smallPotty == true) {

          submitActivityObj = {
            trackingType: "potty1",
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: '',
            remark: '',
            complete_status: '',
            temperature: '',
            rashes: false,
            mouth_ulcer: false,
            blister: '',
            drooling_saliva: false,
            red_watery_eyes: false,
            cough: false,
            runny_nose: false,
            virus: false,
            start_time: datestring,
            end_time: '',
            contactEmail: contactResponse.email
          };
          if (student) {
            submitActivityObj.studentId = student.studentId.toString()
            activityArray.push(submitActivityObj);
          } else {
            students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
            })
          }
        }

        if (data.bigPotty == true) {

          submitActivityObj = {
            trackingType: "potty2",
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: '',
            remark: '',
            complete_status: '',
            temperature: '',
            rashes: false,
            mouth_ulcer: false,
            blister: '',
            drooling_saliva: false,
            red_watery_eyes: false,
            cough: false,
            runny_nose: false,
            virus: false,
            start_time: datestring,
            end_time: '',
            contactEmail: contactResponse.email
          };
          if (student) {
            submitActivityObj.studentId = student.studentId.toString()
            activityArray.push(submitActivityObj);
          } else {
            students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
            })
          }
        }
      }

      else if (activity == 'bottleFeeding') {

        submitActivityObj = {
          trackingType: "bottleFeeding",
          quantity: data.milkQty.toString(),
          mealId: '',
          menuId: '',
          unit: 'Oz',
          value: '',
          remark: '',
          complete_status: '',
          temperature: '',
          rashes: false,
          mouth_ulcer: false,
          blister: '',
          drooling_saliva: false,
          red_watery_eyes: false,
          cough: false,
          runny_nose: false,
          virus: false,
          start_time: datestring,
          end_time: '',
          contactEmail: contactResponse.email
        };
        if (student) {
          submitActivityObj.studentId = student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }

      else if (activity == 'meal') {

        submitActivityObj = {
          trackingType: "meal",
          quantity: '',
          mealId: data.mealId.toString(),
          menuId: data.menuId.toString(),
          unit: '',
          value: '',
          remark: '',
          complete_status: '',
          temperature: '',
          rashes: false,
          mouth_ulcer: false,
          blister: '',
          drooling_saliva: false,
          red_watery_eyes: false,
          cough: false,
          runny_nose: false,
          virus: false,
          start_time: datestring,
          end_time: '',
          contactEmail: contactResponse.email
        };
        if (student) {
          submitActivityObj.studentId = student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }

      else if (activity == 'medication') {
        submitActivityObj = {
          trackingType: "medication",
          mealId: '',
          menuId: '',
          quantity: '',
          unit: '',
          value: '',
          remark: data.remarks,
          complete_status: '',
          temperature: '',
          rashes: false,
          mouth_ulcer: false,
          blister: '',
          drooling_saliva: false,
          red_watery_eyes: false,
          cough: false,
          runny_nose: false,
          virus: false,
          start_time: datestring,
          end_time: '',
          contactEmail: contactResponse.email
        };
        if (student) {
          submitActivityObj.studentId = student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }

      else if (activity == 'sleepometer') {
        if (data == 'Start') {
          submitActivityObj = {
            trackingType: "sleep",
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: 'Start',
            remark: '',
            complete_status: '',
            temperature: '',
            rashes: false,
            mouth_ulcer: false,
            blister: '',
            drooling_saliva: false,
            red_watery_eyes: false,
            cough: false,
            runny_nose: false,
            virus: false,
            start_time: datestring,
            end_time: '',
            contactEmail: contactResponse.email
          };
          if (student) {
            submitActivityObj.studentId = student.studentId.toString()
            activityArray.push(submitActivityObj);
          } else {
            students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
            })
          }
        }
        else if (data == 'Stop') {
          submitActivityObj = {
            trackingType: "sleep",
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: 'End',
            remark: '',
            complete_status: '',
            temperature: '',
            rashes: false,
            mouth_ulcer: false,
            blister: '',
            drooling_saliva: false,
            red_watery_eyes: false,
            cough: false,
            runny_nose: false,
            virus: false,
            start_time: datestring,
            end_time: datestring,
            contactEmail: contactResponse.email
          };
          if (student) {
            submitActivityObj.studentId = student.studentId.toString()
            activityArray.push(submitActivityObj);
          } else {
            students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
            })
          }
        }
      }
      else if (activity == 'checkIn') {
        $scope.checkIn = false;
        $scope.checkInTime = d;

        var submitActivityObj = {
          trackingType: "checkIn",
          mealId: '',
          menuId: '',
          quantity: '',
          unit: '',
          value: "True",
          remarks: '',
          complete_status: '',
          temperature: '',
          rashes: false,
          mouth_ulcer: false,
          blister: '',
          drooling_saliva: false,
          red_watery_eyes: false,
          cough: false,
          runny_nose: false,
          virus: false,
          start_time: datestring,
          end_time: '',
          contactEmail: contactResponse.email
        };
        
        if (student) {
          submitActivityObj.studentId = student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }

      else if (activity == 'checkOut') {

        $scope.checkIn = true;

        submitActivityObj = {
          trackingType: "checkOut",
          mealId: '',
          menuId: '',
          quantity: '',
          unit: '',
          value: "True",
          remarks: '',
          complete_status: '',
          temperature: '',
          rashes: false,
          mouth_ulcer: false,
          blister: '',
          drooling_saliva: false,
          red_watery_eyes: false,
          cough: false,
          runny_nose: false,
          virus: false,
          start_time: datestring,
          end_time: '',
          contactEmail: contactResponse.email
        };
        
        if (student) {
          submitActivityObj.studentId = student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }

      var postActivityObj = {
        tracking_list: activityArray
      };

      var APIname = 'app/c_tracking_list';

      console.log("Tracking Req ", postActivityObj);
      studentDetailsService.c_tracking_list(postActivityObj, APIname).then(function (response) {

        if (typeof response.status && response.status === 422) {
          GlobalService.hideLoading();
          GlobalService.showToast("Error Occurred", 'long', 'bottom');
        }
        else {
          if (angular.isDefined(response)) {
            $log.debug("HELLO ", Object.keys(response.data.studentList));
            if (response.data && response.data.status == "Success" && !Object.keys(response.data.studentList).length){
              GlobalService.hideLoading();
              if (!$rootScope.heldItems.length) {
                GlobalService.showToast('Tracking has been submitted successfully', 'long', 'bottom');
              }
              else{
                GlobalService.showToast('Tracking for multiple students have been submitted successfully', 'long', 'bottom');
                $state.go('app.people');
              }
            }
            else if (response.data && response.data.status == "Success" && Object.keys(response.data.studentList).length) {
              GlobalService.hideLoading();
              $scope.errorResponse = response.data;
              $scope.showDetails();
            }
          }
        }
      });
    }
  
    $scope.showDetails = function(event) {
      $scope.eventDetails = event;
      $ionicModal.fromTemplateUrl('studentDetails/multiTrackingErrorModal.html', {
        animation: 'slide-in-up',
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.openModal();
      });
    }

    $scope.openModal = function() {
      $scope.modal.show();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    function getMenuAndMeals() {

      var programsObj = {
        orgId: loginResponse.organizationId
      };

      var APIname = 'app/l_menu';

      studentDetailsService.getMenuAndMeals(programsObj, APIname).then(function (response) {
        if (typeof response.status && response.status === 422) {
          GlobalService.showToast("Error Occurred", 'long', 'bottom');
        }
        else {
          $scope.menuAndMealList = response.data.list;
        }
      });
    }

    function getTrackingByStudentId() {

      GlobalService.showLoading();

      var trackingObj = {
        studentId: student.studentId.toString()
      };

      var APIname = 'app/getTrackingByStudentId';

      studentDetailsService.getMenuAndMeals(trackingObj, APIname).then(function (response) {
        if (typeof response.status && response.status === 422) {
          GlobalService.hideLoading();
          GlobalService.showToast("Error Occurred", 'long', 'bottom');
        }
        else {
          $scope.studentTrackList = response.data.list;
          $scope.groupByTrackingType = _.groupBy($scope.studentTrackList, function (track) {
            return track.type_name;
          });

          GlobalService.hideLoading();

          var sleepItems = _.pick($scope.groupByTrackingType, ['sleep', 'sleepoMeter']);
          console.log("YOLO ", sleepItems)
          var sleepGroupItems = [];

//          if (sleepItems.sleep !== undefined && sleepItems.sleepoMeter !== undefined) {
//            sleepGroupItems = sleepItems.sleep.concat(sleepItems.sleepoMeter);
//          }
//          if (sleepItems.sleep !== undefined) {
            sleepGroupItems = sleepItems.sleep;
//          }
//          else {
//            sleepGroupItems = sleepItems.sleepoMeter;
//          }

          console.log("YOLO 2 ", sleepGroupItems);
          if (sleepGroupItems !== undefined && sleepGroupItems.length) {

            var first = sleepGroupItems[0];

            console.log("YOLO Last ", first);
            if (first.value == 'Start') {

              var d = new Date();
              var n = d.getTime();

              var trackTime = n - first.startDateTime;
              var test = convertMS(trackTime);

              $rootScope.timerObj = {
                start: true,
                hours: test.h,
                minutes: test.m,
                seconds: test.s
              };
              $scope.buttonText = 'Stop';
              $scope.btncolor = 'red';
              $rootScope.startTimer();
              checkTime();
            }
          }
        }
      });
    }

    function convertMS(ms) {
      var d, h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;
      return {d: d, h: h, m: m, s: s};
    }

    if(student){
      getTrackingByStudentId();
    }
    getMenuAndMeals();
  })

  .controller('healthCheckCtrl', function ($scope, $state, $stateParams, studentDetailsService, $rootScope, GlobalService, $window) {

    var contactResponse = $rootScope.contactResponse;

    $scope.student = studentDetailsService.getStudent();
    $scope.healthCheckYesOrNo = {val: false};
    $scope.students = $stateParams.students;
    console.log($scope.students);

    $scope.healthCheck = {
      temp: 36.7,
      rashes: false,
      mouthUlcer: false,
      blisters: '',
      drooling: false,
      wateryEyes: false,
      cough: false,
      runnyNose: false,
      virus: false,
      remarks: ''
    };

    function submitActivity(activity) {

      GlobalService.showLoading();

      var activityArray = [];
      var d = new Date();
//      var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
//        + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":"
//        + ("0" + d.getSeconds()).slice(-2);
      var datestring = moment().tz('Asia/Kuala_Lumpur').format('DD-MM-YYYY HH:mm:ss');

      if (activity == 'healthCheck') {

        if ($scope.healthCheckYesOrNo.val == true) {

          var submitActivityObj = {
            trackingType: "healthCheck",
//            studentId: $scope.student ? $scope.student.studentId.toString() : $scope.students,
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: '',
            remark: 'healthy',
            complete_status: '',
            temperature: '',
            rashes: $scope.healthCheck.rashes,
            mouth_ulcer: $scope.healthCheck.mouthUlcer,
            blister: $scope.healthCheck.blisters,
            drooling_saliva: $scope.healthCheck.drooling,
            red_watery_eyes: $scope.healthCheck.wateryEyes,
            cough: $scope.healthCheck.cough,
            runny_nose: $scope.healthCheck.runnyNose,
            virus: $scope.healthCheck.virus,
            start_time: datestring,
            end_time: datestring,
            contactEmail: contactResponse.email
          }
        }
        else {

          submitActivityObj = {
            trackingType: "healthCheck",
//            studentId: $scope.student ? $scope.student.studentId.toString() : $scope.students,
            mealId: '',
            menuId: '',
            quantity: '',
            unit: '',
            value: '',
            remark: $scope.healthCheck.remarks,
            complete_status: '',
            temperature: $scope.healthCheck.temp.toString(),
            rashes: $scope.healthCheck.rashes,
            mouth_ulcer: $scope.healthCheck.mouthUlcer,
            blister: $scope.healthCheck.blisters,
            drooling_saliva: $scope.healthCheck.drooling,
            red_watery_eyes: $scope.healthCheck.wateryEyes,
            cough: $scope.healthCheck.cough,
            runny_nose: $scope.healthCheck.runnyNose,
            virus: $scope.healthCheck.virus,
            start_time: datestring,
            end_time: datestring,
            contactEmail: contactResponse.email
          }
        }
        
        if ($scope.student) {
          submitActivityObj.studentId = $scope.student.studentId.toString()
          activityArray.push(submitActivityObj);
        } else {
          $scope.students.forEach(function(s) {
              var x = angular.copy(submitActivityObj)
              x.studentId = s;
              activityArray.push(x);
          })
        }
      }
//      activityArray.push(submitActivityObj);

      var postActivityObj = {
        tracking_list: activityArray
      };

      var APIname = 'app/c_tracking_list';

      studentDetailsService.c_tracking_list(postActivityObj, APIname).then(function (response) {
        if (typeof response.status && response.status === 422) {
          GlobalService.hideLoading();
          GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
        }
        else {
          if (angular.isDefined(response) && response.status == 200) {
            if (response.data) {
              GlobalService.hideLoading();
              if (!$rootScope.heldItems.length) {
                GlobalService.showToast('Tracking has been submitted successfully', 'long', 'bottom');
                $window.history.back();
              }
              else{
                GlobalService.showToast('Tracking for multiple students have been submitted successfully', 'long', 'bottom');
//                $window.history.back();
                $state.go('app.people');
              }
            }
          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
          }
        }
      });
    }

    $rootScope.saveHealthCheck = function () {
      submitActivity('healthCheck')
    };

    $scope.checkHealthyOrNot = function (val) {
      $scope.disable = false;
      $scope.disable = val == true;
    };
  });
