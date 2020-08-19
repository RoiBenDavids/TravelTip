console.log('Main!');

import { locService } from './services/loc.service.js'
import { mapService } from './services/map.service.js'
var gMap;
var gCurPos = {}

function initCurPos() {
    gCurPos.lat = 32.0749831;
    gCurPos.lng = 34.9120554;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams) {
        console.log(urlParams.keys());
        gCurPos.lat = urlParams.get('lat');
        gCurPos.lng = urlParams.get('lng');
        console.log(gCurPos.lat, gCurPos.lng, 'yeah man');
    }

}

locService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    initCurPos();
    initMap(+gCurPos.lat, +gCurPos.lng)
        .then(() => {
            addListeners()
            var locations = locService.getLocations()
            renderTable(locations)
            if (locations) {
                renderMarks(locations)
            }
        })

        .catch(console.log('INIT MAP ERROR'))

    getPosition()
        .then(pos => {

            console.log('User position is:', pos.coords);
        })
        .catch(err => {
            console.log('Cannot get user-position', err);
        })
}

document.querySelector('.btn').addEventListener('click', (ev) => {
    console.log('Aha!', ev.target);
    panTo(35.6895, 139.6917);
})

export function initMap(lat = 32.0749831, lng = 34.9120554) {
    console.log(lat, lng);
    return mapService.connectGoogleApi()
        .then(() => {
            gMap = new google.maps.Map(
                document.querySelector('#map'), {
                center: { lat, lng },
                zoom: 15
            })
        })
}

function addMarker(id, name, loc) {
    console.log(name);
    var marker = new google.maps.Marker({
        position: loc,
        map: gMap,
        label: id + ''
    });
    var infowindow = new google.maps.InfoWindow({
        content: name
    });
    infowindow.open(map, marker);
    return marker.label
    // return marker;
}

function panTo(lat, lng) {
    console.log(lat, lng, 'mylocation');
    var laLatLng = new google.maps.LatLng(lat, lng);
    gMap.panTo(laLatLng);
}

function onGetClickedPos(ev) {
    const elModal = document.querySelector('.location-name-modal')
    elModal.hidden = false;
    gCurPos.lat = ev.latLng.lat();
    gCurPos.lng = ev.latLng.lng();
}

function onSavePos(ev) {
    const elName = document.querySelector('.location-name-input')
    var currClickesPos = locService.createLocation(gCurPos.lat, gCurPos.lng, Date.now(), elName.value);
    console.log(currClickesPos);
    addMarker(currClickesPos.id, elName.value, gCurPos)
    renderTable()
    hideLocationModal()
}


function addListeners() {
    gMap.addListener('click', onGetClickedPos)
    const elModalBtn = document.querySelector('.location-name-modal .save-location')
    elModalBtn.onclick = onSavePos;
    const elModalInput = document.querySelector('.location-name-modal')
    elModalInput.addEventListener('keyup', ev => {
        if (ev.keyCode !== 13) return
        else onSavePos(ev)
    })
    const elCloseModal = document.querySelector('.location-name-modal .close-modal')
    elCloseModal.onclick = hideLocationModal;
    const elSearch = document.querySelector('.search-location button')
    elSearch.addEventListener('click', onSubmitSearch)
    document.querySelector('.location-table').onclick = eventHandler;
    const elCopy = document.querySelector('.copy-location')
    elCopy.addEventListener('click', onCopyLink)
    document.querySelector('.user-location-btn').onclick = getPosition;
}

function eventHandler(ev) {
    if (!ev.target.dataset.id) return;
    const itemId = ev.target.dataset.id;
    if (ev.target.className === 'goto-location') onGotoLocation(itemId)
    else onDeleteLocation(itemId)
}


function onCopyLink() {
    console.log(gCurPos.lat, gCurPos.lng);
    const url = `https://roitheone.github.io/TravelTip/index.html?lat=${gCurPos.lat}&lng=${gCurPos.lng}`
    console.log(url);
}

function onSubmitSearch(ev) {
    ev.preventDefault();
    const elInput = document.querySelector('.search-input')
    searchLoc(elInput.value)
        .then(res => {
            gCurPos.lat = res.geometry.location.lat();
            gCurPos.lng = res.geometry.location.lng();
            panTo(gCurPos.lat, gCurPos.lng)
            elInput.value = ''
            renderLocationName(res.formatted_address)
        })
}
function searchLoc(att) {
    var res;
    var geocoder = new google.maps.Geocoder
    return new Promise((resolve, reject) => {
        geocoder.geocode({ 'address': att }, (results, status) => {
            if (status == 'OK') {
                resolve(results[0])

            } else {
                reject(alert('Geocode was not successful for the following reason: ' + status));
            }
        })
    })
}


function renderTable(locations) {
    var locations = locService.getLocations();
    if (!locations || locations.length === 0) {
        document.querySelector('.location-table').innerHTML = 'No items to display'
        return
    }
    var strHTMLs = locations.map((pos) => {
        return `<li class="flex column">
                    <button class="delete-location" data-id="${pos.id}">X</button>
                    <button class="goto-location" data-id="${pos.id}">Go</button>
                    <h4 class="location-name">${pos.id} - ${pos.name} </h4>
                    <p class="location-position" data-lat="${pos.lat}" data-lng="${pos.lng}" > lat:${pos.lat}, lng:${pos.lng}</p>

                    </li>`
    })
    document.querySelector('.location-table').innerHTML = strHTMLs.join('')
}

function renderMarks(locations) {
    locations.map((pos) => {
        addMarker(pos.id, pos.name, { lat: pos.lat, lng: pos.lng })
    })
}

function hideLocationModal() {
    document.querySelector('.location-name-input').value = ''
    document.querySelector('.location-name-modal').hidden = true;
}

function onDeleteLocation(itemId) {
    locService.deleteLocation(itemId)
    renderTable()
    // const locations = locService.getLocations()
    // renderMarks(locations) // i was trying to delete specipic marker ->cannot do it. just all together or reload page every time
}

function onGotoLocation(itemId) {
    let position = locService.findLocation(itemId)
    panTo(position.lat, position.lng)
}


function renderLocationName(name) {
    document.querySelector('.current-location').innerText = name;
}


function getPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((res) => {
            gCurPos.lat = res.coords.latitude
            gCurPos.lng = res.coords.longitude
            resolve(panTo(gCurPos))
        }, (err) => {
            reject(handleLocationError(err))
        })
    })
}

function handleLocationError(error) {
    var locationError = document.querySelector('.current-location');
    switch (error.code) {
        case 0:
            locationError.innerHTML = "There was an error while retrieving your location: " + error.message;
            break;
        case 1:
            locationError.innerHTML = "The user didn't allow this page to retrieve a location.";
            break;
        case 2:
            locationError.innerHTML = "The browser was unable to determine your location: " + error.message;
            break;
        case 3:
            locationError.innerHTML = "The browser timed out before retrieving the location.";
            break;
    }
}