let speciesIdMap = {};
let mainThumbnailFile = null;
const additionalMediaFiles = [];

const tagsMedical = [];
const tagsFoodLikes = [];
const tagsFoodDislikes = [];

document.addEventListener("DOMContentLoaded", () => {
    setupTagInput("medicalInput", "medicalList", tagsMedical);
    setupTagInput("foodLikeInput", "foodLikeList", tagsFoodLikes);
    setupTagInput("foodDislikeInput", "foodDislikeList", tagsFoodDislikes);
    setupMediaUpload();
    setupBreedDropdownListener();
    fetchSpeciesOptions();
    fetchLocationOptions();

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

// Helper to get JWT token from localStorage, stolen from homepage.js
function getToken() {
    return localStorage.getItem('token');
}

async function extractData() {
    clearFormErrors();

    const formData = new FormData();
    let isFormInvalid = false;

    const inputName = document.getElementById('name');
    const selectSpecies = document.getElementById('species');
    const selectBreed = document.getElementById('breed');
    const inputBirthday = document.getElementById('birthday');
    const selectLocation = document.getElementById('location');
    const textDescription = document.getElementById('description');
    const selectSize = document.getElementById('size');
    const selectGender = document.getElementById('gender');

    const phoneNumber = localStorage.getItem('phone_number');

    if (!inputName.value.trim()) {
        showInputError(inputName, "Name is required.");
        isFormInvalid = true;
    }
    if (!selectSpecies.value.trim()) {
        showInputError(selectSpecies, "Please select a species.");
        isFormInvalid = true;
    }
    if (!selectBreed.disabled && !selectBreed.value.trim()) {
        showInputError(selectBreed, "Please select a breed.");
        isFormInvalid = true;
    }
    if (!inputBirthday.value.trim()) {
        showInputError(inputBirthday, "Please select a birthday.");
        isFormInvalid = true;
    }
    if (!selectLocation.value.trim()) {
        showInputError(selectLocation, "Please select a location.");
        isFormInvalid = true;
    }
    if (!textDescription.value.trim()) {
        showInputError(textDescription, "Please provide a description.");
        isFormInvalid = true;
    }
    if (!selectSize.value.trim()) {
        showInputError(selectSize, "Please provide the size of your pet");
        isFormInvalid = true;
    }
    if (!selectGender.value.trim()) {
        showInputError(selectGender, "Please provide the gender of your pet");
        isFormInvalid = true;
    }

    if (!mainThumbnailFile) {
        showInputError(document.getElementById('thumbBox'), "A main thumbnail is required.");
        isFormInvalid = true;
    } else {
        formData.append('thumbnail', mainThumbnailFile);
    }

    for (const file of additionalMediaFiles) {
        formData.append('media[]', file);
    }

    if (isFormInvalid) return;

    formData.append('name', inputName.value.trim());
    formData.append('species', selectSpecies.value.trim());
    formData.append('breed', selectBreed.value.trim());
    formData.append('birthday', inputBirthday.value.trim());
    formData.append('location', selectLocation.value.trim());
    formData.append('description', textDescription.value.trim());
    formData.append('size', selectSize.value.trim());
    formData.append('gender', selectGender.value.trim());

    formData.append('medical_tags', JSON.stringify(tagsMedical));
    formData.append('food_like_tags', JSON.stringify(tagsFoodLikes));
    formData.append('food_dislike_tags', JSON.stringify(tagsFoodDislikes));

    const token = getToken();

    try {

        console.log('----------------');
        console.log(phoneNumber);
        if (phoneNumber === null)
        {
            const msgDiv = document.getElementById("postMessage");
            msgDiv.textContent = "Complete you'r account before creating a post!";
            msgDiv.style.color = "red";
            localStorage.removeItem('phone_number');
            return;
        }
        localStorage.removeItem('phone_number');

        const response = await fetch("http://localhost/backend/services/createpostservice.php", {
            headers: {
                'Authorization': 'Bearer ' + token
            },
            method: "POST",
            body: formData
        });
        const serverResponse = await response.text();
        console.log(serverResponse);
        const serverResponseJSON = JSON.parse(serverResponse);

        if (serverResponseJSON.status === "succes") {
            const msgDiv = document.getElementById("postMessage");
            msgDiv.textContent = "You successfully created a post.";
            msgDiv.style.color = "green";
        } else {
            const msgDiv = document.getElementById("postMessage");
            msgDiv.textContent = "Failed to create post. Please try again.";
            msgDiv.style.color = "red";
        }
    } catch (error) {
        console.error(error);
    }
}



async function fetchSpeciesOptions() {
    const formData = new FormData();
    formData.append("action", "species");

    const response = await fetch("http://localhost/backend/services/newpostinfoservice.php", {
        method: "POST",
        body: formData
    });

    const { names, ids } = await response.json();
    const speciesSelect = document.getElementById("species");
    speciesSelect.innerHTML = '<option value="">-- Select species --</option>';

    names.forEach((speciesName, index) => {
        const option = document.createElement("option");
        option.textContent = speciesName;
        option.value = speciesName;
        speciesIdMap[speciesName] = ids[index];
        speciesSelect.appendChild(option);
    });
}

async function fetchLocationOptions() {
    try {
        const formData = new FormData();
        formData.append("action", "location");

        const response = await fetch("http://localhost/backend/services/newpostinfoservice.php", {
            method: "POST",
            body: formData
        });

        const locationList = await response.json();
        const locationSelect = document.getElementById("location");
        locationSelect.innerHTML = '<option value="">-- Select location --</option>';

        locationList.forEach(location => {
            const option = document.createElement("option");
            option.textContent = location;
            option.value = location;
            locationSelect.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

function setupBreedDropdownListener() {
    const speciesSelect = document.getElementById("species");
    const breedSelect = document.getElementById("breed");

    speciesSelect.addEventListener("change", async () => {
        const selectedSpecies = speciesSelect.value;
        const speciesId = speciesIdMap[selectedSpecies];

        breedSelect.innerHTML = "";
        breedSelect.disabled = true;

        if (!speciesId) {
            breedSelect.innerHTML = '<option value="">-- No breed options --</option>';
            return;
        }

        try {
            const formData = new FormData();
            formData.append("action", "breed");
            formData.append("species_id", speciesId);

            const response = await fetch("http://localhost/backend/services/newpostinfoservice.php", {
                method: "POST",
                body: formData
            });

            const breedList = await response.json();
            breedSelect.innerHTML = '<option value="">-- Select breed --</option>';

            breedList.forEach(breed => {
                const option = document.createElement("option");
                option.value = breed;
                option.textContent = breed;
                breedSelect.appendChild(option);
            });

            breedSelect.disabled = false;

        } catch (error) {
            console.error("Error loading breeds:", error);
        }
    });
}

function showInputError(element, message) {
    element.classList.add("input-error");

    const parentGroup = element.closest(".input-group") || element.parentElement;
    const existingError = parentGroup.querySelector(".error-message");

    if (!existingError) {
        const errorMsg = document.createElement("div");
        errorMsg.className = "error-message";
        errorMsg.textContent = message;
        parentGroup.appendChild(errorMsg);
    }
}

function clearFormErrors() {
    document.querySelectorAll(".input-error").forEach(input => input.classList.remove("input-error"));
    document.querySelectorAll(".error-message").forEach(msg => msg.remove());
}

function toggleSection(sectionId, iconId) {
    const section = document.getElementById(sectionId);
    const icon = document.getElementById(iconId);

    const isHidden = icon.textContent === '+';
    section.style.display = isHidden ? 'block' : 'none';
    icon.textContent = isHidden ? '-' : '+';
}

function toggleGeneralInformation() {
    toggleSection('postGeneralInformation', 'toggleIconGeneral');
}

function toggleDescriptionInformation() {
    toggleSection('postDescriptionInformation', 'toggleIconDescription');
}

function toggleMedia() {
    toggleSection('postMedia', 'toggleIconMedia');
}

function setupTagInput(inputId, containerId, tagsArray) {
    const inputField = document.getElementById(inputId);
    const tagContainer = document.getElementById(containerId);

    inputField.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && inputField.value.trim() !== "") {
            event.preventDefault();
            const tagValue = inputField.value.trim();

            if (tagsArray.includes(tagValue)) return;

            tagsArray.push(tagValue);

            const tagElement = document.createElement("div");
            tagElement.className = "tag";
            tagElement.textContent = tagValue;

            const removeButton = document.createElement("span");
            removeButton.className = "remove-btn";
            removeButton.textContent = "x";
            removeButton.onclick = () => {
                tagContainer.removeChild(tagElement);
                const index = tagsArray.indexOf(tagValue);
                if (index > -1) tagsArray.splice(index, 1);
            };

            tagElement.appendChild(removeButton);
            tagContainer.appendChild(tagElement);
            inputField.value = "";
        }
    });
}

function setupMediaUpload() {
    const thumbInput = document.getElementById("thumbInput");
    const thumbBox = document.getElementById("thumbBox");
    const mediaGrid = document.getElementById("mediaGrid");

    thumbBox.addEventListener("click", () => thumbInput.click());

    thumbInput.addEventListener("change", function () {
        mainThumbnailFile = this.files[0];
        previewUploadedMedia(this.files[0], thumbBox);
    });

    createMediaInputBox(mediaGrid);
}

function createMediaInputBox(container) {
    if (container.querySelectorAll(".upload-box.small").length >= 8) return;

    const mediaInput = document.createElement("input");
    mediaInput.type = "file";
    mediaInput.accept = "image/*,video/*";
    mediaInput.className = "file-input";

    const mediaBox = document.createElement("div");
    mediaBox.className = "upload-box small";

    mediaBox.addEventListener("click", () => mediaInput.click());

    mediaInput.addEventListener("change", function () {
        additionalMediaFiles.push(this.files[0]);
        previewUploadedMedia(this.files[0], mediaBox);
        createMediaInputBox(container);
    });

    mediaBox.appendChild(mediaInput);
    container.appendChild(mediaBox);
}

function previewUploadedMedia(file, container) {
    container.innerHTML = '';
    const fileReader = new FileReader();

    fileReader.onload = function (loadEvent) {
        let mediaElement;
        if (file.type.startsWith("video")) {
            mediaElement = document.createElement("video");
            mediaElement.src = loadEvent.target.result;
            mediaElement.controls = true;
        } else {
            mediaElement = document.createElement("img");
            mediaElement.src = loadEvent.target.result;
        }
        container.appendChild(mediaElement);
    };

    fileReader.readAsDataURL(file);
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

                localStorage.setItem('phone_number', userData.phone_number);
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
});