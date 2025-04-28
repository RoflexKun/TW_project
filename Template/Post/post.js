const URLparams = new URLSearchParams(window.location.search);
const postId = URLparams.get('id');

const formData = new FormData();
formData.append(postId)

fetch('extractPostInfo.php', {
    method: 'POST',
    body: formData
})
