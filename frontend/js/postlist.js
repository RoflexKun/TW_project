getPostCount();
getPostList();

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("search-input");

    input.addEventListener("input", () => {
        const searchText = input.value;
        console.log("User typed:", searchText);
        getSearchResults(searchText);
    });
})

async function getSearchResults(searchText){
    const formData = new FormData();
    formData.append("searchText", searchText);

    const list = document.getElementById("search-list");

    if(searchText.trim() === ""){
        list.innerHTML = "";
        list.style.display = "none";
        return;
    }

    try{
        var response = await fetch("http://localhost/backend/services/searchservice.php", {
            method: 'POST',
            body: formData
        });

        var text = await response.text();
        console.log(text);
        var result = JSON.parse(text);

        if(parseInt(result.counter) === 0){
            list.innerHTML = "<div class='list-item'>No companions found</div>";
            list.style.display = "block";
            return;
        }

        const names = result.name.split(";");
        const ids = result.id.split(";");
        const ages = result.age.split(";");

        list.innerHTML = "";

        const showCount = Math.min(names.length, 5);
        for(let i = 0; i < showCount; i++){
            const item = document.createElement("div");
            item.className = "list-item";
            item.textContent = `${names[i]}, ${ages[i]}`;
            item.addEventListener("click", () => {
                window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
            });
            list.appendChild(item);
        }

        if(names.length > 5){
            const more = document.createElement("div");
            more.className = "list-footer";
            more.textContent = `... and ${names.length - 5} other companions found`;
            list.appendChild(more);
        }

        list.style.display = "block";
    }catch(error){
        console.log(error);
    }
}

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
        const ids = posts.ids.split(";");

        const container = document.getElementById("post-list");
        container.innerHTML = "";

        for(let i = 0; i < names.length; i++){
        
            const card = document.createElement("div");
            card.className = "post-card";
            card.style.cursor = "pointer";
            card.addEventListener("click", () => {
                window.location.href = `/frontend/pages/post.html?id=${ids[i]}`;
            })

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

document.addEventListener("click", (event) => {
    const list = document.getElementById("search-list");
    const input = document.getElementById("search-input");

    if (!list.contains(event.target) && event.target !== input) {
        list.style.display = "none";
    }
});