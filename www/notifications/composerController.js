'use strict';
angular.module('toddlytics')
  .controller('ComposerCtrl',
    function ($scope, $state, $stateParams, $timeout, notifyService, $rootScope, $ionicPopup, GlobalService, $log) {

      $scope.reqType = $stateParams.notifyType;
      $scope.displayNotification = notifyService.getNotification();

      $rootScope.showResendNoticationButton = false;

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;
      $scope.loginResponse = loginResponse;
      var d = new Date();
      var datestring = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " +
        ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      var check = false;
      var requiredFields = ["subject", "text", "enrollmentIds"];

      $scope.openPdf = function() {
        window.open($scope.displayNotification.newsletterUrl, '_system', 'location=yes');
      }
      
      $scope.sendNotification = function (type) {
        if (type == 'announcements') {
          sendAnnouncement();
        }
        else if (type == 'messages') {
          sendMessage();
        }
      };

      $scope.changeNotifyType = function (type) {

        if (type == 'announcements') {
          $scope.isAnnouncement = true;
          $scope.isMessage = false;
          $scope.isNewsletter = false;
          getTagEnrollments();
        }
        else if (type == 'messages') {
          $scope.isMessage = true;
          $scope.isAnnouncement = false;
          $scope.isNewsletter = false;
          getParentsContacts();
        }
        else if (type == 'newsletters') {
          $scope.isMessage = false;
          $scope.isAnnouncement = false;
          $scope.isNewsletter = true;
          getTagEnrollments();
        }
      };

      $rootScope.showAlert = function (type) {

        var myPopup = $ionicPopup.show({
          template: 'Are you sure you want to resend the notification?',
          title: 'Notification',
          scope: $scope,
          buttons: [
            {text: 'Cancel'},
            {
              text: '<b>Yes</b>',
              type: 'button-calm',
              onTap: function (e) {
                if (type == 'announcements') {
                  sendAnnouncement();
                }
                else if (type == 'messages') {
                  sendMessage();
                }
              }
            }
          ]
        });
        $timeout(function () {
          myPopup.close(); //close the popup after 3 seconds for some reason
        }, 30000);
      };

      function validateData() {
        for (var i in requiredFields) {
          if (requiredFields[i] == 'enrollmentIds') {
            if ($scope.notification[requiredFields[i]].length !== 0) {
              check = true;
            } else {
              check = false;
              break;
            }
          }
          else {
            if ($scope.notification[requiredFields[i]] != undefined && $scope.notification[requiredFields[i]] != null && $scope.notification[requiredFields[i]] != '') {
              check = true;
            } else {
              check = false;
              break;
            }
          }
        }
        return check;
      }

      function getTagEnrollments() {

      if($rootScope.loginResponse.type === 'ADMIN' || $rootScope.loginResponse.type === 'TEACHER'){
        var programsObj = {
          orgId: loginResponse.organizationId
        };
      }
      else if($rootScope.loginResponse.type == 'PARENT'){
        var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        var programsObj = {
          orgId: getFavStudent.orgId
        }
      }

        var APIname = 'getTagEnrollments';

        notifyService.getTagEnrollments(programsObj, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
              $scope.tagEnrollments = response.data.list;
              if($stateParams.info) {
                $scope.notification.enrollmentIds.push($stateParams.info.contactId)
              }
              GlobalService.hideLoading();
            }
            else {
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      function getParentsContacts() {

        var programsObj = {
          orgId: loginResponse.organizationId
        };

        var APIname = 'getParentsContacts';

        notifyService.getTagEnrollments(programsObj, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
              $scope.tagEnrollments = response.data.list;
              if($stateParams.info) {
                $scope.notification.enrollmentIds.push($stateParams.info.contactId)
              }
              GlobalService.hideLoading();
            }
            else {
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      function sendAnnouncement() {

        GlobalService.showLoading();

        if (validateData()) {

          var APIname = 'createAnnouncement';

          notifyService.createAnnouncement($scope.notification, APIname).then(function (response) {
            if (typeof response.status && response.status === 422) {
              GlobalService.hideLoading();
              GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
            }
            else {
              if (response.data.status == "Success") {
                GlobalService.hideLoading();
                GlobalService.showToast('Notification sent successfully', 'long', 'bottom');
                $state.go('app.notifications');
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
      }

      function sendMessage() {

        GlobalService.showLoading();

        if (validateData()) {

          var data = $scope.notification;

          $scope.msgData = {
            organizationId: data.organizationId,
            subject: data.subject,
            text: data.text,
            announcementTime: data.announcementTime,
            messageType: data.messageType,
            contacts: data.enrollmentIds,
            createdBy: data.createdBy
          };

          var APIname = 'createMessage';

          notifyService.createMessage($scope.msgData, APIname).then(function (response) {
            if (typeof response.status && response.status === 422) {
              GlobalService.hideLoading();
              GlobalService.showToast('Error occurred, please check your submission', 'long', 'bottom');
            }
            else {
              if (response.data.status == "Success") {
                GlobalService.hideLoading();
                GlobalService.showToast('Notification sent successfully', 'long', 'bottom');
                $state.go('app.notifications');
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
      }

      if (Object.keys($scope.displayNotification).length == 0) {
        $scope.onlyRead = true;
        $rootScope.notifyType = 'messages';
        $scope.isAnnouncement = true;
        $scope.isMessage = false;
        $scope.notification = {
          organizationId: loginResponse.organizationId,
          subject: '',
          text: '',
          announcementTime: datestring,
          messageType: 'Email',
          parentFlag: 1,
          teacherFlag: 0,
          enrollmentIds: [],
          createdBy: contactResponse.email
        };
        $scope.changeNotifyType('messages');
      }
      else {
        $scope.onlyRead = false;

        var msg = $scope.displayNotification;

        $rootScope.notifyType = msg.field;

        if ($rootScope.notifyType == 'announcements') {
          $scope.isAnnouncement = true;
          $scope.isMessage = false;
          $scope.isNewsletter = false;
          $scope.notification = {
            organizationId: loginResponse.organizationId,
            subject: msg.subject,
            text: msg.text,
            announcementTime: msg.announcementTime,
            messageType: msg.messageType,
            parentFlag: 1,
            teacherFlag: 0,
            enrollmentIds: msg.programSchool,
            createdBy: msg.createdBy
          };
          $scope.changeNotifyType('announcements');
        }
        else if ($rootScope.notifyType == 'messages') {
          if($scope.reqType == 'sent'){
            $rootScope.showResendNoticationButton = true;
          }
          $scope.isMessage = true;
          $scope.isAnnouncement = false;
          $scope.isNewsletter = false;
          $scope.notification = {
            organizationId: loginResponse.organizationId,
            subject: msg.subject,
            text: msg.text,
            announcementTime: msg.announcementTime,
            messageType: msg.messageType,
            parentFlag: 1,
            teacherFlag: 0,
            enrollmentIds: msg.contact,
            createdBy: msg.createdBy
          };
          $scope.changeNotifyType('messages');
        }
        else if ($rootScope.notifyType == 'newsletters') {
          $scope.isMessage = false;
          $scope.isAnnouncement = false;
          $scope.isNewsletter = true;
          $scope.notification = {
            organizationId: loginResponse.organizationId,
            subject: msg.subject,
            text: msg.text,
            announcementTime: msg.announcementTime,
            messageType: msg.messageType,
            parentFlag: 1,
            teacherFlag: 0,
            enrollmentIds: msg.programSchool,
            createdBy: msg.createdBy
          };
          $scope.changeNotifyType('newsletters');
        }
      }
    });
