'use strict';
angular.module('toddlytics')
  .controller('NotificationsCtrl',
    function ($scope, $state, notifyService, GlobalService, $rootScope, $log) {

      var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;

      $scope.sentTabActive = false;
      $scope.receiveTabActive = true;
      $scope.active1 = '';
      $scope.active2 = 'active';
      notifyService.setNotification('');
  
      $scope.openPdf = function(url) {
        window.open(url, '_system', 'location=yes');
      }

      $scope.openNotification = function (msg, sendOrReceive) {

        notifyService.setNotification(msg);
        
        $log.debug('MSG ', msg);
        
        if (sendOrReceive !== 'sent') {

          if (msg.status == 'Published') {
            
            if(msg.field == 'newsletters'){
                var reqObj = {
                  id : msg.newsLetterId,
                  contactId : contactResponse.contactId.toString(),
                  type : 'newsletter',
                  status : 'Read'
                }

                var APIname = 'changeNotificationStatus';

                notifyService.changeNotificationStatus(msg, APIname).then(function (response) {

                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else{
                    $scope.openPdf(msg.newsletterUrl);
                  }
                });
              }
              else if(msg.field == 'announcements'){
                var reqObj = {
                  id : msg.announcementId,
                  contactId : contactResponse.contactId.toString(),
                  type : 'announcement',
                  status : 'Read'
                }

                var APIname = 'changeNotificationStatus';

                notifyService.changeNotificationStatus(msg, APIname).then(function (response) {

                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else{
                    if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                      $state.go('app.composer', {notifyType: sendOrReceive})
                    }
                    else if($rootScope.loginResponse.type == "PARENT"){
                      $state.go('pApp.composer', {notifyType: sendOrReceive})
                    }
                  }
                });
              }
              else{
                var APIname = 'changeMessageStatus';

                notifyService.changeMessageStatus(msg, APIname).then(function (response) {

                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else {
                    GlobalService.hideLoading();
                    if (angular.isDefined(response)) {
                      if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                        $state.go('app.composer', {notifyType: sendOrReceive})
                      }
                      else if($rootScope.loginResponse.type == "PARENT"){
                        $state.go('pApp.composer', {notifyType: sendOrReceive})
                      }
                    }
                  }
                });
              }
            }
            else {
              if(msg.field == 'newsletters'){
                $scope.openPdf(msg.newsletterUrl);
              }
              else{
                if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                  $state.go('app.composer', {notifyType: sendOrReceive})
                }
                else if($rootScope.loginResponse.type == "PARENT"){
                  $state.go('pApp.composer', {notifyType: sendOrReceive})
                }
              }
            }
        }
        else {
          if(msg.field == 'newsletters'){
            $scope.openPdf(msg.newsletterUrl);
          }
          else{
            if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
              $state.go('app.composer', {notifyType: sendOrReceive})
            }
            else if($rootScope.loginResponse.type == "PARENT"){
              $state.go('pApp.composer', {notifyType: sendOrReceive})
            }
          }
        }
      };
  
      $scope.openNotificationOnly = function (msg, sendOrReceive) {

        notifyService.setNotification(msg);
        
        if (sendOrReceive !== 'sent') {

          if (msg.status == 'Published') {
            
            if(msg.field == 'newsletters'){
                var reqObj = {
                  id : msg.newsLetterId,
                  contactId : contactResponse.contactId.toString(),
                  type : 'newsletter',
                  status : 'Read'
                }

                var APIname = 'changeNotificationStatus';

                notifyService.changeNotificationStatus(msg, APIname).then(function (response) {

                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else{
                    if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                      $state.go('app.composer', {notifyType: sendOrReceive})
                    }
                    else if($rootScope.loginResponse.type == "PARENT"){
                      $state.go('pApp.composer', {notifyType: sendOrReceive})
                    }
                  }
                });
              }
              else if(msg.field == 'announcements'){
                var reqObj = {
                  id : msg.announcementId,
                  contactId : contactResponse.contactId.toString(),
                  type : 'announcement',
                  status : 'Read'
                }

                var APIname = 'changeNotificationStatus';

                notifyService.changeNotificationStatus(msg, APIname).then(function (response) {

                  if (typeof response.status && response.status === 422) {
                    GlobalService.hideLoading();
                    GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
                  }
                  else{
                    if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                      $state.go('app.composer', {notifyType: sendOrReceive})
                    }
                    else if($rootScope.loginResponse.type == "PARENT"){
                      $state.go('pApp.composer', {notifyType: sendOrReceive})
                    }
                  }
                });
              }
            }
            else {
              if($rootScope.loginResponse.type == "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
                $state.go('app.composer', {notifyType: sendOrReceive})
              }
              else if($rootScope.loginResponse.type == "PARENT"){
                $state.go('pApp.composer', {notifyType: sendOrReceive})
              }
            }
        }
        else {
          if($rootScope.loginResponse.type == "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
            $state.go('app.composer', {notifyType: sendOrReceive})
          }
          else if($rootScope.loginResponse.type == "PARENT"){
            $state.go('pApp.composer', {notifyType: sendOrReceive})
          }
        }
    
//          if (sendOrReceive !== 'sent') {
//
//            if (msg.status == 'Published') {
//
//              var APIname = 'changeMessageStatus';
//
//              notifyService.changeMessageStatus(msg, APIname).then(function (response) {
//
//                if (typeof response.status && response.status === 422) {
//                  GlobalService.hideLoading();
//                  GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
//                }
//                else {
//                  GlobalService.hideLoading();
//                  if (angular.isDefined(response)) {
//                    if($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
//                      $state.go('app.composer', {notifyType: sendOrReceive})
//                    }
//                    else if($rootScope.loginResponse.type == "PARENT"){
//                      $state.go('pApp.composer', {notifyType: sendOrReceive})
//                    }
//                  }
//                }
//              });
//            }
//            else {
//              if($rootScope.loginResponse.type == "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
//                $state.go('app.composer', {notifyType: sendOrReceive})
//              }
//              else if($rootScope.loginResponse.type == "PARENT"){
//                $state.go('pApp.composer', {notifyType: sendOrReceive})
//              }
//            }
//          }
//          else {
//            if($rootScope.loginResponse.type == "ADMIN" || $rootScope.loginResponse.type === "TEACHER"){
//              $state.go('app.composer', {notifyType: sendOrReceive})
//            }
//            else if($rootScope.loginResponse.type == "PARENT"){
//              $state.go('pApp.composer', {notifyType: sendOrReceive})
//            }
//          }
      };

      $scope.openSentTab = function () {
        $scope.sentTabActive = true;
        $scope.receiveTabActive = false;
        $scope.active1 = 'active';
        $scope.active2 = '';
      };

      $scope.openReceiveTab = function () {
        $scope.sentTabActive = false;
        $scope.receiveTabActive = true;
        $scope.active1 = '';
        $scope.active2 = 'active';
      };


      function getSentNotifications() {

        GlobalService.showLoading();

        var sentObj = {
          orgId: loginResponse.organizationId.toString(),
          contactEmail : contactResponse.email
        };

        var APIname = 'getSentNotifications';

        $log.debug("Sent Messages Req ", sentObj);
        
        notifyService.getSentNotifications(sentObj, APIname).then(function (response) {
          $log.debug("Sent Messages ", response);
          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else {
            GlobalService.hideLoading();
            if (angular.isDefined(response)) {
              var res = response.data.list;
              $scope.sentNotifications = res;
            }
          }
        },
        function (error) {
          console.log('Response Error', error);
          checkOfflineNewsFeed();
        });
      }

  
      function getReceiveNotifications() {

        GlobalService.showLoading();

        var receiveObj = {
          contactId: contactResponse.contactId.toString()
        };

        var APIname = 'getInboxMessages';

        notifyService.getInboxMessages(receiveObj, APIname).then(function (response) {
          $log.debug("Inbox Messages ", response);
          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else {
            GlobalService.hideLoading();
            if (angular.isDefined(response)) {
              var res = response.data.list;
              var length = res.length;
              var count = 0;
              for (var msg = 0; msg < length; msg++) {
                if (res[msg].status == 'Published') {
                  count = count + 1;
                }
              }
              $scope.unReadCount = count;
              $scope.receiveNotifications = res;
            }
          }
        },
        function (error) {
          console.log('Response Error', error);
        });
      }

      function getParentNotifications() {
        var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));

        GlobalService.showLoading();

        var receiveObj = {
          contactId: contactResponse.contactId.toString(),
          studentId: getFavStudent.studentId.toString(),
          programSchoolId: getFavStudent.programSchoolId.toString()
        };

        var APIname = 'app/p_getNotifications';

        notifyService.getParentNotifications(receiveObj, APIname).then(function (response) {
          $log.debug("Parent Notification Response ", response);
          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred. ", 'long', 'bottom');
          }
          else {
            GlobalService.hideLoading();
            if (angular.isDefined(response)) {
              var res = response.data;
              var allNotificationsArray = [];
              angular.forEach(res.announcement, function(announcement){
                allNotificationsArray.push(announcement);
              });
              angular.forEach(res.message, function(message){
                allNotificationsArray.push(message);
              });
              angular.forEach(res.newsletter, function(newsletter){
                allNotificationsArray.push(newsletter);
              });
              var length = allNotificationsArray.length;
              var count = 0;
              
              for (var msg = 0; msg < length; msg++) {
                if (allNotificationsArray[msg].status == 'Published') {
                  count = count + 1;
                }
              }
              $scope.unReadCount = count;
              $scope.receiveNotifications = allNotificationsArray;
            }
          }
        },
        function (error) {
          console.log('Response Error', error);
          checkOfflineNewsFeed();
        });
      }
  
      if(loginResponse.type === "ADMIN" || loginResponse.type === "TEACHER"){
        getReceiveNotifications();
        getSentNotifications();
      }
      else if(loginResponse.type == "PARENT"){
        getParentNotifications();
      }
    });
