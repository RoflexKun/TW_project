async function getPostCount() {
    const formData = new FormData();
    formData.append("action", "count");

    try{
        var response = await fetch("http://localhost/backend/services/postlistservice.php", {
            method: 'POST',
            body: formData
        });

        var text = await response.text();
        var result = JSON.parse(text);
        const totalPosts = result.count;

        const totalPages = Math.ceil(totalPosts / 20);
        const currentPage = parseInt(new URLSearchParams(window.location.search).get("page")) || 1;
        const paginationPart = document.getElementById("pagination");
        paginationPart.innerHTML = "";

        for(let i = 1; i <= totalPages; i++){
            const button = document.createElement("button");
            button.className = "page-button" + (i === currentPage ? " active" : "");
            button.textContent = i;
            button.addEventListener("click", () => {
                window.location.search = `?page=${i}`;
            });
            paginationPart.appendChild(button);
        }

    }catch(error){
        console.log(error);
    }
}

async function getPostList() {
    const page = parseInt(new URLSearchParams(window.location.search).get("page")) || 1;
    const formData = new FormData();
    formData.append("action", "posts");
    formData.append("page", page);

    try{
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

        const container = document.getElementById("post-list");
        container.innerHTML = "";

        for(let i = 0; i < names.length; i++){
            

            const card = document.createElement("div");
            card.className = "post-card";

            const image = document.createElement("img");
            image.src = thumbnails[i] ? `/${thumbnails[i]}` : "/frontend/assets/No_Image_Available.jpg";
            image.alt = names[i]
            card.appendChild(image);

            const nameAge = document.createElement("h3");
            nameAge.textContent = `${names[i]}, ${ages[i]}`;
            card.appendChild(nameAge);

            container.appendChild(card);
        }
            

        
    }catch(error){
        console.log(error);
    }
}

getPostCount();
getPostList();