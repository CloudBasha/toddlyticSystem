'use strict';
angular.module('toddlytics')
  .controller('newsfeedCtrl', function ($scope, $state, albumsService, NewsfeedService, peopleService, GlobalService, $rootScope, $ionicPopover, $cordovaCamera, $stateParams, $ionicPopup, $cordovaFile, $ionicModal, $cordovaSQLite, $log, $timeout, iso4217, $ionicActionSheet,  ionicDatePicker, ionicTimePicker, actionsService) {

    $scope.$state = $state;
    var loginResponse = $rootScope.loginResponse;
    var contactResponse = $rootScope.contactResponse;

    if($stateParams.push){
      GlobalService.showToast($stateParams.push.additionalData.pushToast, 'long', 'bottom');
    }

//    if($stateParams.refresh){
//       $rootScope.getParentNewsFeedData();
//    }
    $scope.userEmail = contactResponse.email;
    $scope.userType = contactResponse.type;
    $scope.loginType = loginResponse.type;
    $scope.search = {text: ''};
    $scope.showFilter = false;
    $scope.displayNewsFeed = [];
    $scope.eTracking = {
        contactEmail: contactResponse.email,
        start_time: "",
        trackingId: ""
    };
    var timeOptions = {};
    var appointmentDatePickerOptions = {};

    $scope.showTrackingModal = function(approval) {
        console.log('APPROVAL',approval);
        $scope.editTracking = {};
        $scope.editTracking.date = moment(approval.auditLog.created_datetime).format('DD-MM-YYYY');
        $scope.editTracking.time = moment(approval.auditLog.created_datetime).format('h:mm a');
        $scope.eTracking.trackingId = approval.tracking.trackingId.toString();
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
          inputEpochTime: (((new Date($scope.approvalItem.auditLog.created_datetime)).getHours()) * 60 * 60),
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
          from: new Date($scope.approvalItem.auditLog.created_datetime),
          closeOnSelect: true,       //Optional
          templateType: 'popup'       //Optional
        };

        $scope.openTrackingModal();
        $scope.newsfeedItem = approval;
      };

    $scope.submitTracking = function() {      
        var x = moment($scope.editTracking.date + ' ' + $scope.editTracking.time, 'DD-MM-YYYY hh:mm A');
        console.log(x);
        $scope.eTracking.start_time = x.format('DD-MM-YYYY HH:mm:ss');
        console.log($scope.eTracking);
        actionsService.eTracking($scope.eTracking).then(function(resp) {
          console.log(resp);
          $scope.doRefresh();
          $scope.closeTrackingModal();
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
                $scope.doRefresh();
              });
           } else {
             console.log('You are not sure');
           }
         });
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

    $scope.openTimePicker = function() {
      ionicTimePicker.openTimePicker(timeOptions);
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(appointmentDatePickerOptions);
    };


    $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
    });

    $scope.openPopover = function ($event) {
      $scope.popover.show($event);
    };

    $scope.openQuickLinkPage = function (state) {
      $scope.popover.hide();
      $state.go(state);
    };

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

    var hideSheet;
    $scope.show = function() {
        $scope.popover.hide();

     // Show the action sheet
     hideSheet = $ionicActionSheet.show({
       buttons: [
        { text: '<span class="padding">Gallery</span>' },
         { text: '<span class="padding">Camera</span>' }
       ],
       titleText: 'Upload Picture',
       cancelText: 'Cancel',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
        $scope.takePicture(index);
       }
     });

   };

    $scope.takePicture = function (index) {

      document.addEventListener("deviceready", function () {
        hideSheet();

        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: index,
          allowEdit: false,
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
            if(loginResponse.type === 'ADMIN' || loginResponse.type === 'TEACHER'){
              $state.go('app.popupAlbums');
              $rootScope.takePictureBoolean = true;
            }
            else if(loginResponse.type == 'PARENT'){
              $state.go('pApp.popupAlbums');
              $rootScope.takePictureBoolean = true;
            }
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

    $scope.openPersonInfo = function (type, personInfo) {
      if($rootScope.loginResponse.type != 'PARENT'){
        GlobalService.showLoading();
        if ($scope.userType !== 'Staff') {
          $scope.peopleObject = {
            type: type,
            info: personInfo,
            prevPage: 'newsfeed'
          };
          peopleService.setPersonInfo($scope.peopleObject);
          GlobalService.hideLoading();
          $state.go('app.studentDetails');
        }
        else {
          GlobalService.hideLoading();
        }
      }
    };

    $scope.doRefresh = function () {
      $scope.$broadcast('scroll.refreshComplete');
      $scope.count = 0;
      GlobalService.showLoading();
      if($scope.loginType === 'ADMIN' || $scope.loginType === 'TEACHER'){
        getNewsFeedData();
      }
      else if($scope.loginType == 'PARENT'){
        $rootScope.getParentNewsFeedData();
      }
    };
  
    $scope.count = 0;
    $scope.loadMore = function() {
      if($scope.displayNewsFeed.length % 50 == 0 && $scope.displayNewsFeed.length)
      {
        $scope.infiniteLoad = true;
        $scope.count++;
        if($scope.loginType === 'ADMIN' || $scope.loginType === 'TEACHER'){
          getNewsFeedData();
        }
        else if($scope.loginType == 'PARENT'){
          $rootScope.getParentNewsFeedData();
        }
      }
      else{
         $scope.infiniteLoad = false;
         $scope.$broadcast('scroll.infiniteScrollComplete');
      }
    }

    $rootScope.checkOfflineNewsFeedGlobal = function() {

      console.log("Global Working");

      var query = "SELECT * FROM newfeedData";

      $cordovaSQLite.execute(db, query).then(function (result) {
        if (result.rows.length > 0) {
          console.log("TIME ZONE ", $rootScope.timeZone);
          $scope.displayNewsFeed = JSON.parse(result.rows.item(0).news);
          console.log("Offline DB Results ", $scope.displayNewsFeed);
          angular.forEach($scope.displayNewsFeed, function(newsItem){
                var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                newsItem.auditLog.formattedDateTime = finalDateTime;
//                console.log("Converted Time ", formattedDateTime);
          });
          console.log("Offline Read Results ", result);
          GlobalService.hideLoading();
        } else {
          if($scope.userType === 'ADMIN' || $scope.userType === 'TEACHER'){
            getNewsFeedData();
          }
          else if ($scope.userType == 'PARENT'){
            $rootScope.getParentNewsFeedData();
          }
        }
      }, function (error) {
        alert(error);
      });
    }

    function checkOfflineNewsFeed() {

      var query = "SELECT * FROM newfeedData";

      $cordovaSQLite.execute(db, query).then(function (result) {
        if (result.rows.length > 0) {
          console.log("TIME ZONE ", $rootScope.timeZone);
          $scope.displayNewsFeed = JSON.parse(result.rows.item(0).news);
          console.log("Offline DB Results ", $scope.displayNewsFeed);
          angular.forEach($scope.displayNewsFeed, function(newsItem){
                var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                newsItem.auditLog.formattedDateTime = finalDateTime;
//                console.log("Converted Time ", formattedDateTime);
          });
          console.log("Offline Read Results ", result);
          GlobalService.hideLoading();
        } else {
          if ($rootScope.loginResponse.type === 'ADMIN' || $rootScope.loginResponse.type === 'TEACHER') {
            getNewsFeedData();
          } else {
            GlobalService.hideLoading();
          }
        }
      }, function (error) {
        alert(error);
      });
    }

    function getNewsFeedData() {
      if(!$scope.infiniteLoad){
        GlobalService.showLoading();
      }
      var organization = {
        orgId: loginResponse.organizationId,
        count: String($scope.count)
      };

      var APIname = 'getNewFeedByOrgId';

      NewsfeedService.getNewsfeeds(organization, APIname).then(function (response) {
        console.log('Response ', response);

        if (typeof response.status && response.status === 422) {
          GlobalService.showToast("Error Occurred", 'long', 'bottom');
        }
        else {
          if (angular.isDefined(response) && response.status == 200) {
            GlobalService.hideLoading();
            if ($scope.count === 0) {
              $scope.displayNewsFeed = response.data.list;
            } else {
              $scope.displayNewsFeed = $scope.displayNewsFeed.concat(response.data.list);
            }
            console.log('#########', $scope.displayNewsFeed);
            $scope.$broadcast('scroll.infiniteScrollComplete');
            console.log("TIME ZONE ", $rootScope.timeZone);
            angular.forEach($scope.displayNewsFeed, function(newsItem){
                  var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                  var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                  newsItem.auditLog.formattedDateTime = finalDateTime;
//                  console.log("Converted Time ", formattedDateTime);
            });
            var newsFeed = JSON.stringify($scope.displayNewsFeed);
            $cordovaSQLite.execute(db, "DELETE FROM newfeedData")
              .then(function (res) {
                  console.log('Deleted');
                  $cordovaSQLite.execute(db, 'insert into newfeedData(news) values(?)', [newsFeed])
                    .then(function (res) {
                        console.log('inserted');
                        $scope.infiniteLoad = false;
//                        $scope.$apply();
      //                  var query = "SELECT * FROM newfeedData";
      //
      //                  $cordovaSQLite.execute(db, query).then(function (result) {
      //                    if (result.rows.length > 0) {
      //                            console.log("Read Results ", result);
      //                    }
      //                  }, function (error) {
      //                    alert(error);
      //                  });
                      },
                      function (error) {
                      }
                  );
                },
                function (error) {
                }
            );
          }
          else {
            GlobalService.hideLoading();
            $scope.infiniteLoad = false
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
        }
      },
      function (error) {
        $scope.infiniteLoad = false
        console.log('Response Error', error);
        checkOfflineNewsFeed();
      });
    }

  $rootScope.getParentNewsFeedData = function() {
      if(!$scope.infiniteLoad){
        GlobalService.showLoading();
      }
      var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
      $log.debug("Student Info ", getStudentInfo);
      var getFavStudentJSON = localStorage.getItem('favoriteStudentInfo');
//      if(getFavStudent != null){
//        $log.debug("Favorite Student Info ", getFavStudent);
//        $rootScope.favStudentId = getFavStudent.studentId;
//      }
    
      if(getFavStudentJSON !== undefined){
        var getFavStudent = JSON.parse(getFavStudentJSON);
      }

      if(getStudentInfo.length > 0){
        if(getFavStudent == undefined){
          var studentsArray = _.filter(getStudentInfo, function(o) { return o.programSchoolId != null; });
          localStorage.setItem('favoriteStudentInfo', JSON.stringify(studentsArray[0]));
          $rootScope.favStudentId = studentsArray[0].studentId;
          GlobalService.showLoading();

          var organization = {
            studentId: studentsArray[0].studentId.toString(),
            count: String($scope.count)
          };

          var APIname = 'app/getNewsfeedByStudentId';

          NewsfeedService.getParentNewsfeeds(organization, APIname).then(function (response) {
            console.log('Response ', response);

            if (typeof response.status && response.status === 422) {
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
            else {
              if (angular.isDefined(response) && response.status == 200) {
                GlobalService.hideLoading();
                $scope.displayNewsFeed = response.data.list;
                console.log("TIME ZONE ", $rootScope.timeZone);
                angular.forEach($scope.displayNewsFeed, function(newsItem){
                      var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                      var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                      newsItem.auditLog.formattedDateTime = finalDateTime;
    //                  console.log("Converted Time ", formattedDateTime);
                });
                console.log("TIME ZONE ", $scope.displayNewsFeed);
                var newsFeed = JSON.stringify($scope.displayNewsFeed);
                $cordovaSQLite.execute(db, "DELETE FROM newfeedData")
                  .then(function (res) {
                      console.log('Deleted');
                      $cordovaSQLite.execute(db, 'insert into newfeedData(news) values(?)', [newsFeed])
                        .then(function (res) {
                            console.log('inserted');
                          },
                          function (error) {
                          }
                      );
                    },
                    function (error) {
                    }
                );
                $scope.infiniteLoad = false
                $scope.$broadcast('scroll.infiniteScrollComplete');
              }
              else {
                $scope.infiniteLoad = false
                GlobalService.hideLoading();
                GlobalService.showToast("Error Occurred", 'long', 'bottom');
              }
            }
          },
          function (error) {
            $scope.infiniteLoad = false
            console.log('Response Error', error);
            checkOfflineNewsFeed();
          });
        }
        else{
          GlobalService.showLoading();
          var currencyCode = getFavStudent.orgCurrency || "MYR";
          var currencyResp = iso4217.getCurrencyByCode(currencyCode);
          $rootScope.currency = currencyResp.symbol;
          $rootScope.favStudentId = getFavStudent.studentId;
          $log.debug("Favorite Student Info ", getFavStudent);

          var organization = {
            studentId: getFavStudent.studentId.toString(),
            count: String($scope.count)
          };

          var APIname = 'app/getNewsfeedByStudentId';

          NewsfeedService.getParentNewsfeeds(organization, APIname).then(function (response) {
            console.log('Response ', response);
//            var test = _.size(response.data.list[0].studentInfo);
//            console.log("!@#$#!@#!@#@# ", test);

            if (typeof response.status && response.status === 422) {
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
            else {
              if (angular.isDefined(response) && response.status == 200) {
                GlobalService.hideLoading();
                if ($scope.count === 0) {
                  $scope.displayNewsFeed = response.data.list;
                } else {
                  $scope.displayNewsFeed.concat(response.data.list);
                }
                console.log("TIME ZONE ", $rootScope.timeZone);
                angular.forEach($scope.displayNewsFeed, function(newsItem){
                      var formattedDateTime = moment.tz(newsItem.auditLog.created_datetime, 'Asia/Kuala_Lumpur');
                      var finalDateTime = formattedDateTime.clone().tz($rootScope.timeZone);
                      newsItem.auditLog.formattedDateTime = finalDateTime;
    //                  console.log("Converted Time ", formattedDateTime);
                });
                $scope.$broadcast('scroll.infiniteScrollComplete');
                console.log("TIME ZONE ", $scope.displayNewsFeed);
                var newsFeed = JSON.stringify($scope.displayNewsFeed);
                $cordovaSQLite.execute(db, "DELETE FROM newfeedData")
                  .then(function (res) {
                      console.log('Deleted');
                      $cordovaSQLite.execute(db, 'insert into newfeedData(news) values(?)', [newsFeed])
                        .then(function (res) {
                            console.log('inserted');
                          },
                          function (error) {
                          }
                      );
                    },
                    function (error) {
                    }
                );
              }
              else {
                GlobalService.hideLoading();
                GlobalService.showToast("Error Occurred", 'long', 'bottom');
              }
            }
          },
          function (error) {
            console.log('Response Error', error);
            checkOfflineNewsFeed();
          });
        }
      }
      else{
        $log.debug("No Students To fetch newsfeed");
      }
  }

  if($scope.loginType === 'ADMIN' || $scope.loginType === 'TEACHER' ){
    getNewsFeedData();
  }
  else if($scope.loginType == 'PARENT' && $rootScope.loginResponse.students.length > 0){
    $rootScope.getParentNewsFeedData();
  }

  })

  .controller('popupAlbumsCtrl', function ($scope, $state, $rootScope, albumsService, GlobalService, $log) {

    var loginResponse = $rootScope.loginResponse;
    var contactResponse = $rootScope.contactResponse;

    $scope.albumsWithCovers = [];
    $rootScope.getAlbum = {Id: ''};


    $rootScope.sendPhotoToAlbum = function (albumId) {
      $rootScope.disableSave = true;
      function success(file) {
        $scope.fileUpload = file;
        var fileUploadOptions = new FormData();
        $log.debug("Photo ", file);
        window.resolveLocalFileSystemURL(file.localURL, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              var imgBlob = new Blob([this.result], {type: "image/jpeg"});
              imgBlob.name = "fileName";
              $log.debug("CHECK FILE ", imgBlob);
              fileUploadOptions.append('albumId', albumId.toString());
              fileUploadOptions.append('orgId', loginResponse.organizationId.toString());
              fileUploadOptions.append("photo", imgBlob, file.name);
              // fileUploadOptions.append('photo', imgBlob);
              fileUploadOptions.append('studentId', []);
              fileUploadOptions.append('contactEmail', contactResponse.email);
              fileUploadOptions.append('description', '');

              /*for (var [key, value] of fileUploadOptions.entries()) {
               $log.debug(key, value);
               }*/

              var APIname = 'app/upload_photo';

              albumsService.uploadPhoto(fileUploadOptions, APIname).then(function (response) {
                $log.debug("Upload Photo Response ", response);
                $rootScope.disableSave = false;
                if (typeof response.status && response.status === 422) {
                  GlobalService.hideLoading();
                  GlobalService.showToast("Error Occurred", 'long', 'bottom');
                }
                else {
                  if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
                    GlobalService.showToast("Photo Saved Successfully", 'long', 'bottom');
                    $state.go('app.albums');
                    $rootScope.takePictureBoolean = false;
                  }
                  else {
                    GlobalService.showToast("Error Occurred " + response, 'long', 'bottom');
                  }
                }
              });
            };
            reader.readAsArrayBuffer(file);

          }, function (e) {
            $scope.errorHandler(e)
          });
        }, function (e) {
          $scope.errorHandler(e)
        });
      }

      function fail(error) {
        alert("Unable to retrieve file properties: " + error.code);
      }

      // obtain properties of a file
      $rootScope.imageFileEntry.file(success, fail)
    };

    function getAlbumByOrgId() {

      var getAlbum = {
        orgId: loginResponse.organizationId
      };

      var APIname = 'app/getAlbumByOrgId';

      albumsService.getAlbumByOrgId(getAlbum, APIname).then(function (response) {

        if (typeof response.status && response.status === 422) {
          GlobalService.hideLoading();
          GlobalService.showToast("Error Occurred", 'long', 'bottom');
        }
        else {

          if (angular.isDefined(response) && response.data !== '' && response.status == 200) {
            var albums = response.data.list;
            var albumLength = albums.length;

            for (var album = 0; album < albumLength; album++) {

              var albumList = albums[album].albumList;

              for (var i = 0; i < albumList.length; i++) {
                $scope.albumsWithCovers.push(albumList[i]);
              }
            }
            $rootScope.getAlbum.Id = $scope.albumsWithCovers[0].albumId;
            GlobalService.hideLoading();
          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
        }
      });
    }

    function getAlbumByStudentId() {
        var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
        GlobalService.showLoading();

        var getAlbum = {
          studentId: getFavStudent.studentId.toString()
        };

        var APIname = 'app/p_getStudentPhotos';

        albumsService.getAlbumByStudentId(getAlbum, APIname).then(function (response) {
          $log.debug("Response ", response);
          if (typeof response.status && response.status === 422) {
            console.log('error');
          }
          else {

            if (angular.isDefined(response) && response.status == 200) {

              var albums = response.data.list;
              angular.forEach(albums, function(album){
                $scope.albumsWithCovers.push(album);
              });
              GlobalService.hideLoading();
            }
            else {
              GlobalService.hideLoading();
              GlobalService.showToast("Error Occurred", 'long', 'bottom');
            }
          }
        });
      }

    if(loginResponse.type === 'ADMIN' || loginResponse.type === 'TEACHER'){
      getAlbumByOrgId();
    }
    else if(loginResponse.type == 'PARENT'){
      var getStudentInfo = JSON.parse(localStorage.getItem('studentInfo'));
      if(getStudentInfo.length > 0){
        getAlbumByStudentId();
      }
    }
  });
