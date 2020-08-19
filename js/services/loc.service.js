import { storageService } from './storage.service.js'


export const locService = {
    getLocs: getLocs,
    getPosition: getPosition,
    createLocation,
    getLocations
}

const KEY = 'LOCATIONS';
var gNextId = 100;

var gLocations = [];
var locs = [{ lat: 11.22, lng: 22.11 }]

function getLocs() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(locs);
        }, 2000)
    });
}


function getPosition() {
    console.log('Getting Pos');

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
    })
}

function createLocation(lat, lng, createdAt, name) {
    const location = {
        id: gNextId++,
        lat,
        lng,
        createdAt,
        name
    }
    gLocations.push(location)
    storageService.saveToStorage(KEY, gLocations)
}

function getLocations() {
    return gLocations;
}