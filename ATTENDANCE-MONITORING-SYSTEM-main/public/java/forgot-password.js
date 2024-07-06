document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.forgot-password-container form');
    const resetTokenContainer = document.querySelector('.reset-token-container');
    const passwordResetContainer = document.querySelector('.password-reset-container');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Hide the email input form
        form.style.display = 'none';
        // Show the reset token input form
        resetTokenContainer.style.display = 'block';
    });

    // Assuming there's some logic to verify the token and show the password reset form
    // I'll simulate that with a button click
    const continueButton = document.querySelector('.reset-token-container button');
    continueButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Assuming token verification is successful
        // Hide the reset token input form
        resetTokenContainer.style.display = 'none';
        // Show the password reset form
        passwordResetContainer.style.display = 'block';
    });
});
