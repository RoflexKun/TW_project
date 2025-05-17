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
});

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

    formData.append('medical_tags', JSON.stringify(tagsMedical));
    formData.append('food_like_tags', JSON.stringify(tagsFoodLikes));
    formData.append('food_dislike_tags', JSON.stringify(tagsFoodDislikes));

    try {
        const response = await fetch("http://localhost/backend/services/createpostservice.php", {
            method: "POST",
            body: formData
        });
        const serverResponse = await response.text();
        console.log(serverResponse);
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
