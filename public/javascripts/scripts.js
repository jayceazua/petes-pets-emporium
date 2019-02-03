// CREATE 
if (document.querySelector('#new-pet')) {
  document.querySelector('#new-pet').addEventListener('submit', (e) => {
    e.preventDefault();
    // Use FormData to grab everything now that we have files mixed in with text
    var form = document.getElementById("new-pet");
    var pet = new FormData(form);
    console.log(pet)
    // Assign the multipart/form-data headers to axios does a proper post
    axios.post('/pets', pet, {
        headers: {
          'Content-Type': 'multipart/form-data;',
        }
      })
      .then(function (response) {
        window.location.replace(`/pets/${response.data.pet._id}`);
      })
      .catch(function (error) {
        const alert = document.getElementById('alert')
        alert.classList.add('alert-warning');
        alert.textContent = `Error message: ${error}`
        alert.style.display = 'block';

        setTimeout(() => {
          alert.style.display = 'none';
          alert.classList.remove('alert-warning');
        }, 3000)

      });
  });
}


// UPDATE
if (document.querySelector('#update-pet')) {
  document.querySelector('#update-pet').addEventListener('submit', (e) => {
    
    e.preventDefault();
    var form = document.getElementById('update-pet');
    var pet = new FormData(form);

    axios.put(`/pets/${pet._id}`, pet, {
      headers: {
        'Content-Type': 'multipart/form-data;'
      }
    })
    .then((response) => {
      // The way to reroute: res.redirect()
      window.location.replace(`/pets/${response.data.pet._id}`);

    })
    .catch((err) => {

      const alert = document.getElementById('alert');
      alert.classList.add('alert-warning');
      alert.textContent = `Error message: ${err}`;
      alert.style.display = 'block';

      setTimeout(() => {
        alert.style.display = 'none';
        alert.classList.remove('alert-warning');
      }, 3000)

    })

  })
}