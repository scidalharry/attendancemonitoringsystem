// const dataTableBody = document.querySelector('#data-table tbody');

// window.onload = function () {
//   fetch('/data')
//     .then(response => response.json())
//     .then(data => {

//       console.log(data);

//       data.row.forEach(row => {
//         const time = row.time;
//         const date = row.date;
//         const fullname = row.fullname;
//         const year = row.year;
//         const section = row.section;
//         const studentNumber = row.student_number;

//         const newRow = document.createElement('tr');

//         const timeCell = document.createElement('td');
//         timeCell.textContent = time;
//         const dateCell = document.createElement('td');
//         dateCell.textContent = date;
//         const fullnameCell = document.createElement('td');
//         fullnameCell.textContent = fullname;
//         const yearSectionCell = document.createElement('td');
//         yearSectionCell.textContent = `${year} ${section}`; // Concatenate year and section
//         const studentNumberCell = document.createElement('td');
//         studentNumberCell.textContent = studentNumber;

//         newRow.appendChild(timeCell);
//         newRow.appendChild(dateCell);
//         newRow.appendChild(fullnameCell);
//         newRow.appendChild(yearSectionCell);
//         newRow.appendChild(studentNumberCell);

//         dataTableBody.appendChild(newRow);
//       });
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// };






function downloadExcel() {
  const tableHtml = document.querySelector('.content-table table').outerHTML;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'attendance_data.xls';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}


function clearTable() {
  // Display a confirmation dialog
  const isConfirmed = confirm('Are you sure you want to clear the database?');

  if (isConfirmed) {
    // Make an HTTP request to the server endpoint that clears the database
    fetch('/clearData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        // Clear the table on the client side
        const tbody = document.querySelector('.content-table tbody');
        while (tbody.firstChild) {
          tbody.removeChild(tbody.firstChild);
        }
        console.log('Database cleared successfully');
      })
      .catch(error => {
        console.error('Error clearing database:', error);
      });
  }
}
