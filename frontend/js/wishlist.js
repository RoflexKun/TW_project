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