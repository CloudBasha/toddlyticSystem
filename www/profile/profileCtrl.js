'use strict';
angular.module('toddlytics')
  .controller('profileCtrl', function ($scope, $state, $log, GlobalService, $rootScope, $window, profileService, $cordovaCamera, authService, $ionicActionSheet, albumsService, $timeout, $ionicModal) {
  
    
  function init(){
    $scope.contact = $rootScope.contactResponse;
    console.log("CHECK IF UPDATED ", $scope.contact);
    $scope.profile = {
        name: $scope.contact.name,
        email: $scope.contact.email,
        contactEmail: $scope.contact.email,
        mobile: $scope.contact.mobilePhone,
        homePhone : $scope.contact.homePhone || '',
        designation : $scope.contact.designation,
        type: $scope.contact.type,
        address1: $scope.contact.homeAddressStreetOne || '',
        address2: $scope.contact.homeAddressStreetTwo || '',
        postCode: $scope.contact.homeAddressPostCode || '',
        state: $scope.contact.homeAddressState || '',
        country: $scope.contact.homeAddressCountry || '',
        city: $scope.contact.homeAddressCity || '',
        officeAddress1: $scope.contact.workAddressStreetOne || '',
        officeAddress2: $scope.contact.workAddressStreetTwo || '',
        officePostCode: $scope.contact.workAddressPostCode || '',
        officeState: $scope.contact.workAddressState || '',
        officeCountry: $scope.contact.workAddressCountry || '',
        officeCity: $scope.contact.workAddressCity || '',
        staffId: $scope.contact.contactId.toString(),
        identificationNo : $scope.contact.identificationNo,
        relationship : $scope.contact.relationType
    }
    $scope.homeAddress = ($scope.profile.address1 || '') + ' ' + ($scope.profile.address2 || '')  + ' ' + ($scope.profile.city || '') + ' ' + ($scope.profile.postCode || '') + ' ' + ($scope.profile.state || '') + ' ' + ($scope.profile.country || '');
    
    $scope.officeAddress = $scope.profile.officeAddress1 + ' ' + $scope.profile.officeAddress2  + ' ' + $scope.profile.officeCity  + ' ' + $scope.profile.officePostCode + ' ' + $scope.profile.officeState  + ' ' + $scope.profile.officeCountry;
  }
  
  init();
  
  $scope.profilePic = $rootScope.checkImageUrl($scope.contact.photoUrl);
    $scope.update_info = function() {
        GlobalService.showLoading('Updating...');
        if($rootScope.loginResponse.type === 'ADMIN' || $rootScope.loginResponse.type === 'TEACHER'){
            var editObject = {
              name: $scope.profile.name,
              email: $scope.profile.email,
              contactEmail: $scope.profile.email,
              mobile: $scope.profile.mobile,
              designation : $scope.profile.designation,
              type: $scope.profile.type,
              address1: $scope.profile.address1 || '',
              address2: $scope.profile.address2 || '',
              postCode: $scope.profile.postCode || '',
              state: $scope.profile.state || '',
              country: $scope.profile.country || '',
              city: $scope.profile.city || '',
              staffId: $scope.profile.staffId,
              identificationNo : $scope.profile.identificationNo
            }
            profileService.update(editObject).then(function (resp) {
                console.log(resp);
                GlobalService.hideLoading();
                var contactObj = {
                  contactId: $rootScope.contactResponse.contactId.toString()
                };

                var APIname = 'app/getContactsById';

                authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
                  if (typeof contactResponse.status && contactResponse.status === 422) {
//                    GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                  }
                  else {
                    $rootScope.contactResponse = contactResponse.data.contact;
                    localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                    GlobalService.showToast('Updated Successfully', 'long', 'bottom');
                  }
                });
            });
          }
          else if($rootScope.loginResponse.type == 'PARENT'){
            var editObject = {
              name: $scope.profile.name,
              mobile: $scope.profile.mobile,
              designation : $scope.profile.designation,
              phone : $scope.profile.homePhone || '',
              address1: $scope.profile.address1 || '',
              address2: $scope.profile.address2 || '',
              postCode: $scope.profile.postCode || '',
              state: $scope.profile.state || '',
              country: $scope.profile.country || '',
              city: $scope.profile.city || '',
              officeAddress1 : $scope.profile.officeAddress1 || '',
              officeAddress2: $scope.profile.officeAddress2 || '',
              officePostCode: $scope.profile.officePostCode || '',
              officeState: $scope.profile.officeState || '',
              officeCountry: $scope.profile.officeCountry || '',
              officeCity: $scope.profile.officeCity || '',
              contactId: $scope.profile.staffId,
              identificationNo : $scope.profile.identificationNo,
              nationality : $scope.profile.nationality,
              contactEmail: $scope.profile.email,
              relationship : $scope.profile.relationship
            }
            profileService.updateParent(editObject).then(function (resp) {
                console.log(resp);
                GlobalService.hideLoading();
                var contactObj = {
                  contactId: $rootScope.contactResponse.contactId.toString()
                };

                var APIname = 'app/getContactsById';

                authService.getContactsById(contactObj, APIname).then(function (contactResponse) {
                  if (typeof contactResponse.status && contactResponse.status === 422) {
//                    GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                  }
                  else {
                    $rootScope.contactResponse = contactResponse.data.contact;
                    localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                    GlobalService.showToast('Updated Successfully', 'long', 'bottom');
                  }
                });
            });
          }
    };  
  
    $ionicModal.fromTemplateUrl('homeAddress.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) { $scope.homeAddressModal = modal; });
  
    $ionicModal.fromTemplateUrl('officeAddress.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) { $scope.officeAddressModal = modal; });
  
    $scope.closeHomeModal = function() {
      $scope.homeAddressModal.hide();
      $scope.homeAddress = ($scope.profile.address1 || '') + ' ' + ($scope.profile.address2 || '')  + ' ' + ($scope.profile.city || '') + ' ' + ($scope.profile.postCode || '') + ' ' + ($scope.profile.state || '') + ' ' + ($scope.profile.country || '');

    };
  
    $scope.closeOfficeModal = function() {
      $scope.officeAddressModal.hide();
      $scope.officeAddress = $scope.profile.officeAddress1 + ' ' + $scope.profile.officeAddress2  + ' ' + $scope.profile.officeCity  + ' ' + $scope.profile.officePostCode + ' ' + $scope.profile.officeState  + ' ' + $scope.profile.officeCountry;
    };
  
    var hideSheet;
    $scope.show = function() {

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
        $scope.takePicture1(index);
       }
     });

   };


   $scope.takePicture1 = function (index) {

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
              var fileName = Math.random()+fileEntry.name;
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
          $log.debug("Photo ", file);

          var fd = new FormData();
          window.resolveLocalFileSystemURL(file.localURL, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              var imgBlob = new Blob([this.result], {type: "image/jpeg"});
              imgBlob.name = file.name;
               var APIname = "";
              fd.append('contactId', $rootScope.contactResponse.contactId);
              if ($rootScope.loginResponse.type === "ADMIN" || $rootScope.loginResponse.type === "TEACHER") {
                APIname = 'cms/uploadContactLogo';
                fd.append('contactLogo', imgBlob, imgBlob.name);
              }

              if ($rootScope.loginResponse.type === "PARENT") {
                APIname = 'app/upload_parent_photo';
                fd.append('photo', imgBlob, imgBlob.name);
                fd.append('type', 'parent');
                fd.append('contactEmail', $rootScope.contactResponse.email);
                fd.append('studentId',null);
              }
//                for (var [key, value] of fd.entries()) {
//                console.log(key, value);
//               }

              albumsService.uploadPhoto(fd, APIname).then(function(response){
                $log.debug("File Upload Success ", response);
                    // GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');

                    var contactIdObj = {
                      contactId : $rootScope.contactResponse.contactId.toString()
                    };

                    var APIname2 = 'app/getContactsById';
                   authService.getContactsById(contactIdObj, APIname2).then(function (contactResponse) {
                      if (typeof contactResponse.status && contactResponse.status === 422) {
//                        GlobalService.showToast("You login attempt was unsuccessful.", 'long', 'bottom');
                      }
                      else {
                        $rootScope.contactResponse = contactResponse.data.contact;
                        localStorage.setItem('contactResponse', JSON.stringify(contactResponse.data.contact));
                        $scope.profilePic = $rootScope.checkImageUrl(contactResponse.data.contact.photoUrl);
                        GlobalService.hideLoading();
                        GlobalService.showToast('Photo Updated Successfully', 'long', 'bottom');
                        localStorage.setItem('profilePicSet', true);
                        $timeout(function(){
                          $window.location.reload();
                        }, 500);
                      }
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