async function extractPostInfo(){
    const URLparams = new URLSearchParams(window.location.search);
    const postId = URLparams.get('id');
    
    const formData = new FormData();
    formData.append('id', postId);
    
    try{
        var response = await fetch('http://localhost/database/extractPostInfo.php', {
            method: 'POST',
            body: formData
        });
        
        var text = await response.text();
        var result = JSON.parse(text);

        if(result.error){
            console.log(result.error);
            return;
        }
        else{
            document.getElementById('pet-name').textContent = result.name;
            document.getElementById('pet-species').textContent = result.species;
            document.getElementById('pet-breed').textContent = result.breed;
            document.getElementById('pet-birthday').textContent = result.birthday;
            document.getElementById('pet-age').textContent = result.age;
            document.getElementById('pet-location').textContent = result.location;

            const mediaSection = document.querySelector('.photo-section');
            const mediaArray = result.media_array.split(';');

            const photoExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'jfif'];
            const videoExt = ['mp4', 'webm'];
            
            mediaArray.forEach(file_path => {
                console.log(file_path);
                file_path = file_path.trim();
                const extension = file_path.split('.').pop().toLowerCase();
                if(photoExt.includes(extension)){
                    const img = document.createElement('img');
                    img.src = `/${file_path}`;
                    mediaSection.appendChild(img);
                }
                else if(videoExt.includes(extension)){
                    const video = document.createElement('video');
                    video.src = `/${file_path}`;
                    mediaSection.appendChild(video);
                }
            })

        }
 
    }
    catch(error){
        console.log(error);
    }
}


extractPostInfo();

