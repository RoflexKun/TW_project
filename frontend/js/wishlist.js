function getToken() {
    return localStorage.getItem('token');
}


document.addEventListener("DOMContentLoaded", () => {
    const sortToggle = document.getElementById("sortToggle");
    const sortLabel = document.getElementById("sortLabel");
    const sortArrow = document.getElementById("sortArrow");

    let isDescending = true;

    sortToggle.addEventListener("click", () => {
        isDescending = !isDescending;

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

    async function fetchWishlistPosts(){
        try{
            const token = getToken();
            const response = await fetch("http://localhost/backend/services/extractwishlist.php", {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const result = await response.json();

            const emptyMessage = document.getElementById("emptyMessage");
            const wishlistPostsContainer = document.getElementById("wishlistPosts");

            if (!result.posts || result.posts.length === 0) {
                if (emptyMessage) emptyMessage.style.display = "block";
            } else {
                if (emptyMessage) emptyMessage.style.display = "none";
               
            }
        }catch(error){
           console.log(error);
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