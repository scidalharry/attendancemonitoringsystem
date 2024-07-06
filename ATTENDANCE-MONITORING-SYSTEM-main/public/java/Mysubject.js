function openEditModal(id, rfidCode, subject, section, day, start_time, end_time) {
    var modal = document.getElementById("editModal");
    document.getElementById("id").value = id;
    document.getElementById("editRfidCode").value = rfidCode;
    document.getElementById("subject").value = subject;
    document.getElementById("editSection").value = section;
    document.getElementById("editDays").value = day; //does not show
    document.getElementById("start-time").value = start_time;
    document.getElementById("end-time").value = end_time;
    modal.style.display = "block";
}

function closeEditModal() {
    var modal = document.getElementById("editModal");
    modal.style.display = "none";
}



  /////
  function deleteFunction(id) {
    if (confirm("Are you sure you want to delete this record?")) {
        fetch(`/deleteSubject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id }) // Include the id in the request body
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Assuming the server sends a simple success message
            // You can remove this parsing if the server sends no content or a different format
            return response.text(); // Parse response as text
        })
        .then(data => {
            // Handle success response
            console.log(data); // Log the success message or data received from the server
            // Reload or update the table
            // For example, reload the page
            window.location.reload();
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
    }
}





$(document).ready(function() {

    // Function to check if the RFID code exists in the table
    function populateRFID(response) {
      if (response.length > 0) {
        var rfidCode = response[0]; // Assuming you want to populate the first RFID code if there are multiple
        $('#editRfidCode').val(rfidCode);
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
    $('#edit-button').click(function() {
    
        // Call fetchRFID function when the modal button is clicked
        fetchRFID();
    
        // Call fetchRFID function every 5 seconds after the button is clicked
        intervalId = setInterval(fetchRFID, 1000);
      });
    });
      
    // Add click event listener to the close button of the modal
    $('#close').on('click', function() {
      clearInterval(intervalId);
    });




    
    //add subject modal in

// Get the modal element
var addSubjectModal = document.getElementById("addSubjectModal");

// Get the button that opens the modal
var addSubjectButton = document.getElementById("addSubjectButton");

// Get the <span> element that closes the modal
var closeAddSubjectModalBtn = document.getElementById("closeAddSubjectModal");

// When the user clicks the button, open the modal
addSubjectButton.onclick = function() {
    addSubjectModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
closeAddSubjectModalBtn.onclick = function() {
    addSubjectModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == addSubjectModal) {
        addSubjectModal.style.display = "none";
    }
}
//end niya han modal



$(document).ready(function() {

  // Function to check if the RFID code exists in the table
  function populateRFID(response) {
    if (response.length > 0) {
      var rfidCode = response[0]; // Assuming you want to populate the first RFID code if there are multiple
      $('#rfid_code').val(rfidCode);
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
  $('#addSubjectButton').click(function() {
  
      // Call fetchRFID function when the modal button is clicked
      fetchRFID();
  
      // Call fetchRFID function every 5 seconds after the button is clicked
      intervalId = setInterval(fetchRFID, 1000);
    });
  });
    
  // Add click event listener to the close button of the modal
  $('#closeAddSubjectModal  ').on('click', function() {
    clearInterval(intervalId);
  });
//days
  $(document).ready(function() {
    $('#days').select2({
      placeholder: "Select days",
      minimumResultsForSearch: Infinity, // Disable search field
      width: 'resolve'
    });
  });
  //edit days
  $(document).ready(function() {
    $('#editDays').select2({
      placeholder: "Select days",
      minimumResultsForSearch: Infinity, // Disable search field
      width: 'resolve'
    });
  });
//time to be 12 hour format with am and pm
//   function updateHiddenStartTime() {
//     var startTimeInput = document.getElementById('start-time').value;
//     var time = new Date("1970-01-01T" + startTimeInput);
//     var formattedTime = time.toLocaleTimeString('en-US', {hour12: true, hour: 'numeric', minute: 'numeric'});
//     document.getElementById('hidden-start-time').value = formattedTime;
// }

// function updateHiddenEndTime() {
//     var endTimeInput = document.getElementById('end-time').value;
//     var time = new Date("1970-01-01T" + endTimeInput);
//     var formattedTime = time.toLocaleTimeString('en-US', {hour12: true, hour: 'numeric', minute: 'numeric'});
//     document.getElementById('hidden-end-time').value = formattedTime;
// }