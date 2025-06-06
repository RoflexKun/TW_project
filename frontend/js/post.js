document.addEventListener("DOMContentLoaded", function () {
    extractPostInfo();

    const reportBtn = document.getElementById('report-button');
    const reportModalBg = document.getElementById('report-modal-bg');
    const closeReportBtn = document.getElementById('close-report');
    const reportForm = document.getElementById('report-form');

    if (reportBtn && reportModalBg && closeReportBtn && reportForm) {
        reportBtn.addEventListener('click', () => {
            reportModalBg.classList.remove('hidden');
        });

        closeReportBtn.addEventListener('click', () => {
            reportModalBg.classList.add('hidden');
        });

        reportModalBg.addEventListener('click', (e) => {
            if (e.target === reportModalBg) {
                reportModalBg.classList.add('hidden');
            }
        });

        reportForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(reportForm);
            const reason = formData.get('reason');
            const comments = formData.get('comments');
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');

            const formDataTicket = new FormData();
            formDataTicket.append('subject', reason);
            formDataTicket.append('description', comments);
            formDataTicket.append('id', postId);
            try {
                const response = await fetch("http://localhost/backend/services/createticketservice.php", {
                    method: "POST",
                    body: formDataTicket
                });
                
                const result = await response.text();
                console.log(result);
            }catch(error){
                console.log(error);
            }

            console.log('Report submitted:', { reason, comments });

            alert('Report submitted. Thank you.');
            reportModalBg.classList.add('hidden');
            reportForm.reset();
        });
    }

    const favouriteBtn = document.getElementById("favourite-button");
    const wishlistPopup = document.getElementById("wishlist-popup");
    const wishlistPopupClose = document.getElementById("wishlist-popup-close");

    if (favouriteBtn) {
        const postId = new URLSearchParams(window.location.search).get("id");
        const token = getToken();

        if (!token) {
            favouriteBtn.addEventListener("click", () => {
                wishlistPopup.style.display = "flex";
            });
        } else {

            async function checkIfInWishlist() {
                const formData = new FormData();
                formData.append("action", "duplicate");
                formData.append("postId", postId);

                try {
                    const response = await fetch("http://localhost/backend/services/operationwishlistservice.php", {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.text();
                    const isInWishlist = result.trim() === "true";

                    favouriteBtn.classList.toggle("active", isInWishlist);
                    favouriteBtn.innerText = isInWishlist ? "❤️" : "🤍";
                } catch (error) {
                    console.error("Error checking wishlist:", error);
                }
            }

            checkIfInWishlist();

            favouriteBtn.addEventListener("click", async () => {
                const isActive = favouriteBtn.classList.toggle("active");
                favouriteBtn.innerText = isActive ? "❤️" : "🤍";

                const formData = new FormData();
                formData.append("action", isActive ? "add" : "remove");
                formData.append("postId", postId);

                try {
                    const response = await fetch("http://localhost/backend/services/operationwishlistservice.php", {
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.text();
                    console.log(result);
                } catch (error) {
                    console.error("Wishlist operation failed:", error);
                }
            });
        }
    }

    if (wishlistPopupClose) {
        wishlistPopupClose.addEventListener("click", () => {
            wishlistPopup.style.display = "none";
        });
    }

    // Create a ticket modal login(SHOULD BE ADDED TO ALL HEADERS)
    const ticketCreateBtn = document.getElementById('create-ticket');
    const ticketModal = document.getElementById('ticket-modal');
    const ticketSubmitBtn = document.getElementById('ticket-modal-submit');
    const subjectInput = document.getElementById('ticket-modal-subject');
    const descriptionInput = document.getElementById('ticket-modal-description');
    const subjectError = document.getElementById('subject-error');
    const descriptionError = document.getElementById('description-error');

    ticketCreateBtn.addEventListener('click', () => {
        ticketModal.classList.remove('hidden');
    });

    ticketSubmitBtn.addEventListener('click', async () => {
        const subject = document.getElementById('ticket-modal-subject').value.trim();
        const description = document.getElementById('ticket-modal-description').value.trim();

        subjectError.textContent = '';
        descriptionError.textContent = '';
        subjectInput.classList.remove('invalid');
        descriptionInput.classList.remove('invalid');

        let hasError = false;

        if (!subject) {
            subjectError.textContent = 'Subject must not be empty';
            subjectInput.classList.add('invalid');
            hasError = true;
        }

        if (!description) {
            descriptionError.textContent = 'Description must not be empty';
            descriptionInput.classList.add('invalid');
            hasError = true;
        }

        if (hasError) return;

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('description', description);
        try {
            const response = await fetch("http://localhost/backend/services/createticketservice.php", {
                method: "POST",
                body: formData
            });
        } catch (error) {
            error.log(error);
        }

        console.log('Ticket submitted!');
        ticketModal.classList.add('hidden');
    });

    const ticketCloseBtn = document.getElementById('ticket-modal-close');

    ticketCloseBtn.addEventListener('click', () => {
        ticketModal.classList.add('hidden');
    });

    //Check if an user is an admin
    async function isAdmin(){
        try {
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/validateadminservice.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();
            console.log(result);

            if(result.is_admin === true){
                document.getElementById('admin-button').classList.remove('hidden');
                document.getElementById('admin-button').addEventListener('click', function () {
                    window.location.href = "http://localhost/frontend/pages/adminpage.html";
                });
            }

        } catch (error) {
            console.log(error);
        }

    }
    isAdmin();
});

function displayMedia(src, type, thumbElement, mediaDisplay, thumbnails) {
    mediaDisplay.innerHTML = '';

    thumbnails.querySelectorAll('.selected').forEach(thumbnail => thumbnail.classList.remove('selected'));
    thumbElement.classList.add('selected');

    if (type === 'img') {
        const img = document.createElement('img');
        img.src = src;
        mediaDisplay.appendChild(img);
    }
    else if (type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        mediaDisplay.appendChild(video);
    }
}

function displayList(sectionId, rawData) {
    const section = document.getElementById(sectionId);
    section.innerHTML = '';

    if (!rawData || rawData.trim() === '') {
        section.innerHTML = `<em>No information provided</em>`;
        return
    }

    const list = document.createElement('ul');
    rawData.split(';').forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.trim();
        list.appendChild(listItem);
    });

    section.appendChild(list);
}

async function extractPostInfo() {
    const URLparams = new URLSearchParams(window.location.search);
    const postId = URLparams.get('id');

    const formData = new FormData();
    formData.append('id', postId);

    try {
        var response = await fetch('http://localhost/backend/services/postinfoservice.php', {
            method: 'POST',
            body: formData
        });

        var text = await response.text();
        console.log(text);
        var result = JSON.parse(text);

        if (result.error) {
            console.log(result.error);
            return;
        }
        else {
            document.getElementById('pet-name').textContent = result.name;
            document.getElementById('pet-species').textContent = result.species;
            document.getElementById('pet-breed').textContent = result.breed || '-';
            document.getElementById('pet-birthday').textContent = result.birthday;
            document.getElementById('pet-age').textContent = result.age;
            document.getElementById('pet-location').textContent = result.location;
            document.getElementById('pet-size').textContent = result.animal_size;
            document.getElementById('pet-gender').textContent = result.gender;
            document.getElementById('pet-description').textContent = result.description || 'Description unavailable';
            document.getElementById('post-owner').textContent = result.owner;
            document.getElementById('post-owner-phone').textContent = result['owner_phone'];

            displayList('pet-medical', result.medical_array);
            displayList('pet-food-like', result.food_like_array);
            displayList('pet-food-dislike', result.food_dislike_array);

            const thumbnailPath = result.thumbnail.trim();
            const mediaArray = result.media_array ? result.media_array.split(';').map(x => x.trim()) : [];
            const photoExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'jfif'];
            const videoExt = ['mp4', 'webm'];

            const mediaDisplay = document.getElementById('main-media');
            mediaDisplay.innerHTML = '';
            const thumbnails = document.getElementById('media-thumbnails');
            thumbnails.innerHTML = '';

            const thumbnailExt = thumbnailPath.split('.').pop().toLowerCase();
            const mainType = photoExt.includes(thumbnailExt) ? 'img' : 'video';
            const mainSrc = '/' + thumbnailPath;

            const mainThumbElement = document.createElement(mainType === 'img' ? 'img' : 'video');
            mainThumbElement.src = mainSrc;
            if (mainType === 'video') {
                mainThumbElement.controls = true;
            }
            mediaDisplay.appendChild(mainThumbElement);

            const thumbPreview = document.createElement(mainType === 'img' ? 'img' : 'video');
            thumbPreview.src = mainSrc;
            if (mainType === 'video') {
                thumbPreview.muted = true;
            }
            thumbPreview.classList.add('selected');
            thumbnails.appendChild(thumbPreview);

            thumbPreview.addEventListener('click', () =>
                displayMedia(mainSrc, mainType, thumbPreview, mediaDisplay, thumbnails)
            );

            mediaArray.forEach(file_path => {
                const ext = file_path.split('.').pop().toLowerCase();
                const src = '/' + file_path;

                let type, thumb;
                if (photoExt.includes(ext)) {
                    type = 'img';
                    thumb = document.createElement('img');
                    thumb.src = src;
                } else if (videoExt.includes(ext)) {
                    type = 'video';
                    thumb = document.createElement('video');
                    thumb.src = src;
                    thumb.muted = true;
                }

                if (thumb) {
                    thumbnails.appendChild(thumb);
                    thumb.addEventListener('click', () =>
                        displayMedia(src, type, thumb, mediaDisplay, thumbnails)
                    );
                }
            });

        }

    }
    catch (error) {
        console.log(error);
    }
}

// Header functionality
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
    async function fetchCityOptions(selectElement = citySelect) {
        selectElement.innerHTML = '<option value="Any">Any</option>';

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
                selectElement.disabled = false;
                selectElement.innerHTML = '<option value="">Select City</option>';
                cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city;
                    option.text = city;
                    selectElement.appendChild(option);
                });
            } else {
                selectElement.disabled = true;
                selectElement.innerHTML = '<option value="">No cities available</option>';
            }
        } catch (error) {
            console.error("Failed to fetch cities:", error);
            selectElement.disabled = true;
            selectElement.innerHTML = '<option value="">No cities available</option>';
        }
    }


    // Login functionality //
    const loginButton = document.querySelector('.login-button');
    const loginTab = document.getElementById('login-tab');
    const closeLoginButton = document.getElementById('close-login');
    const loginForm = document.getElementById('login-form');
    const signupLink = document.getElementById('signup-link');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const forgotPasswordTab = document.getElementById('forgot-tab');
    const accountButton = document.getElementById('logged-in-button');
    const accountMenu = document.querySelector('.account-menu');
    const wishlistBtt = document.getElementById('wishlist-button');
    var isLoggedIn = false;

    function setLoggedInUI() {
        loginButton.style.display = 'none';
        accountButton.style.display = 'block';
        wishlistBtt.style.display = 'block';
        loginTab.classList.remove('active');
        isLoggedIn = true;
    }
    window.setLoggedInUI = setLoggedInUI;

    function setLoggedOutUI() {
        loginButton.style.display = 'block';
        accountButton.style.display = 'none';
        wishlistBtt.style.display = 'none';
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

        const email = loginForm.querySelector('#login-email').value;
        const password = loginForm.querySelector('#login-password').value;

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

    // Wishlist button redirect to wishlist page
    const wishlistBtton = document.getElementById('wishlist-button');
    wishlistBtton.addEventListener('click', function () {
        window.location.href = '../pages/wishlist.html';
    });

    // Post button redirect to new post page
    const postButton = document.getElementById('post-button');
    postButton.addEventListener('click', function () {
        window.location.href = '../pages/newPost.html';
    });

    // Other pets button redirect to new your posts page
    const otherPetsButton = document.getElementById('other-pets');
    otherPetsButton.addEventListener('click', function () {
        window.location.href = '../pages/postlist.html';
    });

    // Dogs & puppies button redirect to the list of all posts with dogs page
    const dogsButton = document.getElementById('Dog');
    dogsButton.addEventListener('click', function () {
        window.location.href = '../pages/postlist.html?filter=Dog';
    });

    // Cats & kittens button redirect to the list of all posts with cats page
    const catssButton = document.getElementById('Cat');
    catssButton.addEventListener('click', function () {
        window.location.href = '../pages/postlist.html?filter=Cat';
    });

    // Forgot password link(TO BE MODIFIED IN ALL HEADERS)
    forgotPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginTab.classList.remove('active');
        forgotPasswordTab.classList.add('active');

        const form = document.getElementById('forgot-form');
        const altLink = document.querySelector('.forgot-alternative');
        const confirmationContainer = document.getElementById('confirmation-message');

        form.reset();
        form.style.display = 'block';
        altLink.style.display = 'block';
        confirmationContainer.style.display = 'none';
        confirmationContainer.innerHTML = '';
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

                // Redirect to homepage
                window.location.href = '../pages/HomePage.html';
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

        const email = signupForm.querySelector('#signup-email').value;
        const password = signupForm.querySelector('#signup-password').value;
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

    // Forgot password functionality //
    const closeForgotButton = document.getElementById('close-forgot');
    const forgotForm = document.getElementById('forgot-form');
    const forgotLoginLink = document.getElementById('forgot-login-link');

    // Close forgot password tab
    closeForgotButton.addEventListener('click', function () {
        forgotPasswordTab.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close tab
    forgotPasswordTab.addEventListener('click', function (event) {
        if (event.target === forgotPasswordTab) {
            forgotPasswordTab.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Handle forgot password data submission
    forgotForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = forgotForm.querySelector('#forgot-email').value;

        const formData = new URLSearchParams();
        formData.append('email', email);

        try {
            const response = await fetch("http://localhost/backend/services/emailservice.php", {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            console.log(result);

            if (result.status === 'Password reset email sent.') {
                const form = document.getElementById('forgot-form');
                const altLink = document.querySelector('.forgot-alternative');
                const confirmationContainer = document.getElementById('confirmation-message');

                form.style.display = 'none';
                altLink.style.display = 'none';

                confirmationContainer.innerHTML = '';
                const messagePara = document.createElement('p');
                messagePara.textContent = 'An email with the password reset link has been sent to ';
                const emailStrong = document.createElement('strong');
                emailStrong.textContent = email;
                messagePara.appendChild(emailStrong);
                messagePara.appendChild(document.createTextNode('.'));

                confirmationContainer.appendChild(messagePara);
                confirmationContainer.style.display = 'block';
            }
        } catch (error) {
            console.log(error);
        }

    });

    // Login link
    forgotLoginLink.addEventListener('click', function (event) {
        event.preventDefault();
        forgotPasswordTab.classList.remove('active'); // Close forgot password tab
        loginTab.classList.add('active'); // Open login tab
        document.body.style.overflow = 'hidden'; // Keep body scroll disabled
    });

    //Posts tab whole logic and functionality
    const yourPostsButton = document.getElementById('your-posts-button');
    const userPostsOverlay = document.getElementById('user-posts-overlay');
    const userPostsClose = document.getElementById('user-posts-close');
    const userPostsSummary = document.getElementById('user-posts-summary');
    const userPostsList = document.getElementById('user-posts-list');

    async function setUsersName() {
        try {
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/getprofile.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();

            const userNameSpan = document.getElementById("user-posts-title");
            if (userNameSpan && result.user && result.user.first_name) {
                userNameSpan.textContent = result.user.first_name + "'s post list";
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    userPostsClose.addEventListener('click', function () {
        userPostsOverlay.style.display = 'none';
    });

    yourPostsButton.addEventListener('click', async () => {
        setUsersName();

        try {
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/userpostservice.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            const result = await response.json();
            console.log(result);

            if (result.counter === 0) {
                userPostsSummary.textContent = "You don't have any posts.";
                userPostsList.innerHTML = "";
            } else {
                const ids = result.id.split(";");
                const names = result.name.split(";");
                const ages = result.age.split(";");

                userPostsSummary.textContent = `Total number of posts: ${result.counter}`;
                userPostsList.innerHTML = "";

                for (let i = 0; i < result.counter; i++) {
                    const postItem = document.createElement('div');
                    postItem.className = 'user-posts-item';

                    const info = document.createElement('div');
                    info.className = 'user-posts-info';
                    info.textContent = `${names[i]}, ${ages[i]}`;

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'user-posts-delete';
                    deleteBtn.textContent = 'Delete';

                    postItem.addEventListener('click', () => {
                        window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
                    });

                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${names[i]}'s post?`)) {
                            try {
                                const formData = new FormData();
                                formData.append('idPost', ids[i]);
                                const response = fetch("http://localhost/backend/services/deletepostservice.php", {
                                    headers: {
                                        'Authorization': 'Bearer ' + token,
                                    },
                                    method: 'POST',
                                    body: formData
                                });

                                const result = await response.text();
                                console.log(result);

                            } catch (error) {
                                console.log(error);
                            }
                            userPostsList.removeChild(postItem);
                            userPostsSummary.textContent = `Total number of posts: ${--result.counter}`;
                        }
                    });

                    postItem.appendChild(info);
                    postItem.appendChild(deleteBtn);
                    userPostsList.appendChild(postItem);
                }
            }

            userPostsOverlay.style.display = 'flex';
        } catch (error) {
            console.log(error);
        }

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
                const phoneNumberInput = document.getElementById('user-phone-number');

                if (firstNameInput)
                    firstNameInput.value = userData.first_name || '';
                if (lastNameInput)
                    lastNameInput.value = userData.last_name || '';
                if (emailDisplay)
                    emailDisplay.textContent = userData.email || '';
                if (phoneNumberInput)
                    phoneNumberInput.value = userData.phone_number || '';
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
        const phoneNumber = document.getElementById('user-phone-number').value;
        const formattedDate = formatDateForDatabase(dateOfBirth);

        const formData = new URLSearchParams();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('phone_number', phoneNumber);
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
                    phone_number: phoneNumber,
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

// Google login
window.handleGoogleLogin = async function(response) {
    const idToken = response.credential;

    try {
        const res = await fetch("http://localhost/backend/services/googlelogin.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `id_token=${encodeURIComponent(idToken)}`
        });

        const text = await res.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error("Google login response was not JSON:", text);
            alert('Google login failed: Invalid server response');
            return;
        }

        if (result.token) {
            setToken(result.token);
            localStorage.setItem('user', JSON.stringify(result.user));
            setLoggedInUI();

            document.getElementById('login-tab').classList.remove('active');
            document.body.style.overflow = '';
        } else {
            alert('Google login failed: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error("Google login error:", error);
    }
    document.body.style.overflow = '';
}

//Phone number Popup
function getPostOwnerPhoneNumber() {
    return window.currentPostOwnerPhoneNumber || "123-456-7890";
}

document.addEventListener("DOMContentLoaded", function () {
    const adoptBtn = document.querySelector('.adopt-button');
    const adoptOverlay = document.getElementById('adopt-tab');
    const closeAdoptBtn = document.getElementById('close-adopt');
    const phoneNumberDiv = document.getElementById('adopt-phone-number');

    if (adoptBtn) {
        adoptBtn.addEventListener('click', function () {
            // Get phone number from hidden div
            const phone = document.getElementById('post-owner-phone').textContent;
            phoneNumberDiv.textContent = phone;
            adoptOverlay.style.display = 'flex';
        });
    }

    if (closeAdoptBtn) {
        closeAdoptBtn.addEventListener('click', function () {
            adoptOverlay.style.display = 'none';
        });
    }
});
