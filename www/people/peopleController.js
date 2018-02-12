'use strict';
angular.module('toddlytics')
  .controller('PeopleCtrl',
    function ($scope, $state, peopleService, GlobalService, $rootScope, studentDetailsService, $log, API_URL, $http) {

      studentDetailsService.removeStudent();
      var currentUser = $rootScope.loginResponse;
      $scope.currentUser = $rootScope.loginResponse;
      $scope.segmentType = 'students';
      $scope.selected = {
        programs: []
      }

      var preferences = JSON.parse(localStorage.getItem('preferences'));
      if(preferences){
        var listArray = [];
        var matchFound = _.pick(preferences, ['FilterProgramSelection']);
        angular.forEach(matchFound.FilterProgramSelection, function(option){
          if((option == 'Graduated' || option == 'Unenrolled' || option == 'Frozen') && option != null ){
            listArray.push(option);
          }
          else if ((!(option == 'Graduated' || option == 'Unenrolled' || option == 'Frozen')) && option != null){
            listArray.push(parseInt(option));
          }
        });
        $scope.selected.programs = listArray;
      }

      $scope.contactFilter = function(contact) {
        console.log(contact);
        return true;
      }

      $scope.filterStudentsByProgram = function(progId){
        if(progId && progId.length && !_.includes(progId, NaN)){
          listStudent();
          var userPrefObj = {
            contactId : $rootScope.loginResponse.contactId,
            key : 'FilterProgramSelection',
            value : progId.toString()
          };
        }
        else{
          var userPrefObj = {
            contactId : $rootScope.loginResponse.contactId,
            key : 'FilterProgramSelection',
            value : ''
          };
        }
        $log.debug("User Preference  ", userPrefObj);
        $http.post(API_URL+'/cms/c_userPreference', userPrefObj).success(function(response) {
          var preferenceArray = {};
          $log.debug("User Preference ", response);
          preferenceArray['FilterProgramSelection'] = progId;
          localStorage.setItem('preferences', JSON.stringify(preferenceArray));
        }, function(err) {
          // fail case
          $log.debug("Error ", err);
        });
      }

      $scope.programFilter = function(student) {
        if ($scope.selected.programs.length) {
          if (!student.programStudent) {
            if (($scope.selected.programs.indexOf("Unenrolled") > -1)) {
              return student;
            }
            return false;
          }
          else {
            if ((student.programStudent.status.indexOf("Graduated") > -1) && ($scope.selected.programs.indexOf("Graduated") > -1)) {
              return student;
            }
            if ((student.programStudent.status.indexOf("Frozen") > -1) && ($scope.selected.programs.indexOf("Frozen") > -1)) {
              return student;
            }
            else{
              return ($scope.selected.programs.indexOf(student.programStudent.programSchool.programSchoolId) > -1);
            }
          }
        }
        else{
          return student;
        }
      };
      $scope.$watch('selected.programs', function(nv, ov) {
        console.log('$$$$$$$', nv)
      });
      function listProgram() {
        GlobalService.showLoading();

        var obj = {
          orgId: currentUser.organizationId
        }

        var APIname = 'cms/l_program';
        $scope.orderedProgramsList = [];
        peopleService.getProgramList(obj, APIname).then(function(resp){
          console.log(resp);
          $scope.programs = resp.data.list;
          angular.forEach($scope.programs, function(program){
            angular.forEach(program.programSchool, function(programSchool){
              $scope.orderedProgramsList.push(programSchool);
            });
          });
          var unEnrolledObj = {
              capacity : null,
              capacityPercentage : null,
              colorCode : null,
              currentEnrolled : null,
              hasStudents  : null,
              program : null,
              programSchoolId : "Unenrolled",
              programSchoolName : "Unenrolled",
              school : null
          }
          var graduatedObj = {
						capacity : null,
						capacityPercentage : null,
						colorCode : null,
						currentEnrolled : null,
						hasStudents  : null,
						program : null,
						programSchoolId : "Graduated",
						programSchoolName : "Graduated",
						school : null
          }

          var freezedObj = {
              capacity : null,
              capacityPercentage : null,
              colorCode : null,
              currentEnrolled : null,
              hasStudents  : null,
              program : null,
              programSchoolId : "Frozen",
              programSchoolName : "Frozen",
              school : null
          }
          $scope.orderedProgramsList.push(graduatedObj);
          $scope.orderedProgramsList.push(freezedObj);
          $scope.orderedProgramsList.push(unEnrolledObj);
        });
      }
      function listStudent() {

        GlobalService.showLoading();

        var listStudent = {
          orgId: currentUser.organizationId
        };

        var APIname = 'app/listStudent';

        peopleService.getStudentsList(listStudent, APIname).then(function (listResponse) {
          if (typeof listResponse.status && listResponse.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else if (angular.isDefined(listResponse) && listResponse.status === 200 && listResponse.data.status !== 'FAILED') {
            GlobalService.hideLoading();
            var response = listResponse.data;
            $scope.studentsList = response.studentList;
            console.log($scope.studentsList);

            $scope.groupedByProgram = _.groupBy($scope.studentsList, function(s) {
              return s.programStudent ? s.programStudent.programSchool.program.programId : 'unenrolled';
            });
            console.log($scope.groupedByProgram);
          }
          else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
        });
      }

      function listContact() {

        var listContact = {
          org_id: currentUser.organizationId
        };

        var APIname = 'app/getContactsByOrgId';

        peopleService.getContactsList(listContact, APIname).then(function (listResponse) {

          if (typeof listResponse.status && listResponse.status === 422) {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
          else if (angular.isDefined(listResponse) && listResponse.status === 200 && listResponse.data.status !== 'FAILED') {
            GlobalService.hideLoading();
            var response = listResponse.data;
            $scope.contactsList = response.contactList;
            console.log($scope.contactsList);
            $scope.groupedContacts = _.groupBy($scope.contactsList, function(c) {
              return c.type;
            });
            console.log($scope.groupedContacts);
          } else {
            GlobalService.hideLoading();
            GlobalService.showToast("Error Occurred", 'long', 'bottom');
          }
        });
      }

      $scope.openPersonInfo = function (type, personInfo) {
        $scope.peopleObject = {
          type: type,
          info: personInfo,
          prevPage: 'people'
        };
        peopleService.setPersonInfo($scope.peopleObject);
        $state.go('app.studentDetails');
      };

      listStudent();
      listContact();
      listProgram();
      $rootScope.heldItems = [];
      $scope.holdItem = function(student) {
        if ($rootScope.heldItems.indexOf(student) < 0) {
          $rootScope.heldItems.push(student);
        } else {
          $rootScope.heldItems.splice($rootScope.heldItems.indexOf(student), 1);
        }
      };

      $rootScope.itemsAlert = function() {
        console.log('-- HERE --');
        console.log($rootScope.heldItems);

        $state.go('app.studentDetailsPopup', {students: $rootScope.heldItems});
      };
    });
