let currentStep = 1;
function nextStep() {
    document.getElementById(`step${currentStep}`).style.display = "none";
    currentStep++;
    document.getElementById(`step${currentStep}`).style.display = "block";
}
function prevStep() {
    document.getElementById(`step${currentStep}`).style.display = "none";
    currentStep--;
    document.getElementById(`step${currentStep}`).style.display = "block";
}

function toggleStudentNumberField() {
    const userType = document.getElementById("usertype").value;
    const studentNumberField = document.getElementById("studentNumberField");
    const studentNumberInput = document.getElementById("student_number");

    if (userType === "faculty" || userType === "parent") {
        studentNumberField.style.display = "none";
        studentNumberInput.removeAttribute("required");
        studentNumberInput.placeholder = "";
    } else {
        studentNumberField.style.display = "block";
        studentNumberInput.setAttribute("required", true);
        studentNumberInput.placeholder = "Enter Student Number";
    }
}

var closeButton = document.querySelector(".close");

// Add click event listener to the close button
closeButton.addEventListener("click", function() {
    // Redirect to the login page
    window.location.href = "/";
});