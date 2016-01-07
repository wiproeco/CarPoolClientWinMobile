
var position;
var userId;
var markers = [];
var waypoints = [];
var geoLat = 17.4258143;
var geoLong = 78.34054739999999;
var map;
var geoLocation;
var startLocation;
var service = {
    locations: [],
    pickuplocations: [],
    user: []
};
var nearVehicles = [];
var rideObject = null;
var carOwnerId = null;

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
            var directionsService = new google.maps.DirectionsService();
            geoLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var autocompleteStart = new google.maps.places.Autocomplete(document.getElementById("txtDestination"));

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

            var currentlocation = new google.maps.Marker({
                position: geoLocation,
                map: map,
            })

            google.maps.event.addListener(autocompleteStart, 'place_changed', function () {
                clearMarkers();
                var searchLocation = autocompleteStart.getPlace();

                var request = {
                    name: "searchrides",
                    type: "GET",
                    contentType: "application/json",
                    url: "http://wiprocarpool.azurewebsites.net/searchrides/" + searchLocation.vicinity,
                    dataType: "json"
                }

                CORSMsg.SendMsg(JSON.stringify(request), window.parent);

          });
               

            $("#btnJoinRide").click(function () {
                var reqforcurrgeolocnvalue = "";

                if (document.getElementById("chkreqforcurrgeolocn").checked)
                    reqforcurrgeolocnvalue = true;
                else
                    reqforcurrgeolocnvalue = false;

            var request = {
                name: "joinride",
                type: "POST",
                contentType: "application/json",
                url: "http://wiprocarpool.azurewebsites.net/joinride/",
                data: JSON.stringify({ carownerId: carOwnerId, userId: userId, rideid: rideObject.rideid, boardingid: $("#ddlPickuppoints").val(), reqforcurrgeolocn: reqforcurrgeolocnvalue }),
                dataType: "json"
            }

            CORSMsg.SendMsg(JSON.stringify(request), window.parent);

        });

    }

    function DisplaySearchResponse(data) {
        var latlngbounds = new google.maps.LatLngBounds();
        $(data).each(function (index, obj) {
            var vehicleLatLng = new google.maps.LatLng(obj.lat, obj.lng);
            var querystring = obj.id + "/" + obj.rideid;
            addMarker(vehicleLatLng, map, querystring);
            latlngbounds.extend(vehicleLatLng);
        });
        latlngbounds.extend(geoLocation);
        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);

        var directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap(map);
    }

    function addMarker(latlng, map1, docId) {
        var marker = new google.maps.Marker({
            position: latlng,
            map: map1
            //icon: "/images/car-image.png"
            //title: docId
        });
        marker.setTitle(docId);
        marker.addListener('click', function () {            
            var position = marker.getPosition();
            var docId = marker.getTitle();
            carOwnerId = docId.split("/")[0];

            var request = {
                name: "getridedetails",
                type: "GET",
                contentType: "application/json",
                url: "http://wiprocarpool.azurewebsites.net/getridedetails/" + docId,
                dataType: "json"
            }

            CORSMsg.SendMsg(JSON.stringify(request), window.parent);
        });
        markers.push(marker);
    }

    function GetOwnerResponse(response)
    {
        $("#ddlPickuppoints").html("");
        var data = response.value[0];
        rideObject = response.value[0];
        $("#carmodal").modal("toggle");
        $("#carOwner").text(response.value[0].userName);
        $("#carNumber").text(response.value[0].carNo);
        $("#carSeatsCount").text(response.value[0].seatsavailable);
        $("#carFrom").text(response.value[0].startpoint);
        $("#carTo").text(response.value[0].endpoint);
        $(data.boardingpoints).each(function (index, obj) {
            var option = $("<option></option>");
            option.attr("value", obj.boardingid).text(obj.address);
            $("#ddlPickuppoints").append(option);
        });
    }

    function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    }

    CORSMsg.ReceiveMsg(function (jData) {
        var response = JSON.parse(jData.data);

        switch(response.name)
        {
            case "position":
                position = response.value.pos;
                userId = response.value.userId;
                loadMapsApi();
                break;
            case "searchrides_response": DisplaySearchResponse(response.value);
                break;
            case "getridedetails_response": GetOwnerResponse(response);
                break;
            default: break;
        }

    }, false);

