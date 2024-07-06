//edit in account info
function toggleEdit() {
  var editBtn = document.getElementById('edit-btn');
  var saveBtn = document.getElementById('save-btn');
  var inputs = document.querySelectorAll('input:not([type="submit"]), select');

  if (editBtn.innerText === 'Edit') {
    editBtn.innerText = 'Cancel';
    saveBtn.style.display = 'block';
    inputs.forEach(input => {
      input.removeAttribute('readonly');
    });
  } else {
    editBtn.innerText = 'Edit';
    saveBtn.style.display = 'none';
    inputs.forEach(input => {
      input.setAttribute('readonly', true);
    });
  }
}






