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

    dropdownMenu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    document.querySelectorAll('.dropdown-category').forEach(category => {
        category.addEventListener('click', function () {
            // Actions to be added
        });
    });

    // Wishlist button
    document.querySelector('.wishlist').addEventListener('click', function () {
        // Actions to be added
    });

    // Species and breed filters
    const speciesSelect = document.getElementById('species-select');
    const breedSelect = document.getElementById('breed-select');

    // Different breeds for each species
    const breedsBySpecies = {
        "": [{ value: "", text: "Any" }],
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

    // Update breed options
    function updateBreedOptions(selectedSpecies) {
        breedSelect.innerHTML = '';

        const breeds = breedsBySpecies[selectedSpecies] || breedsBySpecies[""];

        // Create breed options
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

        if (selectedCountry !== "") {
            const anyOption = document.createElement('option');
            anyOption.value = "any";
            anyOption.textContent = "Any (Whole Country)";
            citySelect.appendChild(anyOption);
        }

        // Get cities
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
            const species = document.getElementById('species-select').value;
            const breed = document.getElementById('breed-select').value;
            const age = document.getElementById('age-select').value;
            const size = document.getElementById('size-select').value;
            const gender = document.getElementById('gender-select').value;
            const goodWith = document.getElementById('good-with-select').value;
            const coatLength = document.getElementById('coat-select').value;
            const country = document.getElementById('country-select').value;
            const city = document.getElementById('city-select').value;
        });
    }

    // Login functionality //
    const loginButton = document.querySelector('.login-button');
    const loginTab = document.getElementById('login-tab');
    const closeLoginButton = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const signupLink = document.getElementById('signup-link');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const accountButton = document.getElementById('logged-in-button');
    const accountMenu = document.querySelector('.account-menu');
    var isLoggedIn = false;

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
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = loginForm.querySelector('#email').value;
        const password = loginForm.querySelector('#password').value;
        const rememberMe = document.getElementById('remember').checked;

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch("http://localhost/backend/services/login.php", {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Login successful!');

                loginTab.classList.remove('active');
                isLoggedIn = true;
                loginButton.style.display = 'none';
                accountButton.style.display = 'block';

            } else {
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error);
        }


        document.body.style.overflow = '';
    });

    // Open account menu
    accountButton.addEventListener('click', function () {
        if (!accountMenu.classList.contains('active'))
            accountMenu.classList.add('active');
        else
            accountMenu.classList.remove('active');
    });

    // Close account menu
    document.addEventListener('click', function (event) {
        if (!accountMenu.contains(event.target) && event.target !== accountButton) {
            accountMenu.classList.remove('active');
        }
    });

    // Forgot password link
    forgotPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        alert('Password recovery functionality');
    });

    // Logout funcionality
    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', async function () {

        try {
            const response = await fetch("http://localhost/backend/services/logout.php", {
                method: 'POST'
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Logged out successfully!');

                isLoggedIn = false;
                loginButton.style.display = 'block';
                accountButton.style.display = 'none';
                accountMenu.classList.remove('active');

            }
            else {
                alert('Logout failed: ' + result.message);
            }
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred during logout.');
        }
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

        if (password.length < 6) {
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

    // Profile tab //
    const profileButton = document.getElementById('profile-button');
    const profileTab = document.getElementById('profile-tab');
    const closeProfileButton = document.getElementById('close-profile');
    const profileForm = document.getElementById('profile-form');

    let userData = {
        first_name: '',
        last_name: '',
        email: '',
        date_of_birth: ''
    };

    // Open profile tab
    profileButton.addEventListener('click', function () {
        fetchUserProfile();
        profileTab.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close profile tab
    closeProfileButton.addEventListener('click', function () {
        profileTab.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close tab
    profileTab.addEventListener('click', function (event) {
        if (event.target === profileTab) {
            profileTab.classList.remove('active');
            document.body.style.overflow = '';
        }
    });


    // Format date for database (DD-MM-YYYY)
    function formatDateForDatabase(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    // Format date for input field (YYYY-MM-DD)
    function formatDateForInput(dateString) {
        if (!dateString) return '';

        const parts = dateString.split('-');
        if (parts.length !== 3) return '';

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // Get user data from DB
    async function fetchUserProfile() {
        try {
            const response = await fetch("http://localhost/backend/services/getprofile.php");
            const result = await response.json();

            if (result.status === 'success') {
                userData = result.data;

                const firstNameInput = document.getElementById('user-first-name');
                const lastNameInput = document.getElementById('user-last-name');
                const emailDisplay = document.getElementById('user-email');
                const dateOfBirthInput = document.getElementById('user-date-of-birth');

                if (firstNameInput)
                    firstNameInput.value = userData.first_name || '';
                if (lastNameInput)
                    lastNameInput.value = userData.last_name || '';
                if (emailDisplay)
                    emailDisplay.textContent = userData.email || '';
                if (dateOfBirthInput && userData.date_of_birth)
                dateOfBirthInput.value = formatDateForInput(userData.date_of_birth);

            }
            else {
                console.error('Failed to fetch profile data:', result.message);
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    // Profile data submision
    profileForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const firstName = document.getElementById('user-first-name').value;
        const lastName = document.getElementById('user-last-name').value;
        const dateOfBirth = document.getElementById('user-date-of-birth').value;
        const formattedDate = formatDateForDatabase(dateOfBirth);

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('date_of_birth', formattedDate);

        try {
            const response = await fetch("http://localhost/backend/services/updateprofile.php", {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                alert('Profile updated successfully!');
                userData = {
                    ...userData,
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth
                };
                profileTab.classList.remove('active');
                document.body.style.overflow = '';
            }
            else {
                alert('Failed to update profile: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while updating your profile.');
        }
    });

});
