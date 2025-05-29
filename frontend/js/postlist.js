let currentTotalPosts = 0;
let lastSearchText = "";
let currentNames = null;
let currentAges = null;
let currentIds = null;
let currentThumbnail = null;

getPostCount();
getPostList();



async function showOnlySearchResults(searchText, page = 1) {
    const postList = document.getElementById("post-list");
    const pagination = document.getElementById("pagination");
    const searchMessage = document.getElementById("search-message");

    postList.innerHTML = "";
    pagination.innerHTML = "";

    const limitSelect = document.getElementById("posts-limit");
    const limitValue = limitSelect.value;
    const postsPerPage = (limitValue === "all") ? currentIds.length : parseInt(limitValue);

    if (!currentNames || currentNames.length === 0) {
        searchMessage.textContent = `No companions found for: "${searchText}"`;
        searchMessage.style.display = "block";
        pagination.style.display = "none";
        return;
    }

    const totalPosts = currentIds.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    const currentPage = page;

    const start = (currentPage - 1) * postsPerPage;
    const end = (limitValue === "all") ? totalPosts : currentPage * postsPerPage;

    const namesToShow = currentNames.slice(start, end);
    const idsToShow = currentIds.slice(start, end);
    const agesToShow = currentAges.slice(start, end);
    const thumbnailsToShow = currentThumbnail.slice(start, end);

    searchMessage.textContent = `All results for: "${searchText}"`;
    searchMessage.style.display = "block";

    for (let i = 0; i < namesToShow.length; i++) {
        const card = document.createElement("div");
        card.className = "post-card";
        card.style.position = "relative";
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            window.location.href = `/frontend/pages/post.html?id=${idsToShow[i]}`;
        });

        const image = document.createElement("img");
        image.src = thumbnailsToShow[i] ? `/${thumbnailsToShow[i]}` : "/frontend/assets/No_Image_Available.jpg";
        image.alt = namesToShow[i];
        card.appendChild(image);

        const nameAge = document.createElement("h3");
        nameAge.textContent = `${namesToShow[i]}, ${agesToShow[i]}`;
        card.appendChild(nameAge);

        const heartButton = document.createElement("button");
        heartButton.className = "heart-button";
        heartButton.innerText = "🤍";
        card.appendChild(heartButton);

        postList.appendChild(card);

        const formData = new FormData();
        formData.append("action", "duplicate");
        formData.append("postId", idsToShow[i]);
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
            if (result.trim() === "true") {
                heartButton.classList.add("active");
                heartButton.innerText = "❤️";
            }
        } catch (error) {
            console.log(error);
        }

        heartButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            const token = getToken();
            if (!token) {
                const popup = document.getElementById("wishlist-popup");
                if (popup) popup.style.display = "flex";
                return;
            }

            const isActive = heartButton.classList.toggle("active");
            heartButton.innerText = isActive ? "❤️" : "🤍";

            const formData = new FormData();
            formData.append("action", isActive ? "add" : "remove");
            formData.append("postId", idsToShow[i]);

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
                console.log(error);
            }
        });
    }

    if (limitValue !== "all") {
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.className = "page-button" + (i === currentPage ? " active" : "");
            button.textContent = i;
            button.addEventListener("click", () => {
                const params = new URLSearchParams(window.location.search);
                params.set("search", searchText);
                params.set("page", i);
                params.set("limit", limitValue);
                window.location.search = params.toString();
            });
            pagination.appendChild(button);
        }
        pagination.style.display = "";
    } else {
        pagination.style.display = "none";
    }
}

let filter = "All";
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("search-input");
    const limitSelect = document.getElementById("posts-limit");
    const button = document.getElementById("search-button");

    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");

    if (urlFilter === "Dog" || urlFilter === "Cat") {
        filter = urlFilter;
    }

    console.log(filter);

    button.addEventListener("click", () => {
        const searchText = document.getElementById("search-input").value.trim();
        if (searchText !== "") {
            lastSearchText = searchText;
            showOnlySearchResults(searchText, 1);
        }
    });

    input.addEventListener("input", () => {
        const searchText = input.value;
        console.log("User typed:", searchText);
        getSearchResults(searchText);
    });
    limitSelect.addEventListener("change", () => {
        const selectedLimit = limitSelect.value;
        const url = new URL(window.location);
        url.searchParams.set("limit", selectedLimit);
        url.searchParams.set("page", 1);
        getPostCount();
        window.location.href = url;
    })

    const limitFromURL = urlParams.get("limit");
    if (limitFromURL) {
        limitSelect.value = limitFromURL;
    }

    //Close the popup if you don't have an account
    const wishlistPopupClose = document.getElementById("wishlist-popup-close");
    const wishlistPopup = document.getElementById("wishlist-popup");

    if (wishlistPopupClose && wishlistPopup) {
        wishlistPopupClose.addEventListener("click", () => {
            wishlistPopup.style.display = "none";
        });
    }
})

async function getSearchResults(searchText) {
    const formData = new FormData();
    formData.append("searchText", searchText);

    const list = document.getElementById("search-list");

    if (searchText.trim() === "") {
        list.innerHTML = "";
        list.style.display = "none";
        return;
    }

    try {
        var response = await fetch("http://localhost/backend/services/searchservice.php", {
            method: 'POST',
            body: formData
        });

        var text = await response.text();
        console.log(text);
        var result = JSON.parse(text);

        if (parseInt(result.counter) === 0) {
            list.innerHTML = "<div class='list-item'>No companions found</div>";
            list.style.display = "block";
            return;
        }

        const names = result.name.split(";");
        const ids = result.id.split(";");
        const ages = result.age.split(";");
        const thumbnails = result.thumbnail.split(";");

        const anotherFormData = new FormData();
        anotherFormData.append('ids', ids.join(';'));
        anotherFormData.append('filter', filter);

        const filterResponse = await fetch("http://localhost/backend/services/filteridservice.php", {
            method: "POST",
            body: anotherFormData
        });

        const filterResult = await filterResponse.json();
        const filteredIds = filterResult.data;

        const idIndexMap = {};
        ids.forEach((id, index) => {
            idIndexMap[id] = index;
        });

        const newNames = [];
        const newAges = [];
        const newThumbnails = [];
        const newIdsFinal = [];

        filteredIds.forEach((id) => {
            const index = idIndexMap[id];
            if (index !== undefined) {
                newNames.push(names[index]);
                newAges.push(ages[index]);
                newThumbnails.push(thumbnails[index]);
                newIdsFinal.push(ids[index]);
            }
        });

        names.length = 0;
        ages.length = 0;
        thumbnails.length = 0;
        ids.length = 0;

        Array.prototype.push.apply(names, newNames);
        Array.prototype.push.apply(ages, newAges);
        Array.prototype.push.apply(thumbnails, newThumbnails);
        Array.prototype.push.apply(ids, newIdsFinal);

        currentNames = names;
        currentAges = ages;
        currentIds = ids;
        currentThumbnail = thumbnails;

        list.innerHTML = "";

        const showCount = Math.min(names.length, 5);
        for (let i = 0; i < showCount; i++) {
            const item = document.createElement("div");
            item.className = "list-item";
            item.textContent = `${names[i]}, ${ages[i]}`;
            item.addEventListener("click", () => {
                window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
            });
            list.appendChild(item);
        }

        if (names.length > 5) {
            const more = document.createElement("div");
            more.className = "list-footer";
            more.textContent = `... and ${names.length - 5} other companions found`;
            list.appendChild(more);
        }

        list.style.display = "block";
    } catch (error) {
        console.log(error);
    }
}

async function getPostCount() {
    const formData = new FormData();
    formData.append("action", "count");

    try {
        var response = await fetch("http://localhost/backend/services/postlistservice.php", {
            method: 'POST',
            body: formData
        });

        var text = await response.text();
        var result = JSON.parse(text);
        currentTotalPosts = result.count;
        const totalPosts = result.count;
        const limitParam = new URLSearchParams(window.location.search).get("limit") || 20;
        const limit = (limitParam === "all") ? totalPosts : parseInt(limitParam);

        const totalPages = Math.ceil(totalPosts / limit);
        const currentPage = parseInt(new URLSearchParams(window.location.search).get("page")) || 1;
        const paginationPart = document.getElementById("pagination");
        paginationPart.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.className = "page-button" + (i === currentPage ? " active" : "");
            button.textContent = i;
            button.addEventListener("click", () => {
                window.location.search = `?page=${i}`;
            });
            paginationPart.appendChild(button);
        }

    } catch (error) {
        console.log(error);
    }
}

async function getPostList() {
    const page = parseInt(new URLSearchParams(window.location.search).get("page")) || 1;
    const urlParams = new URLSearchParams(window.location.search);
    const limitParam = urlParams.get("limit") || "20";
    const limit = (limitParam === "all") ? (currentTotalPosts || 9999) : parseInt(limitParam);

    const formData = new FormData();
    formData.append("action", "posts");
    formData.append("page", page);
    formData.append("limit", limit);

    console.log("Limit on all:",limit);

    try {
        const response = await fetch("http://localhost/backend/services/postlistservice.php", {
            method: "POST",
            body: formData
        });

        var text = await response.text();
        console.log(text);
        var posts = JSON.parse(text);

        const names = posts.names.split(";");
        const ages = posts.ages.split(";");
        const thumbnails = posts.thumbnails.split(";");
        const ids = posts.ids.split(";");

        const anotherFormData = new FormData();
        anotherFormData.append('ids', ids.join(';'));
        anotherFormData.append('filter', filter);
        console.log("Filter: ", filter);
        try {
            const response = await fetch("http://localhost/backend/services/filteridservice.php", {
                method: "POST",
                body: anotherFormData
            });
            const result = await response.json();
            const newIds = result.data;


            const idIndexMap = {};
            ids.forEach((id, index) => {
                idIndexMap[id] = index;
            });

            const newNames = [];
            const newAges = [];
            const newThumbnails = [];
            const newIdsFinal = [];

            newIds.forEach((id) => {
                const index = idIndexMap[id];
                if (index !== undefined) {
                    newNames.push(names[index]);
                    newAges.push(ages[index]);
                    newThumbnails.push(thumbnails[index]);
                    newIdsFinal.push(ids[index]);
                }
            });
            names.length = 0;
            ages.length = 0;
            thumbnails.length = 0;
            ids.length = 0;

            Array.prototype.push.apply(names, newNames);
            Array.prototype.push.apply(ages, newAges);
            Array.prototype.push.apply(thumbnails, newThumbnails);
            Array.prototype.push.apply(ids, newIdsFinal);
        } catch (error) {
            console.log(error)
        }

        const container = document.getElementById("post-list");
        container.innerHTML = "";

        for (let i = 0; i < names.length; i++) {
            const card = document.createElement("div");
            card.className = "post-card";
            card.style.position = "relative";
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
            });

            const image = document.createElement("img");
            image.src = thumbnails[i] ? `/${thumbnails[i]}` : "/frontend/assets/No_Image_Available.jpg";
            image.alt = names[i];
            card.appendChild(image);

            const nameAge = document.createElement("h3");
            nameAge.textContent = `${names[i]}, ${ages[i]}`;
            card.appendChild(nameAge);

            const heartButton = document.createElement("button");
            heartButton.className = "heart-button";
            heartButton.innerText = "🤍";
            card.appendChild(heartButton);

            container.appendChild(card);

            const formData = new FormData();
            formData.append("action", "duplicate");
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
                if (result.trim() === "true") {
                    heartButton.classList.add("active");
                    heartButton.innerText = "❤️";
                }
            } catch (error) {
                console.log(error);
            }

            heartButton.addEventListener("click", async (event) => {
                event.stopPropagation();
                const token = getToken();
                if (!token) {
                    const popup = document.getElementById("wishlist-popup");
                    if (popup) popup.style.display = "flex";
                    return;
                }

                const isActive = heartButton.classList.toggle("active");
                heartButton.innerText = isActive ? "❤️" : "🤍";

                const formData = new FormData();
                formData.append("action", isActive ? "add" : "remove");
                formData.append("postId", ids[i]);

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
                    console.log(error);
                }
            });
        }

    } catch (error) {
        console.log(error);
    }
}

document.addEventListener("click", (event) => {
    const list = document.getElementById("search-list");
    const input = document.getElementById("search-input");

    if (!list.contains(event.target) && event.target !== input) {
        list.style.display = "none";
    }
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

    // Wishlist button
    document.querySelector('.wishlist').addEventListener('click', function () {
        window.location.href = '../pages/wishlist.html';
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

    // Forgot password link
    forgotPasswordLink.addEventListener('click', function (event) {
        event.preventDefault();
        loginTab.classList.remove('active');
        forgotPasswordTab.classList.add('active');
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

        // FUNCTIONALITY TO BE ADDED

    });

    // Login link
    forgotLoginLink.addEventListener('click', function (event) {
        event.preventDefault();
        forgotPasswordTab.classList.remove('active'); // Close forgot password tab
        loginTab.classList.add('active'); // Open login tab
        document.body.style.overflow = 'hidden'; // Keep body scroll disabled
    });

    //Posts tab whole logic and functionality (TO BE COPIED TO OTHER HEADERS)
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
