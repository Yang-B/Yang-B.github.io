function initMap() {
  console.log("initMap called");
  var map = L.map('map').setView([38, 10], 3);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  console.log("Making fetch request");
  fetch('/get-viewer-locations')
    .then(response => response.json())
    .then(locations => {
        locations.forEach(location => {
            L.marker([location.latitude, location.longitude]).addTo(map)
                .bindPopup(`<b>Page:</b> ${location.page}<br><b>City:</b> ${location.city}<br><b>Region:</b> ${location.region}<br><b>Country:</b> ${location.country}<br><b>Timestamp:</b> ${location.timestamp}`);
        });
    })
    .catch(error => console.error('Fetch error:', error));
}

document.addEventListener('DOMContentLoaded', initMap);