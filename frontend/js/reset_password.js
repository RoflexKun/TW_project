document.addEventListener('DOMContentLoaded', () => {
    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const resetButton = document.getElementById('resetButton');
    const message = document.getElementById('message');

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    resetButton.addEventListener('click', async () => {
        const newPass = newPassword.value.trim();
        const confirmPass = confirmPassword.value.trim();

        message.style.color = 'red';

        if (!newPass || !confirmPass) {
            message.textContent = 'Please fill in both fields.';
            return;
        }

        if (newPass !== confirmPass) {
            message.textContent = 'Passwords do not match.';
            return;
        }

        if (newPass.length < 6) {
            message.textContent = 'Password must be at least 6 characters.';
            return;
        }

        const formData = new FormData();
        formData.append('token', token);
        formData.append('new_pass', newPass);
        try {
            const response = await fetch('http://localhost/backend/services/resetpasswordservice.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            console.log(result);

            if (result.status === true) {
                message.style.color = 'green';
                message.textContent = 'Password reset successful!';
                setTimeout(() => {
                    window.location.href = '/frontend/pages/HomePage.html';
                }, 2000);
            } else {
                message.textContent = 'Something went wrong.';
            }
        } catch (error) {
            console.log(error);
        }
    });
});
