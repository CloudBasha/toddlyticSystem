'use strict';
angular.module('toddlytics')
  .controller('billingCtrl', function ($scope, $stateParams, iso4217, $state, $log, GlobalService, $rootScope, $window, billingService, $ionicModal) {
    $scope.date = moment();
  
    if($stateParams.push){
      GlobalService.showToast($stateParams.push.additionalData.pushToast, 'long', 'bottom');
    }

    $scope.getStudentInvoice = function() {
        GlobalService.showLoading('Retrieving Info...')
        $scope.student = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        if($scope.student){
          var currencyCode = $scope.student.orgCurrency || "MYR";
          var currencyResp = iso4217.getCurrencyByCode(currencyCode);
          $rootScope.currency = currencyResp.symbol;
        }
        var data = {
            studentId: $scope.student.studentId.toString(),
            month: $scope.date.format('MM'),
            year: $scope.date.format('YYYY')
        };
        billingService.getStudentInvoice(data).then(function(resp) {
            $scope.bill = resp;
            if(parseFloat(resp.outstanding) > 0){
              $scope.paidStatus = true;
            }
            else if((parseFloat(resp.outstanding) == 0) && (parseFloat(resp.due) == 0)){
              $scope.paidStatus = true;
            }
            else{
                $scope.paidStatus = false;
            }
            GlobalService.hideLoading();
        });
    };

    $scope.getStudentInvoice();

    $scope.previousMonth = function() {
        $scope.date.subtract(1, 'month');
        $scope.getStudentInvoice();
    };

    $scope.nextMonth = function() {
        if($scope.date.isBefore(moment(), 'month')) {
            $scope.date.add(1, 'month');
            $scope.getStudentInvoice();
        }
    };  

    $ionicModal.fromTemplateUrl('billing/studentInvoice.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.showStudentInvoice = function(studentBill) {
      $scope.studentBill = studentBill;
      if(studentBill.studentInvoice.tax != 0){
        $scope.invoiceTax = studentBill.studentInvoice.invoiceAmount/studentBill.studentInvoice.tax;
      }
      else{
        $scope.invoiceTax = 0;
      }
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
});