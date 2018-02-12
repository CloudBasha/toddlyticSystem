'use strict';
angular.module('toddlytics')
  .controller('studentDetailsCtrl',
    function ($scope, $state, studentDetailsService, peopleService, GlobalService, $rootScope, $cordovaCamera, $cordovaFile, NewsfeedService, $ionicModal, $log, $ionicActionSheet, albumsService) {

      $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
      });
      //var loginResponse = $rootScope.loginResponse;
      var contactResponse = $rootScope.contactResponse;
      $scope.displayNewsFeed = [];
      $scope.count = 0;
      $scope.infoTodisplay = peopleService.getPersonInfo();

      if (angular.isDefined($scope.infoTodisplay)) {
        $scope.infoType = $scope.infoTodisplay.type;
        $scope.info = $scope.infoTodisplay.info;
        $scope.prevPage = $scope.infoTodisplay.prevPage;
      }


      $scope.contactSchool = function(info){
        window.plugins.CallNumber.callNumber(onSuccess, onError, info.mobilePhone, true);
      }

      function onSuccess(result){
        console.log("Success:"+result);
      }

      function onError(result) {
        console.log("Error:"+result);
      }


      GlobalService.showLoading();

      // $log.debug("Info Type ", $scope.info);
      if ($scope.infoType == 'student' || $scope.infoType == 'Student') {
        $rootScope.studentDetailsHeader = 'Student Details'
        $scope.infoType = 'student';
        getStudentInfoById();
//        getStudentTrackingByStudentIdAndDate($scope.info.studentId.toString());
        getStudentTrackingByStudentId($scope.info.studentId.toString());
      }
      else if ($scope.infoType === 'Admin' || $scope.infoType === 'Teachers') {
        $rootScope.studentDetailsHeader = 'User Details'
        $scope.othersData = $scope.info;
        getNewsFeedData($scope.othersData.contactId.toString());
      }
      else if ($scope.infoType == 'Parent') {
        $rootScope.studentDetailsHeader = 'Parent Details'
        $scope.othersData = $scope.info;
        GlobalService.hideLoading();
      }
      else {
        $rootScope.studentDetailsHeader = 'Non-User Details'
        $scope.othersData = $scope.info;
        GlobalService.hideLoading();
      }

      $scope.count = 0;
      $scope.loadMore = function() {
        if($scope.displayNewsFeed.length % 50 == 0 && $scope.displayNewsFeed.length)
        {
          $scope.count++;
          if($scope.infoType === 'Admin' || $scope.infoType === 'Teachers'){
            getNewsFeedData($scope.othersData.contactId.toString());
          }
          else {
            getStudentTrackingByStudentId($scope.info.studentId.toString());
          }
        }
        else{
           $scope.$broadcast('scroll.infiniteScrollComplete');
        }
      }

      function getNewsFeedData(userId) {

        var user = {
          count : $scope.count.toString(),
          userId: userId
        };

        var APIname = 'getNewsfeedByUserId';

        NewsfeedService.getNewsfeeds(user, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else {
            GlobalService.hideLoading();
            if (angular.isDefined(response) && response.status == 200) {
              var res = response.data.list;
              if ($scope.count === 0) {
                $scope.displayNewsFeed = res;
              } else {
                $scope.displayNewsFeed = $scope.displayNewsFeed.concat(res);
              }
              $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            else {
              $scope.$broadcast('scroll.infiniteScrollComplete');
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

      function getStudentTrackingByStudentId(userId) {

        var d = new Date();
        var datestring = ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + "-" + d.getFullYear();

        var user = {
          count : $scope.count.toString(),
          studentId: userId
        };

        var APIname = 'app/getTrackingByStudentId';

        NewsfeedService.getNewsfeeds(user, APIname).then(function (response) {
          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else {
            if (angular.isDefined(response) && response.status == 200) {
              var res = response.data.list;
              if ($scope.count === 0) {
                $scope.displayNewsFeed = res;
              } else {
                $scope.displayNewsFeed = $scope.displayNewsFeed.concat(res);
              }
              $scope.displayNewsFeed = res;
        	    var allCheckInOutItems = [];
              var checkInItem = _.filter(res, function(o) { return o.type_name == 'checkIn'; });
              var checkOutItem = _.filter(res, function(o) { return o.type_name == 'checkOut'; });
              var sleepItems = _.filter(res, function(o) { return o.type_name == 'sleep'; });
              $scope.checkInItems = checkInItem;
              angular.forEach(checkInItem, function(item){
                allCheckInOutItems.push(item);
              });
              angular.forEach(checkOutItem, function(item){
                allCheckInOutItems.push(item);
              });
              $log.debug("Unsorted Array ", allCheckInOutItems);
              $log.debug("Array Legnth", res.length);
              var sortedArrayAttendance = _.sortBy(allCheckInOutItems, function(o) { return o.trackingId; }).reverse();

              if(sortedArrayAttendance.length){
                $log.debug("sortedArray.length ", sortedArrayAttendance.length);
                var lastCheckInOutItem = sortedArrayAttendance[0];
                if(lastCheckInOutItem.type_name == 'checkOut'){
                  $('#checkInButton').css('background-color','#158f76;');
                  $scope.checkIn = true;
                }
                else if(lastCheckInOutItem.type_name == 'checkIn'){
                  $('#checkInButton').css('background-color','red');
                  $scope.checkIn = false;
                }
              }
              else{
                $('#checkInButton').css('background-color','#158f76;');
                $scope.checkIn = true;
              }
              $scope.$broadcast('scroll.infiniteScrollComplete');
              GlobalService.hideLoading();
            }
            else {
              $scope.$broadcast('scroll.infiniteScrollComplete');
              GlobalService.hideLoading();
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

//      function getStudentTrackingByStudentIdAndDate(userId) {
//
//        var d = new Date();
//        var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + d.getFullYear();
//        var user = {
//          studentId: userId,
//          date: datestring
//        };
//        var APIname = 'app/getTrackingByStudentIdAndDate';
//
//        NewsfeedService.getNewsfeeds(user, APIname).then(function (response) {
//          if (typeof response.status && response.status === 422) {
//            GlobalService.hideLoading();
//            GlobalService.showToast("Error Occurred", 'long', 'bottom');
//          }
//          else {
//            if (angular.isDefined(response) && response.data.status != "Error") {
//
//              var res = response.data.list;
//
//              var checkInItem = _.filter(res, function (o) {
//                return o.type_name == 'checkIn';
//              });
//
//              var checkOutItem = _.filter(res, function (o) {
//                return o.type_name == 'checkOut';
//              });
//
//              if ((checkInItem.length / checkOutItem.length == 1) || (isNaN(checkInItem.length / checkOutItem.length))) {
//                $scope.checkIn = true;
//              }
//              else {
//                $scope.checkIn = false;
//              }
//            }
//            else {
//              GlobalService.hideLoading();
//              GlobalService.showToast("Error Occurred", 'long', 'bottom');
//            }
//          }
//        });
//      }

      function getStudentInfoById() {

        var student = {
          studentId: $scope.info.studentId.toString()
        };

        var APIname = 'app/getStudentInfoById';

        studentDetailsService.getStudentInfoById(student, APIname).then(function (response) {

          if (typeof response.status && response.status === 422) {
            GlobalService.hideLoading();
            console.log('error');
          }
          else {
            if (angular.isDefined(response)) {
              var res = response.data;
              $scope.enrollment = res.enrollment;
              $scope.student = res.student;
            }
          }
        });
      }

      $ionicModal.fromTemplateUrl('image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modal = modal;
      });

      $scope.showImage = function (img) {
        $scope.imageSrc = img;
        $scope.modal.show();
      };

      $scope.closeModal = function () {
        $scope.modal.hide();
      };

      $scope.submitActivity = function (activity, student) {

        var activityArray = [];
        var d = new Date();
//        var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-"
//          + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":"
//          + ("0" + d.getSeconds()).slice(-2);
				var datestring = moment().tz('Asia/Kuala_Lumpur').format('DD-MM-YYYY HH:mm:ss');

        console.log("Enrollment ", $scope.enrollment);
        if($scope.enrollment != null || $scope.enrollment != undefined){
          if (activity == 'checkIn') {

            $scope.checkIn = false;
            $scope.checkInTime = d;

            var submitActivityObj = {
              trackingType: "checkIn",
              studentId: student.studentId.toString(),
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

            activityArray.push(submitActivityObj);

            var postActivityObj = {
              tracking_list: activityArray
            };
          }

          else if (activity == 'checkOut') {

            $scope.checkIn = true;

            submitActivityObj = {
              trackingType: "checkOut",
              studentId: student.studentId.toString(),
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

            activityArray.push(submitActivityObj);

            postActivityObj = {
              tracking_list: activityArray
            }
          }

          var APIname = 'app/c_tracking_list';

          console.log('Tracking Req ', activityArray);
          studentDetailsService.c_tracking_list(postActivityObj, APIname).then(function (response) {

            if (typeof response.status && response.status === 422) {
              console.log('error');
            }
            else {
              if (angular.isDefined(response)) {
                getStudentTrackingByStudentId(student.studentId.toString());
              }
            }
          });
        }
        else{
          GlobalService.showToast("Cannot check in student. Please enroll student to a program.", 'long', 'bottom');
        }
      };

      $scope.openShowAlert = function () {
        studentDetailsService.setStudent($scope.student);
        $state.go('app.studentDetailsPopup');
      };

        var hideSheet;
        $scope.openActionSheet = function() {

         // Show the action sheet
         hideSheet = $ionicActionSheet.show({
           buttons: [
             { text: '<p class="padding-horizontal">Gallery</p>' },
             { text: '<p class="padding-horizontal">Camera</p>' }
           ],
           titleText: 'Upload Picture',
           cancelText: 'Cancel',
           cancel: function() {
                // add cancel code..
              },
           buttonClicked: function(index) {
            $scope.takePicture(index)
           }
         });

       };


       $scope.takePicture = function (index) {

        document.addEventListener("deviceready", function () {
          // $scope.popover.hide();
//          hideSheet();

          var options = {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: index,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 1000,
            targetHeight: 1000,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };

          var cameraSuccess = function (imageData) {
            onPhotoURISuccess(imageData);

            function onPhotoURISuccess(imageURI) {
              createFileEntry(imageURI);
            }

            function createFileEntry(imageURI) {
              window.resolveLocalFileSystemURL(imageURI, copyPhoto, fail);
            }

            function copyPhoto(fileEntry) {
              window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
                fileSys.root.getDirectory("photos", {create: true, exclusive: false}, function (dir) {
                  var fileName = fileEntry.name;
                  fileEntry.copyTo(dir, fileName, onCopySuccess, fail);
                }, fail);
              }, fail);
            }

            function onCopySuccess(entry) {
              $rootScope.imageFileEntry = entry;
              GlobalService.showLoading();
              $rootScope.imageFileEntry.file(success, fail);
            }

            function success(file) {
              $scope.fileUpload = file;
              var fileUploadOptions = new FormData();
              $log.debug("Photo ", file);

              var fd = new FormData();
              window.resolveLocalFileSystemURL(file.localURL, function (fileEntry) {
              fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                  var imgBlob = new Blob([this.result], {type: "image/jpeg"});
                  imgBlob.name = Math.random()+file.name;
                  var APIname = 'cms/uploadStudentLogo';
                  fd.append('studentLogo', imgBlob, imgBlob.name);
                  fd.append('contactEmail', $rootScope.contactResponse.email);
                  fd.append('studentId', $scope.info.studentId.toString());


//                  for (var [key, value] of fd.entries()) {
//                    console.log(key, value);
//                  }

                  albumsService.uploadPhoto(fd, APIname).then(function(response){
                    $log.debug("File Upload Success ", response);
                      // var contactIdObj = {
                      //   contactId : $rootScope.contactResponse.contactId.toString()
                      // };
                      // kidsService.refreshStudents(contactIdObj).then(function(resp) {
                      //   console.log("REFRESH STUDENTS ", resp);
                      //   localStorage.setItem('studentInfo', JSON.stringify(resp.list));
                      //   var favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
                      //   if(favoriteStudent){
                      //     var favoriteStudentId = favoriteStudent.studentId;
                      //     var matchFavoriteStudent = _.filter(resp.list, function(o) { return o.studentId == favoriteStudentId; });
                      //     localStorage.setItem('favoriteStudentInfo', JSON.stringify(matchFavoriteStudent[0]));
                      //   }
                      //   GlobalService.hideLoading();
                      //   $state.go('pApp.kids');
                      //   GlobalService.showToast('Updated Successfully', 'long', 'bottom');
                      //   $rootScope.init();
                      // });
                      $state.go('app.people');
                  }, function(err) {
                        $log.debug("Error ", err);
                    });
                  };
                  reader.readAsArrayBuffer(file);
                });
              });
            }

            function fail(error) {
              window.alert(JSON.stringify(error));
            }


          };
          var cameraError = function (error) {
            console.error('camera error: ', error);
          };
          navigator.camera.getPicture(cameraSuccess, cameraError, options);
        }, false);
      };
    });
