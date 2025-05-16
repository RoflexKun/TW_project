document.addEventListener('DOMContentLoaded', function () {

    // Toggle dropdown menu
    const petsButton = document.querySelector('.pets-button-container');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const arrowIcon = document.querySelector('.arrow-icon');

    petsButton.addEventListener('click', function (event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        arrowIcon.classList.toggle('active');
        console.log("Dropdown clicked, active status:", dropdownMenu.classList.contains('active'));
    });

    // Close dropdown
    document.addEventListener('click', function (event) {
        if (!petsButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.remove('active');
            arrowIcon.classList.remove('active');
        }
    });

    // Prevent dropdown from closing when clicking inside
    dropdownMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    // Category click handlers
    document.querySelectorAll('.dropdown-category').forEach(category => {
        category.addEventListener('click', function () {
            // Actions to be added
        });
    });

    // Login button handler
    document.querySelector('.login-button').addEventListener('click', function () {
        // Actions to be added
    });

    // Wishlist button handler
    document.querySelector('.wishlist').addEventListener('click', function () {
        // Actions to be added
    });

    // Species and breed filters
    const speciesSelect = document.getElementById('species-select');
    const breedSelect = document.getElementById('breed-select');

    // Different breeds for each species
    const breedsBySpecies = {
        "": [{ value: "", text: "Any" }], // For all species
        "dog": [
            { value: "", text: "Any" },
            { value: "golden-retriever", text: "Golden Retriever" },
            { value: "german-shepherd", text: "German Shepherd" },
            { value: "labrador-retriever", text: "Labrador Retriever" },
            { value: "beagle", text: "Beagle" },
            { value: "bulldog", text: "Bulldog" },
            { value: "poodle", text: "Poodle" },
            { value: "rottweiler", text: "Rottweiler" }
        ],
        "cat": [
            { value: "", text: "Any" },
            { value: "persian", text: "Persian" },
            { value: "maine-coon", text: "Maine Coon" },
            { value: "siamese", text: "Siamese" },
            { value: "ragdoll", text: "Ragdoll" },
            { value: "british-shorthair", text: "British Shorthair" },
            { value: "bengal", text: "Bengal" }
        ],
        "rabbit": [
            { value: "", text: "Any" },
            { value: "holland-lop", text: "Holland Lop" },
            { value: "mini-rex", text: "Mini Rex" },
            { value: "dutch", text: "Dutch" },
            { value: "lionhead", text: "Lionhead" }
        ],
        "dinosaur": [
            { value: "", text: "Any" },
            { value: "coleophysis_bauri", text: "Coleophysis bauri" },
            { value: "plateosaurus_engelhardti", text: "Plateosaurus engelhardti" },
            { value: "allosaurus_fragilis", text: "Allosaurus fragilis" },
            { value: "apatosaurus_excelsus", text: "Apatosaurus excelsus" }
        ]
    };

    // Update breed options based on selected species
    function updateBreedOptions(selectedSpecies) {
        breedSelect.innerHTML = '';

        const breeds = breedsBySpecies[selectedSpecies] || breedsBySpecies[""];

        // Create breed options for selected species
        breeds.forEach(breed => {
            const option = document.createElement('option');
            option.value = breed.value;
            option.textContent = breed.text;
            breedSelect.appendChild(option);
        });

        if (selectedSpecies == "") {
            breedSelect.disabled = true;
        }
        else {
            breedSelect.disabled = false;
        }
    }

    updateBreedOptions(speciesSelect.value);

    // Event listener for species change
    speciesSelect.addEventListener('change', function () {
        updateBreedOptions(this.value);
    });

    // Location functionality //
    const citiesByCountry = {
        "": [],
        "us": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"],
        "ca": ["Toronto", "Montreal", "Vancouver", "Calgary", "Ottawa", "Edmonton"],
        "uk": ["London", "Manchester", "Birmingham", "Glasgow", "Liverpool", "Edinburgh"],
        "au": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"],
        "ro": ["Bucharest", "Cluj-Napoca", "Timisoara", "Iasi", "Constansa", "Craiova"]
    };

    const countrySelect = document.getElementById('country-select');
    const citySelect = document.getElementById('city-select');

    function updateCityOptions(selectedCountry) {

        citySelect.innerHTML = '<option value="">Select City</option>';

        // Add "Any" option
        if (selectedCountry !== "") {
            const anyOption = document.createElement('option');
            anyOption.value = "any";
            anyOption.textContent = "Any (Whole Country)";
            citySelect.appendChild(anyOption);
        }

        // Get cities for selected country
        const cities = citiesByCountry[selectedCountry] || [];

        // Add city options
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.toLowerCase().replace(/\s+/g, '-');
            option.textContent = city;
            citySelect.appendChild(option);
        });

        // Enable/disable the city select
        if (selectedCountry === "") {
            citySelect.disabled = true;
        }
        else {
            citySelect.disabled = false;
        }
    }

    updateCityOptions(countrySelect.value);

    countrySelect.addEventListener('change', function () {
        updateCityOptions(this.value);

        // Reset city selection
        citySelect.value = "";
    });

    // Search button functionality
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            // Get filter values
            const species = document.getElementById('species-select').value;
            const breed = document.getElementById('breed-select').value;
            const age = document.getElementById('age-select').value;
            const size = document.getElementById('size-select').value;
            const gender = document.getElementById('gender-select').value;
            const goodWith = document.getElementById('good-with-select').value;
            const coatLength = document.getElementById('coat-select').value;
            const country = document.getElementById('country-select').value;
            const city = document.getElementById('city-select').value;

            const filterSummary = `
                Selected Filters:
                - Species: ${species || 'Any'}
                - Breed: ${breed || 'Any'}
                - Age: ${age || 'Any'}
                - Size: ${size || 'Any'}
                - Gender: ${gender || 'Any'}
                - Good With: ${goodWith || 'Any'}
                - Coat Length: ${coatLength || 'Any'}
                - Country : ${country || 'Any'}
                - City : ${city || 'Any'}
            `;

            alert(filterSummary);

            console.log('Search filters applied:', {
                species, breed, age, size, gender, goodWith, coatLength
            });
        });
    }

    // Login functionality //
    const loginButton = document.querySelector('.login-button');
    const loginTab = document.getElementById('login-tab');
    const closeLoginButton = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const signupLink = document.getElementById('signup-link');
    const forgotPasswordLink = document.getElementById('forgot-password');

    // Open login tab
    loginButton.addEventListener('click', function () {
        loginTab.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close login tab
    closeLoginButton.addEventListener('click', function () {
        loginTab.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close tab
    loginTab.addEventListener('click', function (event) {
        if (event.target === loginTab) {
            loginTab.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle login data submission
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('#email').value;
        const password = loginForm.querySelector('#password').value;
        const rememberMe = document.getElementById('remember').checked;

        console.log('Login attempted:', { email, password, rememberMe });

        // Send data to server
        // TODO

        alert('Login successful!');
        loginTab.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Forgot password link
    forgotPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        alert('Password recovery functionality');
    });

    // Sign up functionality //
    const signupTab = document.getElementById('signup-tab');
    const closeSignupButton = document.getElementById('close-signup');
    const signupForm = document.getElementById('signup-form');
    const loginLink = document.getElementById('login-link');

    // Sign up link
    signupLink.addEventListener('click', function (event) {
        event.preventDefault();
        signupTab.classList.add('active');
        document.body.style.overflow = 'hidden';
        loginTab.classList.remove('active');
    });

    // Close signup tab
    closeSignupButton.addEventListener('click', function () {
        signupTab.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close tab
    signupTab.addEventListener('click', function (event) {
        if (event.target === signupTab) {
            signupTab.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle sign up data submission
    signupForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = signupForm.querySelector('#email').value;
        const password = signupForm.querySelector('#password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if(password.length < 6)
        {
            alert('The password must be at least 6 characters long!');
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm-password', confirmPassword);
        
        try {
            const response = await fetch("http://localhost/backend/services/register.php", {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('Registration successful! You can now log in.');
                
                document.getElementById('signup-tab').classList.remove('active');
                document.getElementById('login-tab').classList.add('active');
                
                signupForm.reset();
            } else {
                alert('Registration failed!');
            }
        } catch (error) {
            console.error('Registration error:', error);
        }

    });

    // Login link
    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    });
});
