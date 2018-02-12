'use strict';
angular.module('toddlytics')
  .controller('ActionsCtrl',
    function ($scope, $state, actionsService, GlobalService, $rootScope, $ionicPopup, $ionicModal, $timeout, $stateParams, ionicDatePicker, ionicTimePicker) {

      if($stateParams.push){
        GlobalService.showToast($stateParams.push.additionalData.pushToast, 'long', 'bottom');
      }

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;

      actionsService.setMyAction('');
      $scope.eTracking = {
          contactEmail: contactResponse.email,
          start_time: "",
          trackingId: ""
      };

      $scope.openApprovalsTab = function () {
        $scope.appovalsTabActive = true;
        $scope.actionsTabActive = false;
        $scope.appovalsClass = 'active';
        $scope.actionsClass = '';
      };

      $scope.openActionsTab = function () {
        $scope.appovalsTabActive = false;
        $scope.actionsTabActive = true;
        $scope.appovalsClass = '';
        $scope.actionsClass = 'active';
      };
      var timeOptions = {};
      var appointmentDatePickerOptions = {};
      $scope.showTrackingModal = function(approval) {
        console.log('APPROVAL',approval);
        $scope.editTracking = {};
        $scope.editTracking.date = moment(approval.approval.createdDate).format('DD-MM-YYYY');
        $scope.editTracking.time = moment(approval.approval.createdDate).format('h:mm a');
        $scope.eTracking.trackingId = approval.approval.approvalId.toString();
        $scope.approvalItem = approval;
        timeOptions = {
          callback: function (val) {      //Mandatory
            if (typeof (val) === 'undefined') {
              console.log('Time not selected');
            } else {
              var selectedTime = moment(val * 1000).utc();
              $scope.editTracking.time = selectedTime.format('h: mm a');
              console.log($scope.editTracking);
              // console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            }
          },
          inputEpochTime: (((new Date($scope.approvalItem.approval.createdDate)).getHours()) * 60 * 60),
          format: 12,         //Optional
          step: 1,           //Optional
          setLabel: 'Set'    //Optional
        };

        appointmentDatePickerOptions = {
          callback: function (val) {
            $scope.editTracking.date = moment(val).format('DD-MM-YYYY');
              console.log($scope.editTracking);

            // console.log('Return value from the datepicker popup is : ' + val, new Date(val));
          },
          from: new Date($scope.approvalItem.approval.createdDate),
          closeOnSelect: true,       //Optional
          templateType: 'popup'       //Optional
        };

        $scope.openTrackingModal();
      };

      $scope.submitTracking = function() {
        var x = moment($scope.editTracking.date + ' ' + $scope.editTracking.time, 'DD-MM-YYYY HH:mm');
        console.log(x);
        $scope.eTracking.start_time = x.format('DD-MM-YYYY HH:mm:ss');
        console.log($scope.eTracking);
        actionsService.eTracking($scope.eTracking).then(function(resp) {
          console.log(resp);
          $scope.closeTrackingModal();
          getApprovalByManagerId();
        });
      }

      $scope.deleteTracking = function() {
        var params = {
          contactEmail: $scope.eTracking.contactEmail,
          trackingId: $scope.eTracking.trackingId
        };
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Tracking',
            template: 'Are you sure?'
        });

         confirmPopup.then(function(res) {
           if(res) {
             console.log('You are sure');
              actionsService.dTracking(params).then(function(resp) {
                console.log(resp);
                $scope.closeTrackingModal();
                getApprovalByManagerId();
              });
           } else {
             console.log('You are not sure');
           }
         });
      };


      $scope.openTimePicker = function() {
        ionicTimePicker.openTimePicker(timeOptions);
      };

      $scope.openDatePicker = function(){
        ionicDatePicker.openDatePicker(appointmentDatePickerOptions);
      };

      $scope.showApproval = function(approval) {
        if (approval.object && approval.approval.tableName == 'PHOTO') {
          $scope.approvalItem = approval;
          $scope.openModal();
        }
      };

      $ionicModal.fromTemplateUrl('actions/approvalItem.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.openModal = function() {
        $scope.modal.show();
      };
      $scope.closeModal = function() {
        $scope.modal.hide();
      };


      $ionicModal.fromTemplateUrl('actions/trackingItem.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.trackingModal = modal;
      });
      $scope.openTrackingModal = function() {
        $scope.trackingModal.show();
      };
      $scope.closeTrackingModal = function() {
        $scope.trackingModal.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal.remove();
      });

      $scope.count = 0;

      $scope.loadMore = function() {
        if($scope.pendingApprovals.length % 50 == 0 && $scope.pendingApprovals.length)
        {
          $scope.infiniteLoad = true;
          $scope.count++;
          getApprovalByManagerId();
        }
        else{
           $scope.infiniteLoad = false;
           $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      }
      
      $scope.loadMoreTeacher = function() {
        if(($scope.pendingApprovals.length % 50 == 0 && $scope.pendingApprovals.length) || ($scope.completedApprovals.length % 50 == 0 && $scope.completedApprovals.length))
        {
          $scope.infiniteLoad = true;
          $scope.count++;
          getApprovalByManagerId();
        }
        else{
           $scope.infiniteLoad = false;
           $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      }

      function getApprovalByManagerId() {

        GlobalService.showLoading();

        var getApproval = {
          contactId: contactResponse.contactId.toString(),
          count : $scope.count.toString(),
          status : "Pending"
        };

        var APIname = 'app/getApprovalByManagerId';

        if(loginResponse.type ==='TEACHER') {
          APIname = 'app/getApprovalByContactId';
        }

        actionsService.getApprovalByManagerId(getApproval, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
            GlobalService.hideLoading();
            if ($scope.count === 0) {
              var res = response.data.list;
            } else {
              var res = $scope.pendingApprovals.concat(response.data.list);
            }
            
            $scope.pendingApprovals = res;
            
//            if(loginResponse.type ==='ADMIN') {
//              $scope.pendingApprovals = _.filter(res, function (o) {
//                return o.approval.status == 'Pending';
//              });
//            }
//            else if(loginResponse.type ==='TEACHER') {
//               $scope.pendingApprovals.concat_.filter(res, function (o) {
//                return o.approval.status == 'Pending';
//              });
//            }
            
            $scope.pendingCounter = response.data.pendingCount;
            
            if(loginResponse.type ==='TEACHER') {
              getApprovalByContactId();
            }
            else{
              $scope.$broadcast('scroll.infiniteScrollComplete');              
            }

          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
          }
        });
      }
  
      function getApprovalByContactId() {

        GlobalService.showLoading();

        var getApproval = {
          contactId: contactResponse.contactId.toString(),
          count : $scope.count.toString(),
          status : "Completed"
        };

        var APIname = 'app/getApprovalByContactId';

        actionsService.getApprovalByManagerId(getApproval, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
            GlobalService.hideLoading();
            if ($scope.count === 0) {
              var res = response.data.list;
            } else {
              var res = $scope.completedApprovals.concat(response.data.list);
            }
            
//            var filterResults = _.filter(res, function (o) {
//              return o.approval.status == 'Rejected';
//            });
//            
//            if(filterResults.length){
//              angular.forEach(filterResults, function(data){
//                $scope.pendingApprovals.push(data);
//              });
//            }
//            
            $scope.completedApprovals = res;
            
//            $scope.pendingCounter += filterResults.length;

            $scope.$broadcast('scroll.infiniteScrollComplete');
          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
          }
        });
      }

      function getListOfActions() {

        GlobalService.showLoading();

        var organization = {
          orgId: loginResponse.organizationId.toString()
        };

        var APIname = 'app/l_request';

        actionsService.getListOfActions(organization, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
            GlobalService.hideLoading();
            var res = response.data.list;
            $scope.pendingActions = _.filter(res, function (o) {
              return o.request.status !== 'Completed' && o.request.contact.contactId.toString() == $rootScope.loginResponse.contactId;
            });
            angular.forEach($scope.pendingActions, function(action){
              action.request.sortDate = moment(action.request.dueDate, "DD-MM-YYYY").format('YYYY-MM-DD hh:mm:ss');
            });
          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
          }
        });
      }

      $scope.requestApproveOrReject = function (act, req) {

        if (act === 'Approved') {
          var txt = 'Approve?';
        } else {
          txt = 'Reject?';
        }

        var myPopup = $ionicPopup.show({
          template: '<p style="text-align: center">' + txt + '</p>',
          title: 'Approval Confirmation',
          scope: $scope,
          buttons: [
            {text: 'No'},
            {
              text: '<b>Yes</b>',
              type: 'button-calm',
              onTap: function (e) {

                GlobalService.showLoading();

                var updateApproval = {
                  approvalId: req.approval.approvalId.toString(),
                  status: act,
                  contactEmail: contactResponse.email
                };

                var APIname = 'app/updateApproval';

                actionsService.updateApproval(updateApproval, APIname).then(function (response) {
                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
                    GlobalService.hideLoading();
                    if (response.data && response.data.status == "Success") {
                      getApprovalByManagerId();
                      GlobalService.showToast('Request  ' + act, 'long', 'bottom');
                    }
                  }
                  else {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
                  }
                });
              }
            }
          ]
        });
        $timeout(function () {
          myPopup.close(); //close the popup after 3 seconds for some reason
        }, 30000);
      };

      if (loginResponse.type === 'ADMIN' || loginResponse.type === 'TEACHER') {
        $scope.contentClass = "has-header-custm actions-wrap";
        $scope.pendingApprovals = [];
        $scope.completedApprovals = [];
        $scope.pendingActions = [];
        $scope.appovalsClass = 'active';
        $scope.actionsClass = '';
        $scope.appovalsTabActive = true;
        $scope.actionsTabActive = false;
        getApprovalByManagerId();
        getListOfActions();
      }
      else {
        $scope.contentClass = "bar-subheader-custm actions-wrap";
        $scope.pendingActions = [];
        getListOfActions();
      }

      $rootScope.openAction = function (action) {
        actionsService.setMyAction(action);
        $state.go('app.addNewAction');
      };
      $rootScope.approvalHeldItems = [];
      $scope.holdItem = function(item) {
        console.log(item);
        if(loginResponse.type === 'ADMIN') {
          if ($rootScope.approvalHeldItems.indexOf(item) < 0) {
            $rootScope.approvalHeldItems.push(item);
          } else {
            $rootScope.approvalHeldItems.splice($rootScope.approvalHeldItems.indexOf(item), 1);
          }
        }
      };

      $rootScope.approveRejectAll = function(){

        var ids = $rootScope.approvalHeldItems.map(function(item) {
          return item.approval.approvalId.toString();
        });

        var myPopup = $ionicPopup.show({
          template: '<p style="text-align: center">Approve/Reject All?</p>',
          title: 'Confirmation',
          scope: $scope,
          buttons: [
            {
              text: '<small>Approve</small>',
              type: 'button-calm',
              onTap: function (e) {

                GlobalService.showLoading();

                var updateApproval = {
                  list: ids,
                  status: 'Approved',
                  contactEmail: contactResponse.email
                };

                var APIname = 'app/updateAllApproval';

                actionsService.updateApproval(updateApproval, APIname).then(function (response) {
                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
                    GlobalService.hideLoading();
                    if (response.data && response.data.status == "Success") {
                      getApprovalByManagerId();
                      GlobalService.showToast('Requests Approved', 'long', 'bottom');
                    }
                  }
                  else {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
                  }
                });
              }
            },
            {
              text: '<small>Reject</small>',
              type: 'button-assertive',
              onTap: function (e) {

                GlobalService.showLoading();

                var updateApproval = {
                  list: ids,
                  status: 'Rejected',
                  contactEmail: contactResponse.email
                };

                var APIname = 'app/updateAllApproval';

                actionsService.updateApproval(updateApproval, APIname).then(function (response) {
                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else if (angular.isDefined(response) && response.data.status !== 'FAILED') {
                    GlobalService.hideLoading();
                    if (response.data && response.data.status == "Success") {
                      getApprovalByManagerId();
                      GlobalService.showToast('Requests Rejected', 'long', 'bottom');
                    }
                  }
                  else {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. " + response.remark, 'long', 'bottom');
                  }
                });
              }
            },
            {
              text: '<small>Cancel</small>',
              type: 'button-stable',
              onTap: function(e) {
                myPopup.close();
              }
            }
          ]
        });


        $timeout(function () {
          myPopup.close(); //close the popup after 3 seconds for some reason
        }, 30000);
      }
    });

