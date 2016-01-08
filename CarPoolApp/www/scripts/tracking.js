

    function loadMapsApi() {
        var viewport = {
            width: $(window).width(),
            height: $(window).height()
        };

        $("#map").css("width", viewport.width);
        $("#map").css("height", viewport.height);
        //TODO: Add your own Google maps API key to the URL below. 
        $.getScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyCZmYWHb3GXK-Z-yrmowHMJLfjfl-VytI0&sensor=true&libraries=places&callback=intilize');
    };


    var markers = [];
    var waypoints = [];
    var detailedWayPoints = [];
    var geoLat = 17.4258143;
    var geoLong = 78.34054739999999;
    var geoLocationName = null;
    var map;
    var endLocation;
    var startLocation;
    var geoLocation;
    var directionsDisplay;
    var ownerId;
    var currentRideObject = null;
    var ride = {
        rideid: null,
        startpoint: null,
        startlat: null,
        startlng: null,
        endpoint: null,
        endlat: null,
        endlng: null,
        startdatetime: null,
        enddatetime: null,
        seatsavailable: null,
        ridestatus: "open",
        isfavouiteride: true,
        boardingpoints: [],
        passengers: []
    };

    var myCenter;

    function intilize() {

        var address="";
        var latitude = "";
        var longitude = "";

        if (ownerId != undefined) {
            var request = {
                name: "getuserdetails",
                type: "GET",
                contentType: "application/json",
                url: "http://wiprocarpoolwin.azurewebsites.net/getuserdetails/" + ownerId,
                dataType: "json"
            }

            CORSMsg.SendMsg(JSON.stringify(request), window.parent);
        }
       
    }

    function GetUserDetailsResponse(data)
    {
        address = data.currgeolocnaddress;
        latitude = data.currgeolocnlat;
        longitude = data.currgeolocnlong;
        myCenter = new google.maps.LatLng(latitude, longitude);

        directionsDisplay = new google.maps.DirectionsRenderer();

        var mapProp = {
            center: myCenter,
            zoom: 13,
            scrollwheel: true,
            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.VERTICAL_BAR,
                position: google.maps.ControlPosition.RIGHT_CENTER
            },
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            },
            streetViewControl: false,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_TOP
            },
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapProp);
        placeMarker(myCenter, map);
        directionsDisplay.setMap(map);
    }

    function placeMarker(myCenter, map) {
        var marker = new google.maps.Marker({
            position: myCenter,
            map: map,
        });
    }

    CORSMsg.ReceiveMsg(function (jData) {
        var response = JSON.parse(jData.data);

        switch (response.name) {
            case "ownerid":
                ownerId = response.value;
                //userId = response.value.userId;
                loadMapsApi();
                break;
            case "getuserdetails_response": GetUserDetailsResponse(response.value[0]);
                break;
            default: break;
        }

    }, false);

