
export const mapService = {
    connectGoogleApi,
    searchLoc
}

var map;

function connectGoogleApi() {
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

function searchLoc(att) {
    var geocoder = new google.maps.Geocoder
   return geocoder.geocode({ 'address': att }, function (results, status) {
        if (status == 'OK') {
            return results[0].geometry.location.toString()
           
        } else {
            return alert('Geocode was not successful for the following reason: ' + status);
        }
    })


}
