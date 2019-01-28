const indexRoute = require('express').Router();
const Pet = require('../models/pet');

/* GET home page. */
indexRoute.get('/', (req, res) => {
  const page = req.query.page || 1;

  Pet.paginate({}, {page}).then((results) => {
    console.log(page)
    res.render('pets-index', { 
      pets: results.docs, 
      pagesCount: results.pages,
      currentPage: page
    });
  })
  .catch((err) => { res.send(err.message) });
});


module.exports = indexRoute