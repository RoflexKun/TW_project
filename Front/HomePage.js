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
        alert('Login functionality would go here');
    });
    
    document.querySelector('.wishlist').addEventListener('click', function() {
        alert('Wishlist would open here');
    });
});