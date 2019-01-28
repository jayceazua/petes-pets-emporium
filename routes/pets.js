// MODELS
const petsRouter = require('express').Router();
const Pet = require('../models/pet');
// UPLOADING TO AWS S3
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');


// Config S3
const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'pets/avatar',
    region: process.env.S3_REGION,
    acl: 'public-read',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  }, {
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});
// PET ROUTES

  // INDEX PET => index.js

// NEW PET
petsRouter.get('/pets/new', (req, res) => {
  res.render('pets-new');
});

// CREATE PET 
petsRouter.post('/pets', upload.single('avatarUrl'), (req, res, next) => { // make sure all the places have the same name...
  
  var pet = new Pet(req.body);
  pet.save(function (err) {
    if (req.file) {
      client.upload(req.file.path, {}, function (err, versions, meta) {
        if (err) {
          return res.status(400).send({
            err: err
          })
        };

        versions.forEach(function (image) {
          var urlArray = image.url.split('-');
          urlArray.pop();
          var url = urlArray.join('-');
          pet.avatarUrl = url;
          pet.save();
        });

        res.send({pet})
      });
    } else {
      res.send({pet})
    }
  })
})

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
  .put((req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
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