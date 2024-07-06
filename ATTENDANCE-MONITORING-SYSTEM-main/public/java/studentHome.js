function openEditModal(id, rfidCode, studentNumber, studentName, year, section, subject, gender) {
    var modal = document.getElementById("editModal");
    document.getElementById("id").value = id;
    document.getElementById("editRfidCode").value = rfidCode;
    document.getElementById("editStudentNumber").value = studentNumber;
    document.getElementById("editStudentName").value = studentName;
    document.getElementById("editYear").value = year;
    document.getElementById("editSection").value = section;
    document.getElementById("editSubject").value = subject;
    document.getElementById("editGender").value = gender;
    modal.style.display = "block";
  }

  function closeEditModal() {
    var modal = document.getElementById("editModal");
    modal.style.display = "none";
  }



  /////

  function deleteFunction(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        fetch(`/delete/${id}`, {
            method: 'Post',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle success response
            console.log(data);
            // Reload or update the table
            // For example, reload the page
            window.location.reload();
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }
}





// Get the modal element
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById('top-right-button');

// Get the <span> element that closes the modal
var span = document.getElementById('closeModalBtn');

// When the user clicks the button, open the modal
btn.onclick = function() {
    modal.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}
// // JavaScript code to handle opening the modal and updating its content
// $(document).ready(function() {
//   $('#myModal').on('shown.bs.modal', function() {
//     // Make an AJAX request to get the RFID code
//     $.ajax({
//       type: 'POST',
//       url: '/attendance',
     
//       success: function(response) {
//         // Update the RFID input box with the received RFID code
//         $('#rfid').val(response.rfid_code);
//       },
//       error: function(xhr, status, error) {
//         console.error('Error:', error);
//       }
//     });
//   });
// });


///hover
function displayImage(imageSrc) {
    var popup = document.getElementById("image-popup");
    var popupImage = document.getElementById("popup-image");
    popupImage.src = imageSrc;
    popup.style.display = "block";
  }

  function hideImage() {
    var popup = document.getElementById("image-popup");
    popup.style.display = "none";
  }



  //filter by year and working search
  function filterTable() {
    var selectedYear = document.getElementById("yearFilter").value;
    var searchQuery = document.querySelector(".search-bar input").value.toLowerCase();
    var tableRows = document.getElementById("tableBody").getElementsByTagName("tr");

    for (var i = 0; i < tableRows.length; i++) {
      var row = tableRows[i];
      var shouldShowRow = false;

      // Loop through all cells in the row
      for (var j = 0; j < row.cells.length; j++) {
        var cellText = row.cells[j].textContent.toLowerCase();

        // Check if cell content contains the search query
        if (cellText.includes(searchQuery)) {
          shouldShowRow = true;
          break;
        }
      }

      // Check if the row matches the selected year
      if (shouldShowRow && (selectedYear === "all" || row.cells[3].textContent.toLowerCase().includes(selectedYear))) {
        row.style.display = ""; // Show the row
      } else {
        row.style.display = "none"; // Hide the row
      }
    }
  }

  // Initialize modalOpen as false initially
// var modalOpen = false;

// Add click event listener to the modal
// $('#top-right-button').on('click', function() {
//   // Set modalOpen to true when the modal is clicked
//   modalOpen = true;
//   console.log(modalOpen)
// });

// Add click event listener to the close button of the modal
// $('#closeModalBtn').on('click', function() {
//   // Set modalOpen back to false when the modal is closed
//   modalOpen = false;
//   console.log(modalOpen)
// });


// Use rfidCode in the AJAX request
// Get the value of the input field with id "rfid"
// var rfidCode = $('#rfid').val();

// Use rfidCode in the AJAX request
// $.ajax({
//   type: "POST",
//   url: "/attendance",
//   data: { rfid_code: rfidCode },
//   success: function(response) {
//     // Handle success if needed
   
//     console.log(response);
//   }
// });


$(document).ready(function() {

  // Function to check if the RFID code exists in the table
  function populateRFID(response) {
    if (response.length > 0) {
      var rfidCode = response[0]; // Assuming you want to populate the first RFID code if there are multiple
      $('#rfid').val(rfidCode);
    }
  }

  // Function to fetch RFID data
  function fetchRFID() {
    // Send request to server to fetch RFID data
    $.ajax({
      type: "GET",
      url: "/rfid",
      success: function(response) {
        // Handle success if needed
        populateRFID(response);
      }
    });
  }

  $('#top-right-button').click(function() {
    
    // Call fetchRFID function when the modal button is clicked
    fetchRFID();

    // Call fetchRFID function every 5 seconds after the button is clicked
    intervalId = setInterval(fetchRFID, 1000);
  });
});
  
// Add click event listener to the close button of the modal
$('#closeModalBtn').on('click', function() {
  clearInterval(intervalId);
});




// $(document).ready(function() {
//   // Assuming there's some event that triggers the AJAX request
//   // For example, a button click event
//   $('#top-right-button').click(function() {
//     // Send the attendance request directly to the server
//     $.ajax({
//       type: "POST",
//       url: "/attendance",
//       success: function(response) {
//         // Handle success if needed
//         console.log(response);
//         // Populate the input field with the received RFID code
//         $('#rfid').val(response.rfid_code);
//       },
//       error: function(xhr, status, error) {
//         // Handle error
//         console.log("Error:", error);
//       }
//     });
//   });
// });



// nabalhin na ngadto ha my subject ejs
//  //add subject modal in

// // Get the modal element
// var addSubjectModal = document.getElementById("addSubjectModal");

// // Get the button that opens the modal
// var addSubjectButton = document.getElementById("addSubjectButton");

// // Get the <span> element that closes the modal
// var closeAddSubjectModalBtn = document.getElementById("closeAddSubjectModal");

// // When the user clicks the button, open the modal
// addSubjectButton.onclick = function() {
//     addSubjectModal.style.display = "block";
// }

// // When the user clicks on <span> (x), close the modal
// closeAddSubjectModalBtn.onclick = function() {
//     addSubjectModal.style.display = "none";
// }

// // When the user clicks anywhere outside of the modal, close it
// window.onclick = function(event) {
//     if (event.target == addSubjectModal) {
//         addSubjectModal.style.display = "none";
//     }
// }
// //end niya han modal



// $(document).ready(function() {

//   // Function to check if the RFID code exists in the table
//   function populateRFID(response) {
//     if (response.length > 0) {
//       var rfidCode = response[0]; // Assuming you want to populate the first RFID code if there are multiple
//       $('#rfid_code').val(rfidCode);
//     }
//   }

//   // Function to fetch RFID data
//   function fetchRFID() {
//     // Send request to server to fetch RFID data
//     $.ajax({
//       type: "GET",
//       url: "/rfid",
//       success: function(response) {
//         // Handle success if needed
//         populateRFID(response);
//       }
//     });
//   }
//   $('#addSubjectButton').click(function() {
  
//       // Call fetchRFID function when the modal button is clicked
//       fetchRFID();
  
//       // Call fetchRFID function every 5 seconds after the button is clicked
//       intervalId = setInterval(fetchRFID, 1000);
//     });
//   });
    
//   // Add click event listener to the close button of the modal
//   $('#closeAddSubjectModal  ').on('click', function() {
//     clearInterval(intervalId);
//   });


// Get the modal
var modal1 = document.getElementById("uploadModal");

// Get the button that opens the modal
var add = document.getElementById("add-csv");

// Get the <span> element that closes the modal
var span1 = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
add.onclick = function() {
  modal1.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span1.onclick = function() {
  modal1.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal1.style.display = "none";
  }
}



$(document).ready(function() {

  // Function to check if the RFID code exists in the table
  function populateRFID(response) {
    if (response.length > 0) {
      var rfidCode = response[0]; // Assuming you want to populate the first RFID code if there are multiple
      $('#rfid').val(rfidCode);
    }
  }

  // Function to fetch RFID data
  function fetchRFID() {
    // Send request to server to fetch RFID data
    $.ajax({
      type: "GET",
      url: "/rfid",
      success: function(response) {
        // Handle success if needed
        populateRFID(response);
      }
    });
  }

  $('.edit-button').click(function() {
    
    // Call fetchRFID function when the modal button is clicked
    fetchRFID();

    // Call fetchRFID function every 5 seconds after the button is clicked
    intervalId = setInterval(fetchRFID, 1000);
  });
});
  
// Add click event listener to the close button of the modal
$('#closeEditBtn').on('click', function() {
  clearInterval(intervalId);
});