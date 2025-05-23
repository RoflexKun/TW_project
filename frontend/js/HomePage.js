// Helper to get JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Helper to set JWT token in localStorage
function setToken(token) {
    localStorage.setItem('token', token);
}

// Helper to remove JWT token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

document.addEventListener('DOMContentLoaded', async function () {

    // Redirect to Home Page
    const logo = document.querySelector('.logo');
    logo.addEventListener('click', function () {
        window.location.href = '../pages/HomePage.html';
    });
    
    const speciesIdMap = {};
    const speciesSelect = document.getElementById('species-select');
    const breedSelect = document.getElementById('breed-select');
    const citySelect = document.getElementById('city-select');
    const ageMin = document.getElementById('age-min');
    const ageMax = document.getElementById('age-max');
    const ageMinVal = document.getElementById('age-min-val');
    const ageMaxVal = document.getElementById('age-max-val');

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

    //Brings locations/cities from the backend
    async function fetchCityOptions() {
        citySelect.innerHTML = '<option value="Any">Any</option>';

        const formData = new FormData();
        formData.append("action", "location");

        try {
            const response = await fetch("http://localhost/backend/services/newpostinfoservice.php", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const textResponse = await response.text();
            const cities = JSON.parse(textResponse);

            if (cities && cities.length > 0) {
                citySelect.disabled = false;
                citySelect.innerHTML = '<option value="Any">Any</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.text = city;
                    citySelect.appendChild(option);
                });
            } else {
                citySelect.disabled = true;
                citySelect.innerHTML = '<option value="">No cities available</option>';
            }
        } catch (error) {
            console.error("Failed to fetch cities:", error);
            citySelect.disabled = true;
            citySelect.innerHTML = '<option value="">No cities available</option>';
        }
    }

    //Bring species from the backend
    async function fetchSpeciesOptions() {
        const formData = new FormData();
        formData.append("action", "species");

        try {
            const response = await fetch("http://localhost/backend/services/newpostinfoservice.php", {
                method: "POST",
                body: formData
            });

            const { names, ids } = await response.json();
            speciesSelect.innerHTML = '<option value="Any">Any</option>';

            names.forEach((speciesName, index) => {
                const option = document.createElement("option");
                option.textContent = speciesName;
                option.value = speciesName;
                speciesIdMap[speciesName] = ids[index];
                speciesSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load species:", error);
        }
    }

    // Fetch breeds based on selected species
    async function fetchBreedsBySpecies(speciesName) {
        breedSelect.innerHTML = '<option value="">Any</option>';

        if (!speciesName || speciesName === "") {
            breedSelect.disabled = true;
            return;
        }

        const speciesId = speciesIdMap[speciesName];
        if (!speciesId) {
            console.error(`No species ID found for species name: ${speciesName}`);
            breedSelect.disabled = true;
            return;
        }

        const formData = new FormData();
        formData.append('action', 'breed');
        formData.append('species_id', speciesId);

        try {
            const response = await fetch('http://localhost/backend/services/newpostinfoservice.php', {
                method: "POST",
                body: formData
            });

            const textResponse = await response.text();

            if (textResponse.trim().startsWith('<br') || textResponse.trim().startsWith('<html')) {
                breedSelect.disabled = true;
                breedSelect.innerHTML = '<option value="Any">Any</option>';
                return;
            }
            const breeds = JSON.parse(textResponse);

            if (breeds && breeds.length > 0) {
                breedSelect.disabled = false;
                breedSelect.innerHTML = '<option value="">Any</option>';
                breeds.forEach(breed => {
                    const option = document.createElement('option');
                    option.value = breed;
                    option.text = breed;
                    breedSelect.appendChild(option);
                });
            } else {
                breedSelect.disabled = true;
                breedSelect.innerHTML = '<option value="Any">Any</option>';
            }
        } catch (error) {
            breedSelect.disabled = true;
            breedSelect.innerHTML = '<option value="Any">Any</option>';
        }
    }

    speciesSelect.addEventListener('change', function () {
        const selectedSpecies = this.value;
        console.log("Selected species:", selectedSpecies);
        fetchBreedsBySpecies(selectedSpecies);
    });

    await fetchSpeciesOptions();
    await fetchCityOptions();
    fetchBreedsBySpecies(speciesSelect.value);

    //Filter results
    let names = [];
    let ids = [];
    let ages = [];
    let thumbnails = [];

    //Function to display posts
    function displayPosts(page = 1) {
        const wrapper = document.querySelector('.post-wrapper');
        const noResults = document.getElementById('no-results');
        const pagination = document.getElementById('pagination');

        wrapper.innerHTML = "";
        pagination.innerHTML = "";
        noResults.classList.add('hidden');

        const start = (page - 1) * 8;
        const end = start + 8;

        if (names.length === 0) {
            noResults.classList.remove('hidden');
            return;
        }

        for (let i = start; i < end && i < names.length; i++) {
            const post = document.createElement('div');
            post.classList.add('post-card');
            post.innerHTML = `
            <img src="/${thumbnails[i]}" class="post-img" />
            <p class="post-text"><strong>${names[i]}, ${ages[i]}</strong></p>
        `;

            post.addEventListener('click', () => {
                window.location.href = `../pages/post.html?id=${ids[i]}`;
            });
            wrapper.appendChild(post);
        }

        renderPagination(page);
    }

    //Create pagination similar to the one in the post list
    function renderPagination(currentPage) {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(names.length / 8);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = 'page-button' + (i === currentPage ? ' active' : '');
            btn.addEventListener('click', () => displayPosts(i));
            pagination.appendChild(btn);
        }
    }


    // Search button functionality
    const searchButton = document.getElementById('search-button');
    if (searchButton) {
        searchButton.addEventListener('click', async function () {

            const filters = {
                species: document.getElementById('species-select').value,
                breed: document.getElementById('breed-select').value,
                age_min: document.getElementById('age-min').value,
                age_max: document.getElementById('age-max').value,
                size: document.getElementById('size-select').value,
                gender: document.getElementById('gender-select').value,
                city: document.getElementById('city-select').value
            };
            console.log(filters.species, filters.city, filters.size, filters.gender, filters.age_min, filters.age_max);
            const allAny = (filters.species === "Any" && filters.size === "Any" &&
                filters.gender === "Any" && filters.city === "Any" &&
                parseInt(filters.age_min) === 0 && parseInt(filters.age_max) === 20);

            if (allAny) {
                document.getElementById('suggestion-popup').style.display = 'flex';
                return;
            }

            const formData = new FormData();
            const searchParams = {};

            searchParams.species = filters.species || "Any";
            formData.append('species', searchParams.species);
            searchParams.breed = filters.breed || "Any";
            formData.append('breed', searchParams.breed);
            searchParams.size = filters.size || "Any";
            formData.append('size', searchParams.size);
            searchParams.gender = filters.gender || "Any";
            formData.append('gender', searchParams.gender);
            searchParams.city = filters.city || "Any";
            formData.append('city', searchParams.city);
            searchParams.age_min = parseInt(filters.age_min);
            formData.append('age_min', searchParams.age_min);
            searchParams.age_max = parseInt(filters.age_max);
            formData.append('age_max', searchParams.age_max);

            console.log("Search Parameters:", searchParams);

            try {
                const response = await fetch("http://localhost/backend/services/filtersearchservice.php", {
                    method: 'POST',
                    body: formData
                });

                const rawText = await response.text();
                console.log(rawText);
                const result = JSON.parse(rawText);
                console.log(result);

                if (result.data && Array.isArray(result.data.name) && result.data.name.length > 0) {
                    names = result.data.name;
                    ids = result.data.id;
                    ages = result.data.age;
                    thumbnails = result.data.thumbnail;
                    displayPosts(1);
                } else {
                    names = [];
                    ids = [];
                    ages = [];
                    thumbnails = [];
                    displayPosts(1);
                }

            } catch (error) {
                console.log(error);
            }
        }

        );
    }

    // Close popup button 
    document.getElementById('popup-close').addEventListener('click', function () {
        document.getElementById('suggestion-popup').style.display = 'none';
    });

    //Redirect button
    document.getElementById('popup-redirect').addEventListener('click', function () {
        window.location.href = '../pages/postlist.html';
    });

    // Redirect from no-results section
    document.getElementById('no-results-redirect').addEventListener('click', () => {
        window.location.href = '../pages/postlist.html';
    });

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

    function setLoggedInUI() {
        loginButton.style.display = 'none';
        accountButton.style.display = 'block';
        loginTab.classList.remove('active');
        isLoggedIn = true;
    }

    function setLoggedOutUI() {
        loginButton.style.display = 'block';
        accountButton.style.display = 'none';
        accountMenu.classList.remove('active');
        isLoggedIn = false;
    }

    // Auto login after ctrl+f5
    const token = getToken();
    if (token) {
        try {
            const response = await fetch("http://localhost/backend/services/getprofile.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const result = await response.json();

            if (result && result.user) {
                setLoggedInUI();
                localStorage.setItem('user', JSON.stringify(result.user));
            }
            else {
                setLoggedOutUI();
                removeToken();
                localStorage.removeItem('user');
            }
        }
        catch (error) {
            setLoggedOutUI();
            removeToken();
            localStorage.removeItem('user');
        }
    }
    else {
        setLoggedOutUI();
    }

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

        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await fetch("http://localhost/backend/services/login.php", {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const result = await response.json();

            if (result && result.token) {
                setToken(result.token);

                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(result.user));
                alert('Login successful!');

                setLoggedInUI();

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

    // Post button redirect to new post page
    const postButton = document.getElementById('post-button');
    postButton.addEventListener('click', function () {
        window.location.href = '../pages/newPost.html';
    });

    // Your Posts button redirect to new your posts page
    const yourPostsButton = document.getElementById('your-posts-button');
    yourPostsButton.addEventListener('click', function () {
        window.location.href = '../pages/postlist.html';
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

            if (result.success) {
                removeToken();
                localStorage.removeItem('user');
                alert('Logged out successfully!');

                setLoggedOutUI();

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

        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm-password', confirmPassword);

        try {
            const response = await fetch("http://localhost/backend/services/register.php", {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const result = await response.json();

            if (result && result.token) {
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
        date_of_birth: '',
        id: ' '
    };

    // Open profile tab
    profileButton.addEventListener('click', function () {
        if (getToken()) {
            fetchUserProfile();
        }
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
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/getprofile.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();

            if (result && result.user) {
                userData = result.user;

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
                if (dateOfBirthInput) {
                    if (userData.date_of_birth) {
                        dateOfBirthInput.value = formatDateForInput(userData.date_of_birth);
                    } else {
                        dateOfBirthInput.value = '';
                    }
                }

                console.log(userData.id);

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

        const token = getToken();
        const firstName = document.getElementById('user-first-name').value;
        const lastName = document.getElementById('user-last-name').value;
        const dateOfBirth = document.getElementById('user-date-of-birth').value;
        const formattedDate = formatDateForDatabase(dateOfBirth);

        const formData = new URLSearchParams();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('date_of_birth', formattedDate);

        try {
            const response = await fetch("http://localhost/backend/services/updateprofile.php", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + token
                },
                body: formData.toString()
            });

            const result = await response.json();

            if (result && result.user) {
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

    // This updates the values in the age slider in the filters menu
    ageMin.addEventListener('input', () => updateAgeDisplay("min"));
    ageMax.addEventListener('input', () => updateAgeDisplay("max"));

    function updateAgeDisplay(changed) {
        let min = parseInt(ageMin.value);
        let max = parseInt(ageMax.value);

        if (changed === "min" && min > max) {
            max = min;
            ageMax.value = max;
        } else if (changed === "max" && max < min) {
            min = max;
            ageMin.value = min;
        }

        ageMinVal.textContent = min;
        ageMaxVal.textContent = max;
    }
    updateAgeDisplay("min");

});
