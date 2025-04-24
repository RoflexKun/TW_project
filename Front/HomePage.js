document.addEventListener('DOMContentLoaded', function () {
    // Toggle dropdown menu when "All about pets" button is clicked
    const petsButton = document.querySelector('.pets-button-container');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const arrowIcon = document.querySelector('.arrow-icon');

    petsButton.addEventListener('click', function (event) {
        event.stopPropagation();
        dropdownMenu.classList.toggle('active');
        arrowIcon.classList.toggle('active');

        // Log for debugging
        console.log("Dropdown clicked, active status:", dropdownMenu.classList.contains('active'));
    });

    // Close dropdown when clicking outside
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
            alert('You selected: ' + this.textContent);
            dropdownMenu.classList.remove('active');
            arrowIcon.classList.remove('active');
        });
    });

    // Other button handlers
    document.querySelector('.login-button').addEventListener('click', function () {
        // Placeholder
        alert('Login functionality would go here');
    });

    document.querySelector('.wishlist').addEventListener('click', function () {
        // Placeholder
        alert('Wishlist would open here');
    });

     // Species and breed filtering logic
     const speciesSelect = document.getElementById('species-select');
     const breedSelect = document.getElementById('breed-select');
     
     // Define breeds for each species
     const breedsBySpecies = {
         "": [{ value: "", text: "Any" }], // For "Any" species
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
     
     // Function to update breed options based on selected species
     function updateBreedOptions(selectedSpecies) {
         // Clear current options
         breedSelect.innerHTML = '';
         
         // Get breeds for selected species
         const breeds = breedsBySpecies[selectedSpecies] || breedsBySpecies[""];
         
         // Add new options
         breeds.forEach(breed => {
             const option = document.createElement('option');
             option.value = breed.value;
             option.textContent = breed.text;
             breedSelect.appendChild(option);
         });
         
         // Enable/disable the breed select based on species selection
         if (selectedSpecies == "") {
             breedSelect.disabled = true;
         } else {
             breedSelect.disabled = false;
         }
     }
     
     // Initialize breed options
     updateBreedOptions(speciesSelect.value);
     
     // Add event listener for species change
     speciesSelect.addEventListener('change', function() {
         updateBreedOptions(this.value);
     });

    // Pet filter functionality
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

            const filterSummary = `
                Selected Filters:
                - Species: ${species || 'Any'}
                - Breed: ${breed || 'Any'}
                - Age: ${age || 'Any'}
                - Size: ${size || 'Any'}
                - Gender: ${gender || 'Any'}
                - Good With: ${goodWith || 'Any'}
                - Coat Length: ${coatLength || 'Any'}
            `;

            // Placeholder
            alert(filterSummary);

            // Placeholder
            console.log('Search filters applied:', {
                species, breed, age, size, gender, goodWith, coatLength
            });
        });
    }
});