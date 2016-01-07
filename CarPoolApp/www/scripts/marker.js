
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
var directionsService;
var rideId;
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
var userId;
var position;

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

   
    function intilize() {
        if (rideId === undefined) {
            getLocation();
        }
        else {
            var request = {
                name: "getridedetails",
                type: "GET",
                contentType: "application/json",
                url: "http://wiprocarpool.azurewebsites.net/getridedetails/" + userId + "/" + rideId,
                dataType: "json"
            }

            CORSMsg.SendMsg(JSON.stringify(request), window.parent);
        }
        
        directionsService = new google.maps.DirectionsService();

        var autocompleteStart = new google.maps.places.Autocomplete(document.getElementById("txtDestination"));
        $("#btnRoute").click(function () {
            
            var mode = google.maps.DirectionsTravelMode.DRIVING;
            var request = {
                origin: geoLocation,
                destination: endLocation,
                waypoints: waypoints,
                travelMode: mode,
                optimizeWaypoints: true,
                avoidHighways: false
            };

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    clearMarkers();
                    directionsDisplay.setDirections(response);
                }
            });
        });
        $("#btnReset").click(function () {
            clearMarkers();
            clearWaypoints();
            directionsDisplay.setMap(null);
            directionsDisplay.setPanel(null);
            directionsDisplay = new google.maps.DirectionsRenderer();
            directionsDisplay.setMap(map);
            addMarker(geoLocation, map);
            addMarker(endLocation, map);
        });
        $("#btnSubmit").click(function () {
            
            $(detailedWayPoints).each(function (index, waypoint) {
                waypoint.boardingid = index + 1;                
            });
            
            ride.startlat = geoLocation.lat();
            ride.startlng = geoLocation.lng();
            ride.endlat = endLocation.lat();
            ride.endlng = endLocation.lng();
            ride.boardingpoints = detailedWayPoints;            

            if (rideId === undefined) {
                ride.startpoint = geoLocationName;              
                ride.endpoint = $("#txtDestination").val();               
            }
            else {
                ride.rideid = currentRideObject.rideid;
                ride.startpoint = currentRideObject.startpoint;
                ride.endpoint = currentRideObject.endpoint;
            }

            var request = {
                name: "currentRideObject",
                ride: ride
            }

            CORSMsg.SendMsg(JSON.stringify(request), window.parent);
        });

        google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
            clearMarkers();
            clearWaypoints();
            var endPlace = autocompleteStart.getPlace();
            var Lat = endPlace.geometry.location.lat();
            var Long = endPlace.geometry.location.lng();
            endLocation = new google.maps.LatLng(Lat, Long);           

            var latlngbounds = new google.maps.LatLngBounds();

            latlngbounds.extend(geoLocation);
            latlngbounds.extend(endLocation);

            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);

            google.maps.event.addListener(map, 'click', function (event) {
                var latLong = event.latLng;
                var geocoder = new google.maps.Geocoder;
                waypoints.push({ location: latLong, stopover: true });
                addMarker(latLong, map);
                geocoder.geocode({ 'location': latLong }, function (results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        if (results[1]) {
                            var addressObject = { boardingid: null, address: null, lat: null, lng: null };
                            addressObject.address = results[1].formatted_address;
                            addressObject.lat = latLong.lat();
                            addressObject.lng = latLong.lng();
                            detailedWayPoints.push(addressObject);
                        }
                    }
                });
            });
            addMarker(geoLocation, map);
            addMarker(endLocation, map);
        });
    }

    function getLocation() {

        directionsDisplay = new google.maps.DirectionsRenderer();
        var geocoder = new google.maps.Geocoder;

        geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        geocoder.geocode({ 'location': geoLocation }, function (results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                    geoLocationName = results[1].formatted_address;
                }
            }
        });
        map = new google.maps.Map(document.getElementById('map'), {
            center: geoLocation,
            scrollwheel: true,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            draggableCursor: "pointer",
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
            }
        });
        directionsDisplay.setMap(map);
    }
   
    function addMarker(latlng, map1) {
        markers.push(new google.maps.Marker({
            position: latlng,
            map: map1,
            icon: "http://maps.google.com/mapfiles/marker" + String.fromCharCode(markers.length + 65) + ".png"
        }));
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    function clearWaypoints() {
        markers = [];
        waypoints = [];
        detailedWayPoints = [];
    }

    function getLocationByRideId(rideObject) {
        directionsService = new google.maps.DirectionsService();
        directionsDisplay = new google.maps.DirectionsRenderer();
        detailedWayPoints = rideObject.boardingpoints;

        geoLocation = new google.maps.LatLng(rideObject.startlat, rideObject.startlng);
        endLocation = new google.maps.LatLng(rideObject.endlat, rideObject.endlng);
        map = new google.maps.Map(document.getElementById('map'), {
            center: geoLocation,
            scrollwheel: true,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            draggableCursor: "pointer",
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
            }
        });
        directionsDisplay.setMap(map);

        var startLatLng = new google.maps.LatLng(rideObject.startlat, rideObject.startlng);
        var endLatLng = new google.maps.LatLng(rideObject.endlat, rideObject.endlng);

        $(rideObject.boardingpoints).each(function (index, object) {
            waypoints.push({ location: new google.maps.LatLng(object.lat, object.lng), stopover: true });
        });        

        var mode = google.maps.DirectionsTravelMode.DRIVING;
        var request = {
            origin: startLatLng,
            destination: endLatLng,
            waypoints: waypoints,
            travelMode: mode,
            optimizeWaypoints: true,
            avoidHighways: false
        };

        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                clearMarkers();
                directionsDisplay.setDirections(response);
            }
        });
    }

    CORSMsg.ReceiveMsg(function (jData) {
        var response = JSON.parse(jData.data);

        switch (response.name) {
            case "position":
                position = response.value.pos;
                userId = response.value.userId;
                rideId = response.value.rideId;
                loadMapsApi();
                break;
            case "getridedetails_response": currentRideObject = response.value[0];
                getLocationByRideId(response.value[0]);
                break;
            default: break;
        }

    }, false);