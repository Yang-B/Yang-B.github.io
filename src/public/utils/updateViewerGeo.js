function updateGeoLocationData(pageKey) {
    // Construct the URL with the pageKey parameter
    const url = `/get-location/${pageKey}`;
  
    fetch(url)
      .then(response => response.json())
      .then(data => {
        document.getElementById('city').textContent = data.city || 'N/A';
        document.getElementById('region').textContent = data.region || 'N/A';
        document.getElementById('country').textContent = data.country || 'N/A';
        const coordinates = data.loc ? data.loc.split(',') : ['N/A', 'N/A'];
        document.getElementById('coordinates').textContent = `${coordinates[0]}, ${coordinates[1]}`;
      })
      .catch(error => {
        console.error('Error fetching location:', error);
        document.getElementById('city').textContent = 'N/A';
        document.getElementById('region').textContent = 'N/A';
        document.getElementById('country').textContent = 'N/A';
        document.getElementById('coordinates').textContent = 'N/A';
      });
  }