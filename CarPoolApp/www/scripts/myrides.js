﻿var app = angular.module('myApp1', []);

app.controller('myRideCtrl', function ($scope, $http, $window) {
    document.getElementById("Loading").style.display = "block";
    navigationLinks($scope, $http, $window);

    $scope.rideId = "";
    $scope.rides = [];
    var userid = localStorage.getItem("userid");
    $scope.userName = localStorage.getItem("username");
    //var userid = "011251e3-a03d-60ad-a981-973b0bc60253";
    $scope.iserror = true;
    $scope.success = false;
    getAllRideDetails($scope, $http, userid);
    $scope.cancel = function (rideId) {
        document.getElementById("Loading").style.display = "block";
        $http.post("http://wiprocarpoolwin.azurewebsites.net/cancelride", { id: localStorage.getItem("userid"), rideid: rideId })
       .success(function (response) {
           getAllRideDetails($scope, $http, localStorage.getItem("userid"));
           document.getElementById("Loading").style.display = "none";
           //alert(rideId + " has been cancelled");
           $scope.iserror = true;
           $scope.success = true;
       })
       .error(function (data, status) {
           document.getElementById("Loading").style.display = "none";
           //alert('failed');
           //$scope.iserror = false;
           //$scope.success = false;
       });
    }
    $scope.getDetails = function (rideId) {
        localStorage.setItem("currentRideId", rideId);
        window.location.href = "MarkerContainer.html?rideid=" + rideId;
    }
    $scope.newRide = function () {
        window.location.href = "MarkerContainer.html";
    }
});

function getAllRideDetails($scope, $http, userid) {
    document.getElementById("Loading").style.display = "block";
    // rnd datetime is to disable cache
    $http.get("http://wiprocarpoolwin.azurewebsites.net/getallridedetails/" + userid + "?rnd=" + new Date().getTime())
    .success(function (response) {
        $scope.rides = response[0].rides;
        document.getElementById("Loading").style.display = "none";
    })
    .error(function (data, status) {
        document.getElementById("Loading").style.display = "none";
    });
}
function navigationLinks($scope, $http, $window) {

    var isowner = window.localStorage.getItem("isowner");

    if (isowner == "true") {
        $("#carownerShow").show();
        $("#passangerShow").hide();
        $("#carownerShow2").show();
        $("#passangerShow2").hide();
    }
    else {
        $("#passangerShow").show();
        $("#carownerShow").hide();
        $("#passangerShow2").show();
        $("#carownerShow2").hide();
    }

    $scope.MyDashboard = function () {
        //alert("kuhuh");
        window.location.href = "NewDashboard.html";
    }

    $scope.MyNotifications = function () {

        var isowner = window.localStorage.getItem("isowner");
        var notificationurl = '';
        if (isowner == "true")
            notificationurl = "ownernotification.html";
        else
            notificationurl = "usernotification.html";

        window.location.href = notificationurl;
    }

    $scope.ShareRide = function () {

        window.location.href = "addmarker.html";
    }

    $scope.MyRides = function () {

        window.location.href = "myrides.html";
    }

    $scope.JoinRide = function () {

        window.location.href = "ride.html";
    }

    $scope.logOut = function () {
        window.localStorage.setItem("userid", 0);
        window.location.href = 'index.html';
    }
}

app.controller('myRideDetailsCtrl', function ($scope, $http, $window) {
    navigationLinks($scope, $http, $window);
    $scope.rideId = "";
    if (getUrlParameter('rideid') !== undefined) {
        $scope.rideId = getUrlParameter('rideid');
        var rideJSON = localStorage.getItem("currentRideObject");
        var rideObject = JSON.parse(rideJSON);
        $scope.seats = rideObject.seatsavailable;
        $scope.date.startdate = new Date(rideObject.startdatetime);
        $scope.date.enddate = new Date(rideObject.enddatetime);
    }
    $scope.date = {
        startdate: new Date(),
        enddate: new Date()
    }
    $scope.updateRide = function () {
        var rideJSON = localStorage.getItem("currentRideObject");
        var rideObject = JSON.parse(rideJSON);
        rideObject.seatsavailable = $scope.seats;
        //rideObject.startdatetime = "2015-12-24"; //JSON.parse(JSON.stringify($scope.date.startdate));
        // rideObject.enddatetime = "2015-12-24"; //JSON.parse(JSON.stringify($scope.date.enddate));

        rideObject.startdatetime = formatDate();
        rideObject.enddatetime = formatDate();
        //console.log(rideObject.startdatetime);
        $scope.iserror = true;
        $scope.success = false;
        //alert(JSON.stringify(rideObject));

        $http.post("http://wiprocarpoolwin.azurewebsites.net/updateroute/", { userid: localStorage.getItem("userid"), ride: rideObject })
       .success(function (response) {
           $http.post("http://wiprocarpoolwin.azurewebsites.net/updatecarlocation/", {
               userid: localStorage.getItem("userid"), currgeolocnaddress: rideObject.startpoint, currgeolocnlat: rideObject.startlat, currgeolocnlong: rideObject.startlng
           })

           $scope.iserror = true;
           $scope.success = true;
           window.location.href = 'myrides.html';
       })
       .error(function (data, status) {
           //$scope.iserror = false;
           //$scope.success = false;
           //alert('failed');
       });
    }
});


function GetStartDate() {
    return (new Date()).toString();
}
function GetEndDate() {
    return (new Date()).toString();

}
function formatDate() {
    var d = new Date(),
        month = '-' + (d.getMonth() + 1),
        day = '-' + d.getDate(),
        year = d.getFullYear();

    var strDate = year + month + day;

    //2015-12-24

    return strDate;
}

