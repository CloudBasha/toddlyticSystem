'use strict';
angular.module('toddlytics')
  .controller('addNewActionCtrl',
    function ($scope, $state, actionsService, GlobalService, $rootScope, ionicDatePicker) {

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;
      var check = false;
      var requiredFields = ["title", "schoolId", "actionType"];

      $scope.editAction = actionsService.getMyAction();
      $scope.buttonText = 'Create';
      $scope.action = {date: ''};

      var d = new Date();
      $scope.action.date = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear();

      var ipObj1 = {
        callback: function (val) {
          var d = new Date(val);
          $scope.setCurrentDate = d;
          $scope.action.date = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear();
        }
      };

      $scope.openDatePicker = function () {
        ipObj1.inputDate = $scope.setCurrentDate;
        ionicDatePicker.openDatePicker(ipObj1);
      };

      function getSchoolList() {

        var schoolObj = {
          orgId: loginResponse.organizationId
        };

        var APIname = 'app/l_school';

        actionsService.getSchoolList(schoolObj, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.showToast('Error occurred', 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response)) {
              var res = response.data;
              $scope.schools = res.list;
            }
            else {
              GlobalService.showToast('Error occurred', 'long', 'bottom');
            }
          }
        });
      }

      function getStaffList() {
        var staffObj = {
          orgId: loginResponse.organizationId,
          type: "staff"
        };

        var APIname = 'app/getContactsByOrgIdAndType';

        actionsService.getStaffList(staffObj, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.showToast('Error occurred', 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response)) {
              var res = response.data;
              $scope.staffList = res.list;
              angular.forEach($scope.staffList, function (staff) {
                if (staff.contactId == contactResponse.contactId) {
                  staff.name = 'Me';
                  if (Object.keys($scope.editAction).length == 0) {
                    $scope.addActionObj.contactId = staff.contactId;
                  }
                }
              });
            }
            else {
              GlobalService.showToast('Error occurred', 'long', 'bottom');
            }
          }
        });
      }

      function validateData() {
        for (var i in requiredFields) {
          if ($scope.addActionObj[requiredFields[i]] != undefined && $scope.addActionObj[requiredFields[i]] != null && $scope.addActionObj[requiredFields[i]] != '') {
            check = true;
          } else {
            check = false;
            break;
          }
        }
        return check;
      }

      $scope.createNewAction = function (purpose) {

        GlobalService.showLoading();

        if (validateData()) {

          var APIname = 'app/c_request';

          $scope.addActionObj.dueDate = $scope.action.date;
          $scope.addActionObj.schoolId = $scope.addActionObj.schoolId.toString();
          $scope.addActionObj.contactId = $scope.addActionObj.contactId.toString();

          if (purpose == 'Create') {
            APIname = 'app/c_request';
          }
          else if (purpose == 'Update') {
            APIname = 'app/e_request';
          }

          actionsService.createNewAction($scope.addActionObj, APIname).then(function (response) {

            if (typeof response.status && response.status === 422) {
              GlobalService.hideLoading();
              GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
            }
            else {
              if (angular.isDefined(response) && response.data.status !== 'Fail') {
                GlobalService.hideLoading();
                GlobalService.showToast('Action ' + purpose + 'd Successfully', 'long', 'bottom');
                $state.go('app.actions');
              }
              else {
                GlobalService.hideLoading();
                GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
              }
            }
          });
        }
        else {
          GlobalService.hideLoading();
          GlobalService.showToast('Please fill in all the mandatory fields', 'long', 'bottom');
        }
      };

      $scope.checkRequestType = function (value) {
        $scope.showQty = value == 'Request Purchase';
      };

      if (Object.keys($scope.editAction).length == 0) {

        $rootScope.editAction = false;
        $scope.showStatus = false;
        $scope.buttonText = 'Create';
        $scope.setCurrentDate = new Date();

        $scope.addActionObj = {
          title: '',
          schoolId: '',
          roomId: null,
          contactId: '',
          actionDescription: '',
          dueDate: $scope.action.date,
          quantity: null,
          closedDateTime: null,
          actionType: '',
          importance: 'Low',
          status: "Pending",
          contactEmail: contactResponse.email
        };
      }
      else {
        $rootScope.editAction = true;
        $scope.showStatus = true;
        $scope.buttonText = 'Update';

        var msg = $scope.editAction;
        var td = angular.copy(msg.request.dueDate);

        $scope.action.date = msg.request.dueDate;
        $scope.setCurrentDate = toDate(td);

        $scope.addActionObj = {
          actionId: msg.request.requestId.toString(),
          title: msg.request.title,
          schoolId: msg.request.school.schoolId,
          roomId: null,
          actionDescription: msg.request.requestDescription,
          dueDate: msg.request.dueDate,
          closedDateTime: null,
          actionType: msg.request.requestType,
          importance: msg.request.importance,
          status: msg.request.status,
          contactEmail: contactResponse.email
        };

        if (msg.delegation === null || msg.delegation === 'null' || msg.delegation === 'undefined' || msg.delegation === '') {
          $scope.addActionObj.contactId = msg.request.contact.contactId;
        }
        else {
          $scope.addActionObj.contactId = msg.delegation.delegatedTo.contact.contactId;
        }

        if (msg.request.quantity !== null) {
          $scope.addActionObj.quantity = msg.request.quantity.toString();
        }
        else {
          $scope.addActionObj.quantity = null;
        }
      }

      function toDate(dateStr) {
        var parts = dateStr.split("-");
        return new Date(parts[2], parts[1] - 1, parts[0]);
      }

      getSchoolList();
      getStaffList();

    });
