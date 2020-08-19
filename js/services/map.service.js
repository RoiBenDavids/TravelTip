

var gLocations = [];
export const mapService = {
    initMap,
    addMarker,
    panTo
}

var map;
var gCreatedAt;
var gLatLngPos;

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log('InitMap');
    return _connectGoogleApi()
        .then(() => {
            console.log('google available');
            map = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
            console.log('Map!', map);
            map.addListener('click', (ev) => {
                gCreatedAt = Date.now();
                console.log(ev.latLng.lat(), ev.latLng.lng());
                var infoWindow = new google.maps.InfoWindow({ position: ev.latLng });
                infoWindow.setContent(ev.latLng.toString());
                infoWindow.open(map)
                const elModal = document.querySelector('.location-name-modal')
                elModal.hidden = false;
                gLatLngPos = ev.latLng;
                elModal.querySelector('button').addEventListener('click', function () {
                    console.log(gLatLngPos, gCreatedAt);
                    const name = document.querySelector('.location-name-input').value
                    createLocation(gLatLngPos.lat(), gLatLngPos.lng(), gCreatedAt, name)
                })
            })
        })
}

function addMarker(loc) {
    var marker = new google.maps.Marker({
        position: loc,
        map: map,
        title: 'Hello World!'
    });
    return marker;
}

function panTo(lat, lng) {
    var laLatLng = new google.maps.LatLng(lat, lng);
    map.panTo(laLatLng);
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()
    const API_KEY = ''; //TODO: Enter your API Key
    var elGoogleApi = document.createElement('script');
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAyh-e95qHw8jDLgKt_1m9eT34jQG665jU`;
    elGoogleApi.async = true;
    document.body.append(elGoogleApi);

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve;
        elGoogleApi.onerror = () => reject('Google script failed to load')
    })
}

function createLocation(lat, lng, createdAt, name) {
    const location = {
        lat,
        lng,
        createdAt,
        name
    }
    gLocations.push(location)
    console.log(gLocations);
}

