let map;
let currentPage = 1;
let pageSize = 10; // Match backend default
let markers = [];

function initMap() {
    console.log("initMap called");
    map = L.map('map').setView([38, 10], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    loadVisitors(currentPage);
}

function loadVisitors(page) {
    console.log(`Loading visitors for page ${page}`);

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    fetch(`/get-viewer-locations?page=${page}&limit=${pageSize}`)
        .then(response => response.json())
        .then(data => {
            // Handle the new paginated response format
            const locations = data.data;
            const pagination = data.pagination;

            // Add markers to map (data is already sorted by most recent first)
            locations.forEach(location => {
                const marker = L.marker([location.latitude, location.longitude]).addTo(map);
                marker.bindPopup(`<b>Page:</b> ${location.page}<br><b>City:</b> ${location.city}<br><b>Region:</b> ${location.region}<br><b>Country:</b> ${location.country}<br><b>Timestamp:</b> ${new Date(location.timestamp).toLocaleString()}`);
                markers.push(marker);
            });

            // Update pagination controls
            updatePaginationControls(pagination);
        })
        .catch(error => console.error('Fetch error:', error));
}

function updatePaginationControls(pagination) {
    console.log('Pagination data:', pagination);

    const paginationInfo = document.getElementById('paginationInfo');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    // Update pagination info
    paginationInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages} (${pagination.totalCount} visitors from last 3 months)`;

    // Update button states
    prevButton.disabled = !pagination.hasPreviousPage;
    nextButton.disabled = !pagination.hasNextPage;

    // Add visual indication of button states
    prevButton.style.backgroundColor = pagination.hasPreviousPage ? '#007cba' : '#ccc';
    nextButton.style.backgroundColor = pagination.hasNextPage ? '#007cba' : '#ccc';

    // Update current page
    currentPage = pagination.currentPage;

    console.log(`Updated to page ${currentPage}, prev: ${pagination.hasPreviousPage}, next: ${pagination.hasNextPage}`);
}

function goToPreviousPage() {
    console.log(`Going to previous page. Current: ${currentPage}`);
    if (currentPage > 1) {
        loadVisitors(currentPage - 1);
    } else {
        console.log('Already on first page');
    }
}

function goToNextPage() {
    console.log(`Going to next page. Current: ${currentPage}`);
    loadVisitors(currentPage + 1);
}

function changePageSize() {
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    pageSize = parseInt(pageSizeSelect.value);
    console.log(`Changed page size to: ${pageSize}`);

    // Reset to first page when changing page size
    currentPage = 1;
    loadVisitors(currentPage);
}

document.addEventListener('DOMContentLoaded', initMap);