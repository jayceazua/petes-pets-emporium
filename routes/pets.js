// MODELS
const petsRouter = require('express').Router();
const Pet = require('../models/pet');
// UPLOADING TO AWS S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// S3 Config 
const { client } = require('../middleware/s3_client');

// PET ROUTES

  // INDEX PET => index.js

// NEW PET
petsRouter.get('/pets/new', (req, res) => {
  res.render('pets-new');
});

// CREATE PET 
petsRouter.post('/pets', upload.single('avatarUrl'), (req, res, next) => {
  
  let pet = new Pet(req.body);
  pet.save((err) => {
    if (req.file) {

      client.upload(req.file.path, {/* options */}, (err, versions, meta) => {

        if (err) {return res.status(400).send({err})};

        versions.forEach((image) => {
          let urlArray = image.url.split('-');
          urlArray.pop();
          let url = urlArray.join('-');
          pet.avatarUrl = url;
          pet.save();
        });

        res.send({pet})

      });

    } else {
      res.send({pet})
    }
  })
});

// EDIT PET
petsRouter.get('/pets/:id/edit', (req, res) => {
  Pet.findById(req.params.id)
  .then((pet) => {
    res.render('pets-edit', { pet });
  })
  .catch((err) => res.send(err));
});

petsRouter.route('/pets/:id')
  // SHOW PET
  .get((req, res) => {
    Pet.findById(req.params.id)
    .then((pet) => {
      res.render('pets-show', { pet });
    })
    .catch((err) => { res.send(err) });
  })
  // UPDATE PET
  .put(upload.single('avatarUrl'), (req, res, next) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        return res.redirect(`/pets/${req.params.id}`);
            // if (req.file) {
            //   client.upload(req.file.path, {/* options */ }, (err, versions, meta) => {
            //     if (err) {return res.status(400).send({err})};
            //     versions.forEach((image) => {
            //       let urlArray = image.url.split('-');
            //       urlArray.pop();
            //       let url = urlArray.join('-');
            //       pet.avatarUrl = url;
            //       pet.save();
            //     });
            //     res.send({pet})
            //   });
            // } else {
            //   res.send({pet})
            // }
      })
      .catch((err) => {res.send(err)});
  })
  // DELETE PET
  .delete((req, res) => {
    Pet.findByIdAndRemove(req.params.id)
    .then((pet) => {
      return res.redirect('/');
    })
    .catch((err) => res.send(err));
  });

// SEARCH PET
petsRouter.get('/search', (req, res) => {
  const page = req.query.page || 1;
  const term = new RegExp(req.query.term, 'i');

  Pet.paginate({ 
    $or: [
      {'name': term},
      {'species': term}
    ]
  })
  .then((results) => {
    res.render('pets-index', { 
      pets: results.docs,
      pagesCount: results.pages,
      currentPage: page,
      term: req.query.term
    });
  })
  .catch((err) => { res.json(err) });
});


  module.exports = petsRouter