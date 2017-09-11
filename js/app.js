//Neighborhood map project//
//by Oleksii Babenko, August 21, 2017//

var initialLocations = [{
        name: 'Royal Ontario Museum',
        lat: 43.668493,
        long: -79.394031
    },
    {
        name: 'Casa Loma',
        lat: 43.678066,
        long: -79.409426
    },
    {
        name: 'Hockey Hall of Fame',
        lat: 43.646970,
        long: -79.377408
    },
    {
        name: 'University of Toronto',
        lat: 43.660851,
        long: -79.395783
    },
    {
        name: 'Mackenzie House',
        lat: 43.655666,
        long: -79.378449
    },
    {
        name: 'Textile Museum of Canada',
        lat: 43.654587,
        long: -79.386656
    },
    {
        name: 'Bata Shoe Museum',
        lat: 43.667214,
        long: -79.400119
    },
    {
        name: 'Art Gallery of Ontario',
        lat: 43.653536,
        long: -79.392485
    }
];


var map;

var Location = function(data) {
    var self = this;
    this.name = data.name;
    this.lat = data.lat;
    this.long = data.long;
    this.URL = "";
    this.visible = ko.observable(true);
    this.infoWindow = new google.maps.InfoWindow();

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(self.lat, self.long),
        map: map,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        title: self.name

    });

    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name + '&imlimit=5&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function() {
        this.infowindow.setContent("failed to get wikipedia resources");
    }, 8000);
    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(data) {

            var articleUrl = data[3][0];
            var articleDescr = data[2][0];

            if (articleUrl !== undefined) {
                self.contentString = '<div><strong>' + self.name + '</strong><p>' + articleDescr + '</p></div>';

            } else {
                self.contentString = '<div>' + self.name + '<p>There is no article about this museum on WIKIPEDIA. Sorry!</p></div>';

            }
            clearTimeout(wikiRequestTimeout);
        },
        error: function() {
            self.contentString = '<div>' + self.name + '<p> It looks like we can not find any content on WIKIPEDIA. Sorry!</p></div>';
            alert("AJAX ERROR HANDLING!!");
        }
    });

    google.maps.event.addListener(map, 'click', function() {
        self.infowindow.open();
        self.infowindow.setMarker = null;
    });


    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });
    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });

    this.marker.addListener('click', function() {
        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 1400);
    });


    function fitBounds() {
        var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < initialLocations.length; i++) {
            self.marker.setMap(map);
            bounds.extend(data.lat, data.long);
        }
        map.fitBounds(bounds);
    }

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }
    var defaultIcon = makeMarkerIcon('CD5C5C');
    var highlightedIcon = makeMarkerIcon('FFFF24');


    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function MyViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 43.662892,
            lng: -79.395656
        },
        zoom: 14,
        mapTypeControl: false
    });
    /*var bounds = new google.maps.LatLngBounds();*/
    google.maps.event.addDomListener(window, 'resize', function() {
        var bounds;
        map.setCenter({
            lat: 43.662892,
            lng: -79.395656
        });
        map.fitBounds(bounds);
    });

    initialLocations.forEach(function(locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function() {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function(locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

}

function startApp() {
    ko.applyBindings(new MyViewModel());
}

function errorHandling() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}