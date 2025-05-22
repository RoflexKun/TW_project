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