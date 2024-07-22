document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('title').textContent = data.title;
            document.getElementById('description').textContent = data.description;
        })
        .catch(error => console.error('Error loading JSON data:', error));
});
