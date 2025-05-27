function getToken() {
    return localStorage.getItem('token');
}

let names = [];
let ages = [];
let thumbnails = [];
let ids = [];


document.addEventListener("DOMContentLoaded", () => {
    const sortToggle = document.getElementById("sortToggle");
    const sortLabel = document.getElementById("sortLabel");
    const sortArrow = document.getElementById("sortArrow");

    let isDescending = false;

    sortToggle.addEventListener("click", () => {
        isDescending = !isDescending;
        showPostsSorted(isDescending);

        sortLabel.textContent = isDescending ? "New to Old" : "Old to New";
        sortArrow.textContent = isDescending ? "↓" : "↑";

        console.log(`Sorting: ${isDescending ? "Descending" : "Ascending"}`);
    });

    async function fetchUserProfile() {
        try {
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/getprofile.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();

            const userNameSpan = document.getElementById("userName");
            if (userNameSpan && result.user && result.user.first_name) {
                userNameSpan.textContent = result.user.first_name;
            }

        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }

    async function fetchWishlistPosts() {
        try {
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/extractwishlist.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();
            console.log("Fetched result:", result);

            const emptyMessage = document.getElementById("emptyMessage");
            const wishlistPostsContainer = document.getElementById("wishlistPosts");

            if (!result.posts || result.posts.name.length === 0) {
                if (emptyMessage) emptyMessage.style.display = "block";
                wishlistPostsContainer.classList.add("centered");
            } else {
                if (emptyMessage) emptyMessage.style.display = "none";
                wishlistPostsContainer.classList.remove("centered");

                names = result.posts.name;
                ages = result.posts.age;
                thumbnails = result.posts.thumbnail;
                ids = result.posts.id;

                showPostsSorted();

            }
        } catch (error) {
            console.log(error);
        }
    }

    // Function to sort the posts from old to new or reversed
    function showPostsSorted(reverse = true) {
        const wishlistPostsContainer = document.getElementById("wishlistPosts");
        wishlistPostsContainer.innerHTML = ""; 

        const indices = [...Array(names.length).keys()]; 
        if (reverse) indices.reverse();

        for (let i of indices) {
            const card = document.createElement("div");
            card.className = "post-card";
            card.style.position = "relative";
            card.style.cursor = "pointer";

            const image = document.createElement("img");
            image.src = thumbnails[i] ? `/${thumbnails[i]}` : "/frontend/assets/No_Image_Available.jpg";
            image.alt = names[i];
            image.className = "post-img";
            card.appendChild(image);

            const nameAge = document.createElement("h3");
            nameAge.textContent = `${names[i]}, ${ages[i]}`;
            card.appendChild(nameAge);

            const heartButton = document.createElement("button");
            heartButton.className = "heart-button active";
            heartButton.innerText = "❤️";
            card.appendChild(heartButton);

            card.addEventListener("click", () => {
                window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
            });

            heartButton.addEventListener("click", async (event) => {
                event.stopPropagation();

                const isActive = heartButton.classList.toggle("active");
                heartButton.innerText = isActive ? "❤️" : "🤍";

                const formData = new FormData();
                formData.append("action", isActive ? "add" : "remove");
                formData.append("postId", ids[i]);

                const token = getToken();

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
                    console.error(error);
                }
            });

            wishlistPostsContainer.appendChild(card);
        }

    }

    // Redirect button if there are no posts in the wishlist
    const redirectButton = document.getElementById("popup-redirect");
    if (redirectButton) {
        redirectButton.addEventListener("click", () => {
            window.location.href = "/frontend/pages/postlist.html";
        });
    }

    fetchUserProfile();
    fetchWishlistPosts();
});

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

    userPostsClose.addEventListener('click', () => {
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