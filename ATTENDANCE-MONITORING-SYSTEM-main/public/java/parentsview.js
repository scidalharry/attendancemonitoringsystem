var modal = document.getElementById("myModal");
    
    // Get the button that opens the modal
    var openModalBtn = document.getElementById("openModalBtn");
    
    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];
    
    // When the user clicks the button, open the modal 
    openModalBtn.onclick = function() {
      modal.style.display = "block";
    }
    
    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }
    
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
    
    // Function to handle the submission of the student number
    document.getElementById("submitStudentNumber").addEventListener("click", function() {
      var studentNumber = document.getElementById("studentNumberInput").value;
      alert("You entered student number: " + studentNumber);
      modal.style.display = "none"; // Close the modal after submission
    });

    // Get the back button element
var backButton = document.getElementById("backButton");

// When the back button is clicked, close the modal
backButton.onclick = function() {
  document.getElementById("myModal").style.display = "none";
}

///edit pa   //okay na
function submitForm() {
  var selectElement = document.getElementById("filter");
  var selectedStudentNumber = selectElement.options[selectElement.selectedIndex].dataset.studentNumber;
  document.getElementById("studentId").value = selectedStudentNumber; // Set the value of hidden input field
  document.getElementById("filterForm").submit();
}
