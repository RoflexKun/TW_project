document.addEventListener('DOMContentLoaded', function() {
    // Toggle dropdown menu when "All about pets" button is clicked
    const petsButton = document.querySelector('.pets-button-container');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const arrowIcon = document.querySelector('.arrow-icon');
    
    petsButton.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        arrowIcon.classList.toggle('active');
        
        // Log for debugging
        console.log("Dropdown clicked, active status:", dropdownMenu.classList.contains('active'));
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (!petsButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
            arrowIcon.classList.remove('active');
        }
    });
    
    // Prevent dropdown from closing when clicking inside
    dropdownMenu.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Category click handlers
    document.querySelectorAll('.dropdown-category').forEach(category => {
        category.addEventListener('click', function() {
            alert('You selected: ' + this.textContent);
            dropdownMenu.classList.remove('active');
            arrowIcon.classList.remove('active');
        });
    });
    
    // Other button handlers
    document.querySelector('.login-button').addEventListener('click', function() {
        // Place holder
        alert('Login functionality would go here');
    });
    
    document.querySelector('.wishlist').addEventListener('click', function() {
        // Place holder
        alert('Wishlist would open here');
    });

    // Pet filter functionality
const searchButton = document.getElementById('search-button');
if (searchButton) {
    searchButton.addEventListener('click', function() {
        // Get filter values
        const species = document.getElementById('species-select').value;
        const breed = document.getElementById('breed-select').value;
        const age = document.getElementById('age-select').value;
        const size = document.getElementById('size-select').value;
        const gender = document.getElementById('gender-select').value;
        const goodWith = document.getElementById('good-with-select').value;
        const coatLength = document.getElementById('coat-select').value;
        
        const filterSummary = `
            Selected Filters:
            - Species : ${species || 'Any'}
            - Breed: ${breed || 'Any'}
            - Age: ${age || 'Any'}
            - Size: ${size || 'Any'}
            - Gender: ${gender || 'Any'}
            - Good With: ${goodWith || 'Any'}
            - Coat Length: ${coatLength || 'Any'}
        `;
        
        // Place holder
        alert(filterSummary);
        
        // Place holder
        console.log('Search filters applied:', {
            breed, age, size, gender, goodWith, coatLength
        });
    });
}
});
