function drawChart(monthlyData) {
    const ctx = document.getElementById('monthlyStatsChart').getContext('2d');
    const labels = monthlyData.map(item => item.MonthYear);
    const data = monthlyData.map(item => item.ViewerCount);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Viewers',
                data: data,
                backgroundColor: 'rgba(128, 128, 128, 0.5)',
                borderColor: 'rgba(128, 128, 128, 0.5)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function fetchAndDisplayStatistics() {
    fetch('/get-viewer-statistics')
        .then(response => response.json())
        .then(data => {
            // Existing code to display statistics...
            const overallTotal = document.getElementById('overallTotal');
            overallTotal.textContent = `Total viewers: ${data.overallTotal}`;
            // Draw the chart
            drawChart(data.monthlyCounts);
        })
        .catch(error => console.error('Error fetching statistics:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayStatistics();
});