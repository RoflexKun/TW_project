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

        reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(reportForm);
            const reason = formData.get('reason');
            const comments = formData.get('comments');

            console.log('Report submitted:', { reason, comments });

            alert('Report submitted. Thank you.');
            reportModalBg.classList.add('hidden');
            reportForm.reset();
        });
    }
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

    const accountButton = document.getElementById('logged-in-button');
    const accountMenu = document.querySelector('.account-menu');

    function setLoggedInUI() {
        accountButton.style.display = 'block';
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
                removeToken();
                localStorage.removeItem('user');
            }
        }
        catch (error) {
            removeToken();
            localStorage.removeItem('user');
        }
    }
    else {
    }

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
});