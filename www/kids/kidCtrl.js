'use strict';
angular.module('toddlytics')
  .controller('kidCtrl', function ($scope, $state, $stateParams, $log, GlobalService, $rootScope, $window, kidsService, ionicDatePicker,  $ionicActionSheet, $cordovaCamera, $cordovaFile, albumsService) {
    console.log($stateParams);
    $scope.adding = $stateParams.adding;
    $scope.kid = {
        studentName: '',
    };
    if($stateParams.kid) {
        $scope.picture = $stateParams.kid.photoUrl;
        $scope.kid = {
            studentName: $stateParams.kid.name,
            studentId: $stateParams.kid.studentId.toString(),
            studentGender: $stateParams.kid.gender || '',
            specialRequest: $stateParams.kid.specialRequest || '',
            studentDob: $stateParams.kid.dob || ''
        };
    }

    $scope.update_info = function (form) {
      if(form.$invalid) {
        GlobalService.showToast('Please enter Name and Date of Birth', 'long', 'bottom');
        return;
      }
        GlobalService.showLoading('Updating');
        kidsService.update($scope.kid).then(function(resp) {
          console.log(resp);
          var contactIdObj = {
            contactId : $rootScope.contactResponse.contactId.toString()
          }
          kidsService.refreshStudents(contactIdObj).then(function(resp) {
            console.log("REFRESH STUDENTS ", resp);
            localStorage.setItem('studentInfo', JSON.stringify(resp.list));
            GlobalService.hideLoading();
            GlobalService.showToast('Updated Successfully', 'long', 'bottom');
          });
        });
    };

    $scope.create = function (form) {
      if(form.$invalid) {
        GlobalService.showToast('Please enter Name and Date of Birth', 'long', 'bottom');
        return;
      }
        var data = {
            studentName: $scope.kid.studentName,
            studentDob: $scope.kid.studentDob,
            gender: $scope.kid.studentGender || '',
            specialRequest: $scope.kid.specialRequest || '',
            contactEmail: $rootScope.contactResponse.email,
            orgId: null
        };
        GlobalService.showLoading('Creating');
        kidsService.create(data).then(function(resp) {
            console.log(resp);
            var contactIdObj = {
              contactId : $rootScope.contactResponse.contactId.toString()
            }
            kidsService.refreshStudents(contactIdObj).then(function(resp) {
              console.log("REFRESH STUDENTS ", resp);
              localStorage.setItem('studentInfo', JSON.stringify(resp.list));
              GlobalService.hideLoading();
              $state.go('pApp.kids');
              GlobalService.showToast('Student Created', 'long', 'bottom');
            });
        });
    };

    var datePickerOptions = {
      callback: function (val) {
        console.log('Return value from the datepicker popup is : ' + val, new Date(val));
        $scope.kid.studentDob = moment(val).format('DD-MM-YYYY');
      },
      from: '',
      to: new Date(), //Optional
      closeOnSelect: true,       //Optional
      templateType: 'popup'       //Optional
    };

    $scope.openDatePicker = function(){
      ionicDatePicker.openDatePicker(datePickerOptions);
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
      hideSheet();

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
               var APIname = "";
              if ($stateParams.kid.programSchoolId) {
                APIname = 'cms/uploadStudentLogo';
                fd.append('studentLogo', imgBlob, imgBlob.name);
                fd.append('contactEmail', $rootScope.contactResponse.email);
                fd.append('studentId', $scope.kid.studentId);
              } else {
                APIname = 'app/upload_parent_photo';
                fd.append('type', 'student');
                fd.append('photo', imgBlob, imgBlob.name);
                fd.append('contactEmail', $rootScope.contactResponse.email);
                fd.append('studentId', $scope.kid.studentId);
                fd.append('contactId', $rootScope.contactResponse.contactId.toString());
              }

//              for (var [key, value] of fd.entries()) {
//                console.log(key, value);
//              }

              albumsService.uploadPhoto(fd, APIname).then(function(response){
                $log.debug("File Upload Success ", response);
                  var contactIdObj = {
                    contactId : $rootScope.contactResponse.contactId.toString()
                  };
                  kidsService.refreshStudents(contactIdObj).then(function(resp) {
                    console.log("REFRESH STUDENTS ", resp);
                    localStorage.setItem('studentInfo', JSON.stringify(resp.list));
                    var favoriteStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
                    if(favoriteStudent){
                      var favoriteStudentId = favoriteStudent.studentId;
                      var matchFavoriteStudent = _.filter(resp.list, function(o) { return o.studentId == favoriteStudentId; });
                      localStorage.setItem('favoriteStudentInfo', JSON.stringify(matchFavoriteStudent[0]));
                    }
                    GlobalService.hideLoading();
                    $state.go('pApp.kids');
                    GlobalService.showToast('Updated Successfully', 'long', 'bottom');
                    $rootScope.init();
                  });
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
