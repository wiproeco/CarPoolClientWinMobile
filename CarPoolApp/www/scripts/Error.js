﻿/// <reference path="angular.min.js" />


var Errorlog = function ($http, request, isrender) {

    $http.post("http://localhost:1513/getLoghandler/", request)
            .success(function (res) {
                console.log(res);
                if (isrender == true) {
                    $("#errordiv").show();
                    $("#errormsg").show();
                    $("#errormsg").html("Oops something went wrong. Please try again or refresh the page");
                } else {
                    $("#errordiv").show();
                    $("#errormsg").show();
                    $("#errormsg").html("Login failed 3 times. Contact adminstration");
                }
            });

}

