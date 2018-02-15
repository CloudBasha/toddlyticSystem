'use strict';
angular.module('toddlytics')
  .controller('calendarCtrl', function($scope, $state, $ionicLoading, $http, $stateParams, $log, $ionicModal, $timeout, $rootScope, $filter, $ionicHistory, calendarService, GlobalService) {

  if($stateParams.push){
    GlobalService.showToast($stateParams.push.additionalData.pushToast, 'long', 'bottom');
  }

  $scope.stateParams = $stateParams.obj;
  $scope.publicCalendar = $stateParams.publicCalendar;
  $log.debug("State Params ", $scope.stateParams);
  $log.debug("State publicCalendar ", $scope.publicCalendar);

  $scope.filterEvents = function(value){
    $scope.events = [];
    var filterDate = $filter('date')(value, 'yyyy-MM-dd')
    var dateSplitter = filterDate.split('-');
    var filteredMonth = dateSplitter[1];
//    var formattedMonth = pad(filteredMonth);
    var filterDateFinal = dateSplitter[0]+"-"+filteredMonth+"-"+dateSplitter[2];
    $log.log(filterDateFinal);
    var filterList = $filter('filter')($scope.eventsArray, {eventDate:filterDate});
    $scope.events = (filterList);
    $log.log($scope.events);
  }

  if($scope.publicCalendar != null){
    $scope.eventsArray = [];
    var eventObj = {};
    var APIname = 'app/getPublicEvents';
    calendarService.getPublicEvents(eventObj, APIname).then(function (response) {
        $log.debug("Public Event Response ", response);
        if(response.data.list.length > 0){
          $scope.eventList = response.data.list;
          angular.forEach($scope.eventList, function(event){
            if(event.meal != null){
              var activity = {
                eventTitle : event.eventName,
                eventDesc : "",
                eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
                startTime : $filter('date')(event.startTime , 'h:mm a'),
                meal: event.meal.mealName,
                notes : event.notesToParent
              };
            }
            else{
              var activity = {
                eventTitle : event.eventName,
                eventDesc : "",
                eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
                startTime : $filter('date')(event.startTime , 'h:mm a'),
                meal: null,
                notes : event.notesToParent
              };
            }
            $scope.eventsArray.push(activity);
          });

          var date = new Date();
          $scope.highlights = [];

          angular.forEach($scope.eventsArray, function(event){
            var eventDateSplit = event.eventDate.split('-');
            var highlightObj = {
              date: new Date(eventDateSplit[0],eventDateSplit[1]-1,eventDateSplit[2]),
              color: '#8FD4D9',
              textColor: '#fff'
            };
            $scope.highlights.push(highlightObj);
          });

          $scope.onezoneDatepicker = {
            date: date, // MANDATORY
            mondayFirst: false,
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
            startDate: new Date(1989, 1, 26),
            endDate: new Date(2100, 1, 31),
            disablePastDays: false,
            disableSwipe: false,
            disableWeekend: false,
            showDatepicker: true,
            showTodayButton: true,
            calendarMode: true,
            hideCancelButton: true,
            hideSetButton: false,
            highlights: $scope.highlights,
            callback: function(value){
                $scope.filterEvents(value);
            }
          }

          $scope.filterEvents(date);
        }
    });
  }
  else{
    if($scope.stateParams != null){
      $scope.eventList = [];
      $scope.eventsArray = [];
      angular.forEach($scope.stateParams.programs, function(program){
        if(program.eventList.length){
          $log.debug("Got");
          angular.forEach(program.eventList, function(event){
            $scope.eventList.push(event);
          })
        }
        else{
          $log.debug("Not Got")
        }
      });
      $log.debug("$scope.stateParamEvents ", $scope.eventList);
      angular.forEach($scope.eventList, function(event){
        if(event.meal != null){
          var event = {
            eventTitle : event.eventName,
            eventDesc : "",
            eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.endTime , 'h:mm a'),
            meal: event.meal.mealName,
            notes : event.notesToParent
          };
        }
        else{
           var event = {
            eventTitle : event.eventName,
            eventDesc : "",
            eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.endTime , 'h:mm a'),
            meal: null,
            notes : event.notesToParent
          };
        }
        $scope.eventsArray.push(event);
      });

      $log.debug("eventsArray ", $scope.eventsArray);

      var date = new Date();
      $scope.highlights = [];

      angular.forEach($scope.eventsArray, function(event){
        var eventDateSplit = event.eventDate.split('-');
        var highlightObj = {
          date: new Date(eventDateSplit[0],eventDateSplit[1]-1,eventDateSplit[2]),
          color: '#8FD4D9',
          textColor: '#fff'
        };
        $scope.highlights.push(highlightObj);
      });

      $scope.filterEvents(date);

    //  $log.debug("$scope.highlights ", $scope.highlights);
    }
    else{
      $scope.eventsArray = [];
      var programIdArray = [];
      var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
      var studentProgramId = getFavStudent.programSchoolId.toString();
      programIdArray.push(studentProgramId);
      var eventObj = {
        programList : programIdArray
      };
      var APIname = 'cms/l_event';

      calendarService.getStudentEvents(eventObj, APIname).then(function (response1) {
        $log.debug("List Event Response ", response1);
        if(response1.data.list.length > 0){
          $scope.eventList = response1.data.list[0].event_TeacherEventObjList;
          angular.forEach($scope.eventList, function(event){
            if(event.event.meal != null){
              var activity = {
                eventTitle : event.event.eventName,
                eventDesc : "",
                eventDate: $filter('date')(event.event.startTime, 'yyyy-MM-dd'),
                startTime : $filter('date')(event.event.startTime , 'h:mm a'),
                endTime : $filter('date')(event.event.endTime , 'h:mm a'),
                meal: event.event.meal.mealName,
                notes : event.event.notesToParent
              };
            }
            else{
              var activity = {
                eventTitle : event.event.eventName,
                eventDesc : "",
                eventDate: $filter('date')(event.event.startTime, 'yyyy-MM-dd'),
                startTime : $filter('date')(event.event.startTime , 'h:mm a'),
                endTime : $filter('date')(event.event.endTime , 'h:mm a'),
                meal: null,
                notes : event.event.notesToParent
              };
            }
            $scope.eventsArray.push(activity);
          });
        }
        var programActivityObj = {
          orgId : getFavStudent.orgId
        };
        
        var lessonPlanObj = {
          programSchoolId : getFavStudent.programSchoolId.toString(),
          date:null
        }

        var APIname = 'cms/l_activity';
        var APIname2 = 'cms/l_lessonPlan';

        calendarService.getStudentActivities(programActivityObj, APIname).then(function (response) {
          $log.debug("List Activity Response ", response);

          var responseData = response.data;
          $scope.activityList = responseData.list;
          var activityObj = _.filter(responseData.list, {'programSchoolId': getFavStudent.programSchoolId});
          $log.debug("Activity Match ", activityObj);
          if(activityObj.length > 0){
            calendarService.getLessonPlan(lessonPlanObj, APIname2).then(function (response2) {  
              $scope.lessonPlanList = response2.data.list;
              var newDate = $filter('date')(new Date, 'yyyy-MM-dd')
              var splitDate = newDate.split('-');
              var splitYear = splitDate[0];
              var splitMonth = splitDate[1];
              var splitDay = splitDate[2];
              var daysArray = getDaysArray(splitYear, splitMonth);
              $log.debug("daysArray ", daysArray);
              angular.forEach(activityObj[0].activityWithItems, function(activity){
                $log.debug("Activity ", activity)
                var matchDateObj = _.pick(daysArray, [activity.activity.dayOfWeek]);
                $log.debug("matchDateObj ", matchDateObj)

                angular.forEach(matchDateObj[Object.keys(matchDateObj)[0]], function(date){
                  var sAMPM, eAMPM;
                  var startSplitTime = activity.activity.startTime.split(':');
                  if(startSplitTime[0] < 12 && startSplitTime[1] <= 59){
                    sAMPM = 'AM';
                  }
                  else{
                    sAMPM = 'PM';
                  }
                  var endSplitTime = activity.activity.endTime.split(':');
                  if(endSplitTime[0] < 12 && endSplitTime[1] <= 59){
                    eAMPM = 'AM';
                  }
                  else{
                    eAMPM = 'PM';
                  }
                  
                  var checkIfLessonPlanExist = _.filter($scope.lessonPlanList,  function(o) { 
                    return o.lessonPlan.masterActivity.activityId == activity.activity.activityId && o.lessonPlan.lessonPlanDate == date.date; 
                  });

                  var startTime = $filter('date')(activity.activity.startTime);
                  var endTime = $filter('date')(activity.activity.endTime);
                  
                  
                  if(checkIfLessonPlanExist.length){
                    var event = {
                      eventTitle : activity.activity.activityName,
                      eventDesc : "",
                      eventDate: $filter('date')(date.date, 'yyyy-MM-dd'),
                      startTime:  startTime + sAMPM,
                      endTime:  endTime + eAMPM,
    //                  meal: activity.activity.meal.mealName,
                      notes : checkIfLessonPlanExist[0].lessonPlan.notesToParent
                    };
                  }
                  else{
                    var event = {
                      eventTitle : activity.activity.activityName,
                      eventDesc : "",
                      eventDate: $filter('date')(date.date, 'yyyy-MM-dd'),
                      startTime:  startTime + sAMPM,
                      endTime:  endTime + eAMPM,
    //                  meal: activity.activity.meal.mealName,
                      notes : ''
                    };
                  }
                  
                  $scope.eventsArray.push(event);
                });
              });

              $log.debug("eventsArray ", $scope.eventsArray)

              var date = new Date();
              $scope.highlights = [];

              angular.forEach($scope.eventsArray, function(event){
                var eventDateSplit = event.eventDate.split('-');
                var highlightObj = {
                  date: new Date(eventDateSplit[0],eventDateSplit[1]-1,eventDateSplit[2]),
                  color: '#8FD4D9',
                  textColor: '#fff'
                };
                $scope.highlights.push(highlightObj);
              });

              $scope.onezoneDatepicker = {
                date: date, // MANDATORY
                mondayFirst: false,
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                startDate: new Date(1989, 1, 26),
                endDate: new Date(2100, 1, 31),
                disablePastDays: false,
                disableSwipe: false,
                disableWeekend: false,
            //    disableDates: disableDates,
            //    disableDaysOfWeek: disableDaysOfWeek,
                showDatepicker: true,
                showTodayButton: true,
                calendarMode: true,
                hideCancelButton: true,
                hideSetButton: false,
                highlights: $scope.highlights,
                callback: function(value){
                    $scope.filterEvents(value);
                }
              }

              $scope.filterEvents(date);                                                             
            });
          }
        });
      });
    }
  }

  $scope.showDetails = function(event) {
    $scope.eventDetails = event;
    if (event.startTime.indexOf("AM") >= 0){
        var eventTime = event.startTime.split('AM');
    }
    else{
        var eventTime = event.startTime.split('PM');
    }
    var eventDateTime = moment(event.eventDate + ' ' + eventTime[0])
    if(eventDateTime.isSameOrBefore(moment())){
        $scope.showLessonPlan = true;
    }
    else{
         $scope.showLessonPlan = false;
    }
    $ionicModal.fromTemplateUrl('calendar/eventDetails.html', {
      animation: 'slide-in-up',
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.openModal();
    });
  }

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $timeout(function () {
    var previousMonthClick = document.getElementById("previousMonthClick");
    var nextMonthClick = document.getElementById("nextMonthClick");
    var currentMonthNYear = document.getElementById("currentMonthNYear");
    currentMonthNYear.onclick = function () {
      loadMonthClick();
      var openYearModalClick = document.getElementById("openYearModalClick");
      openYearModalClick.onclick = function () {
        loadYearClick();
      }
    }
    nextMonthClick.onclick = function () {
      $log.debug('nextMonthClick triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    };
    previousMonthClick.onclick = function () {
      $log.debug('previousMonthClick triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    };
  }, 500);

  function loadYearClick(){
    $log.debug('loadYearClick triggered');
    var selectYearClick = document.getElementById("selectYearClick");
    selectYearClick.onclick = function () {
      $log.debug('selectYearClick triggered');
      loadMonthClick();
    }
  }

  function loadMonthClick(){
    $log.debug('loadMonthClick triggered');
    var selectMonthClick_0 = document.getElementById("selectMonthClick_0");
    selectMonthClick_0.onclick = function () {
      $log.debug('selectMonthClick_0 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_1 = document.getElementById("selectMonthClick_1");
    selectMonthClick_1.onclick = function () {
      $log.debug('selectMonthClick_1 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_2 = document.getElementById("selectMonthClick_2");
    selectMonthClick_2.onclick = function () {
      $log.debug('selectMonthClick_2 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_3 = document.getElementById("selectMonthClick_3");
    selectMonthClick_3.onclick = function () {
      $log.debug('selectMonthClick_3 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_4 = document.getElementById("selectMonthClick_4");
    selectMonthClick_4.onclick = function () {
      $log.debug('selectMonthClick_4 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_5 = document.getElementById("selectMonthClick_5");
    selectMonthClick_5.onclick = function () {
      $log.debug('selectMonthClick_5 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_6 = document.getElementById("selectMonthClick_6");
    selectMonthClick_6.onclick = function () {
      $log.debug('selectMonthClick_6 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_7 = document.getElementById("selectMonthClick_7");
    selectMonthClick_7.onclick = function () {
      $log.debug('selectMonthClick_7 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_8 = document.getElementById("selectMonthClick_8");
    selectMonthClick_8.onclick = function () {
      $log.debug('selectMonthClick_8 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_9 = document.getElementById("selectMonthClick_9");
    selectMonthClick_9.onclick = function () {
      $log.debug('selectMonthClick_9 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_10 = document.getElementById("selectMonthClick_10");
    selectMonthClick_10.onclick = function () {
      $log.debug('selectMonthClick_10 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
    var selectMonthClick_11 = document.getElementById("selectMonthClick_11");
    selectMonthClick_11.onclick = function () {
      $log.debug('selectMonthClick_11 triggered');
      var currentMonthNYear = document.getElementById("currentMonthNYear");
      $log.debug('currentMonthNYear triggered ', currentMonthNYear.innerHTML);
      var splitDate = currentMonthNYear.innerHTML.split(' ');
      var buildDate = moment().set({'year': splitDate[1], 'month': splitDate[0],'date':'1'})._d;
      $log.debug('buildDate ', buildDate);
      buildActivityList(buildDate)
      var currentMonthNYear = document.getElementById("currentMonthNYear");
    }
  }


  var today = new Date();
  $scope.onezoneDatepicker = {
    date: today, // MANDATORY
    mondayFirst: false,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    startDate: new Date(1989, 1, 26),
    endDate: new Date(2100, 1, 31),
    disablePastDays: false,
    disableSwipe: false,
    disableWeekend: false,
//    disableDates: disableDates,
//    disableDaysOfWeek: disableDaysOfWeek,
    showDatepicker: true,
    showTodayButton: true,
    calendarMode: true,
    hideCancelButton: true,
    hideSetButton: false,
    highlights: $scope.highlights,
    callback: function(value){
        $scope.filterEvents(value);
    }
  }

  var getDaysArray = function(year, month) {
    var finalMonth = month;
    var names = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];
    var date = new Date(year, month-1, 1);
    var result = [];
    while (date.getMonth() == month-1) {
      var dateFormatted = ("0" + date.getDate()).slice(-2);
      var dateObj = {
        date : year+"-"+finalMonth+"-"+dateFormatted,
        day : names[date.getDay()]
      }
        result.push(dateObj);
        date.setDate(date.getDate()+1);
    }
    result = _.groupBy(result, 'day');
    return result;
  }

  function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}

  function buildActivityList(value){
    $scope.eventsArray = [];
    var programIdArray = [];
    angular.forEach($scope.eventList, function(event){
      if(event.event != undefined){
        if(event.event.meal != null){
          var activity = {
            eventTitle : event.event.eventName,
            eventDesc : "Event",
            eventDate: $filter('date')(event.event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.event.endTime , 'h:mm a'),
            meal : event.event.meal.mealName,
            notes : event.event.notesToParent
          };
        }
        else{
          var activity = {
            eventTitle : event.event.eventName,
            eventDesc : "Event",
            eventDate: $filter('date')(event.event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.event.endTime , 'h:mm a'),
            meal : null,
            notes : event.event.notesToParent
          };
        }
      }
      else{
        if(event.meal != null){
          var activity = {
            eventTitle : event.eventName,
            eventDesc : "Event",
            eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.endTime , 'h:mm a'),
            meal : event.meal.mealName,
            notes : event.notesToParent
          };
        }
        else{
           var activity = {
            eventTitle : event.eventName,
            eventDesc : "Event",
            eventDate: $filter('date')(event.startTime, 'yyyy-MM-dd'),
            startTime : $filter('date')(event.startTime , 'h:mm a'),
            endTime : $filter('date')(event.endTime , 'h:mm a'),
            meal : null,
            notes : event.notesToParent
          };
        }
      }
      $scope.eventsArray.push(activity);
    });

    var newDate = $filter('date')(value, 'yyyy-MM-dd')
    $log.debug("test New", newDate);
    var getFavStudent = JSON.parse(localStorage.getItem('favoriteStudentInfo'));
    var studentProgramId = getFavStudent.programSchoolId.toString();
    var activityObj = _.filter($scope.activityList, {'programSchoolId': getFavStudent.programSchoolId});
    $log.debug("Activity Match ", activityObj);
    if(activityObj.length > 0){
      var splitDate = newDate.split('-');
      var splitYear = splitDate[0];
      var splitMonth = splitDate[1];
      var splitDay = splitDate[2];
      var daysArray = getDaysArray(splitYear, splitMonth);
      var newDatepickerDate = new Date(splitYear, splitMonth-1, splitDay);
      $log.debug("daysArray ", daysArray);
      angular.forEach(activityObj[0].activityWithItems, function(activity){
        $log.debug("Activity ", activity)
        var matchDateObj = _.pick(daysArray, [activity.activity.dayOfWeek]);
        $log.debug("matchDateObj ", matchDateObj)

        angular.forEach(matchDateObj[Object.keys(matchDateObj)[0]], function(date){
          var splitTime = activity.activity.startTime.split(':');
          var splitTime2 = activity.activity.endTime.split(':');
          if(splitTime[0] < 12 && splitTime[1] <= 59){
            var AMPM = 'AM'
          }
          else{
            var AMPM = 'PM'
          }
          
          if(splitTime2[0] < 12 && splitTime2[1] <= 59){
            var AMPM2 = 'AM'
          }
          else{
            var AMPM2 = 'PM'
          }

          var startTime = $filter('date')(activity.activity.startTime);
          var endTime = $filter('date')(activity.activity.endTime);
          var event = {
            eventTitle : activity.activity.activityName,
            eventDesc : "",
            eventDate: $filter('date')(date.date, 'yyyy-MM-dd'),
            startTime : startTime + ' ' + AMPM,
            endTime : endTime + ' ' + AMPM2,
            notes : activity.activity.activityNote
          };
          $scope.eventsArray.push(event);
        });
      });

      $log.debug("eventsArray ", $scope.eventsArray)

      $scope.highlights = [];

      angular.forEach($scope.eventsArray, function(event){
        var eventDateSplit = event.eventDate.split('-');
        var highlightObj = {
          date: new Date(eventDateSplit[0],eventDateSplit[1]-1,eventDateSplit[2]),
          color: '#8FD4D9',
          textColor: '#fff'
        };
        $scope.highlights.push(highlightObj);
      });

      $timeout(function(){
        $scope.onezoneDatepicker = {
          date: newDatepickerDate, // MANDATORY
          mondayFirst: false,
          months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
          daysOfTheWeek: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
          startDate: new Date(1989, 1, 26),
          endDate: new Date(2100, 1, 31),
          disablePastDays: false,
          disableSwipe: false,
          disableWeekend: false,
      //    disableDates: disableDates,
      //    disableDaysOfWeek: disableDaysOfWeek,
          showDatepicker: true,
          showTodayButton: true,
          calendarMode: true,
          hideCancelButton: true,
          hideSetButton: false,
          highlights: $scope.highlights,
          callback: function(value){
              $scope.filterEvents(value);
          }
        }
      }, 100);
    }
  }

})