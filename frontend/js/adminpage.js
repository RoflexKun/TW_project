document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPage();
});

function initializeAdminPage() {
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '../pages/homepage.html'; // Adjust path as needed
        });
    }

    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const contentSections = document.querySelectorAll('.content-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
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

    initializeAdminForms();
}

function initializeAdminForms() {
    // Add admin form functionality
    const addAdminForm = document.getElementById('add-admin-form');
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddAdmin();
        });
    }

    // Search functionality
    const searchUsersBtn = document.getElementById('search-users-btn');
    if (searchUsersBtn) {
        searchUsersBtn.addEventListener('click', handleUserSearch);
    }

    const searchPostsBtn = document.getElementById('search-posts-btn');
    if (searchPostsBtn) {
        searchPostsBtn.addEventListener('click', handlePostSearch);
    }

    const filterTicketsBtn = document.getElementById('filter-tickets-btn');
    if (filterTicketsBtn) {
        filterTicketsBtn.addEventListener('click', handleTicketFilter);
    }
}

function handleAddAdmin() {
    const email = document.getElementById('admin-email').value;
    console.log('Adding admin:', email);
}

function handleUserSearch() {
    const searchTerm = document.getElementById('user-search').value;
    console.log('Searching users:', searchTerm);
}

function handlePostSearch() {
    const searchTerm = document.getElementById('post-search').value;
    console.log('Searching posts:', searchTerm);
}

function handleTicketFilter() {
    const status = document.getElementById('ticket-status').value;
    const type = document.getElementById('ticket-type').value;
    console.log('Filtering tickets:', status, type);
}