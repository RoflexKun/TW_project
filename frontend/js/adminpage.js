document.addEventListener('DOMContentLoaded', function () {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function () {
            window.location.href = '../pages/homepage.html';
        });
    }

    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function () {
            const targetSection = this.dataset.section;

            sidebarItems.forEach(sidebarItem => {
                sidebarItem.classList.remove('active');
            });

            this.classList.add('active');

            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            const targetSectionElement = document.getElementById(targetSection + '-section');
            if (targetSectionElement) {
                targetSectionElement.classList.add('active');
            }
        });
    });

    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', async function () {
            const currentSearch = this.value;
            try {
                const formData = new FormData();
                formData.append('search', currentSearch);
                const response = await fetch("http://localhost/backend/services/usersearchservice.php", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();
                console.log(result);
                if (result.data.name.length > 0)
                    displayUserResults(result.data);
                else {
                    const container = document.getElementById('user-results');
                    container.innerHTML = '';
                }

            } catch (error) {
                console.log(error);
            }
        });
    }
});

//Displays the search results users
function displayUserResults(users) {
    const container = document.getElementById('user-results');
    container.innerHTML = '';

    const names = users.name.split(';');
    const ids = users.id.split(';');
    const emails = users.email.split(';');
    const isAdmins = users.is_admin.split(';');

    for (let i = 0; i < names.length; i++) {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card');

        const userInfo = document.createElement('div');
        userInfo.classList.add('user-info');

        const userId = document.createElement('p');
        userId.classList.add('user-id');
        userId.textContent = `#${ids[i]}`;

        const userName = document.createElement('p');
        userName.textContent = names[i];

        const userEmail = document.createElement('p');
        userEmail.textContent = emails[i];

        userInfo.appendChild(userId);
        userInfo.appendChild(userName);
        userInfo.appendChild(userEmail);

        const userActions = document.createElement('div');
        userActions.classList.add('user-actions');

        const makeAdminBtn = document.createElement('button');
        makeAdminBtn.classList.add('make-admin');
        const isAdmin = isAdmins[i] === '1';
        makeAdminBtn.textContent = isAdmin ? 'Demote' : 'Make Admin';

        makeAdminBtn.addEventListener('click', async () => {
            const confirmMsg = isAdmin
                ? `Are you sure you want to demote ${names[i]}?`
                : `Are you sure you want to promote ${names[i]} to admin?`;
            if (!confirm(confirmMsg)) 
                return;

            const formData = new FormData();
            formData.append("id", ids[i]);
            formData.append("action", isAdmin ? "demote" : "add");

            try {
                const response = await fetch("http://localhost/backend/services/usermanagementservice.php", {
                    method: "POST",
                    body: formData
                });

                const result = await response.text();
                console.log(result);
                const searchInput = document.getElementById('user-search');
                if (searchInput) searchInput.value = '';
                const container = document.getElementById('user-results');
                container.innerHTML = '';
            } catch (error) {
                console.log(error);
            }
        });

        const deleteUserBtn = document.createElement('button');
        deleteUserBtn.classList.add('delete-user');
        deleteUserBtn.textContent = 'Delete';

        deleteUserBtn.addEventListener('click', async () => {
            if (!confirm(`Are you sure you want to delete ${names[i]}?`)) 
                return;

            const formData = new FormData();
            formData.append("id", ids[i]);
            formData.append("action", "delete");

            try {
                const response = await fetch("http://localhost/backend/services/usermanagementservice.php", {
                    method: "POST",
                    body: formData
                });

                const result = await response.text();
                console.log(result);
                const searchInput = document.getElementById('user-search');
                if (searchInput) searchInput.value = '';
                const container = document.getElementById('user-results');
                container.innerHTML = '';
            } catch (error) {
                console.log(error);
            }
        });

        userActions.appendChild(makeAdminBtn);
        userActions.appendChild(deleteUserBtn);
        userCard.appendChild(userInfo);
        userCard.appendChild(userActions);
        container.appendChild(userCard);
    }
}