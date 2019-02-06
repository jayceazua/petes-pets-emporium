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
petsRouter.post('/api/pets', upload.single('avatarUrl'), (req, res, next) => {
  
  let pet = new Pet(req.body);
  pet.save((err) => {
    if (req.file) {

      client.upload(req.file.path, {/* options */}, (err, versions, meta) => {

        if (err) {return res.json({err})};

        versions.forEach((image) => {
          let urlArray = image.url.split('-');
          urlArray.pop();
          let url = urlArray.join('-');
          pet.avatarUrl = url;
          pet.save();
        });

        res.json({pet})

      });

    } else {
      res.json({pet})
    }
  })
});

// EDIT PET
petsRouter.get('/pets/:id/edit', (req, res) => {
  Pet.findById(req.params.id)
  .then((pet) => {
    res.render('pets-edit', { pet });
    // res.json({pet});
  })
  .catch((err) => res.json(err));
});

petsRouter.route('/api/pets/:id')
  // SHOW PET
  .get((req, res) => {
    Pet.findById(req.params.id)
    .then((pet) => {
      res.render('pets-show', { pet });
      // res.json({pet})
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

// SEARCH
app.get('/search', async (req, res) => {
  const page = req.query.page || 1;
  Pet.find({$text: {$search: req.query.term}}, {score: { $meta: "textScore"}}).sort({score: {$meta: 'textScore'}}).limit(20)
    .exec(function (err, pets) {
      if (err) {return res.json(err)}

      if (req.header('Content-Type') == 'application/json') {
        return res.json({
          pets: pets
        });
      } else {
        return res.render('pets-index', {
          pets: pets,
          term: req.query.term,
          currentPage: page
        });
      }
    });
/*
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

*/ 

});

// PURCHASE
petsRouter.post('/pets/:id/purchase', (req, res) => {
  console.log(req.body);
  // Set your secret key: remember to change this to your live secret key in production
  // See your keys here: https://dashboard.stripe.com/account/apikeys
  var stripe = require("stripe")(process.env.PRIVATE_STRIPE_API_KEY);

  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const token = req.body.stripeToken; // Using Express

  // req.body.petId can become null through seeding,
  // this way we'll insure we use a non-null value
  let petId = req.body.petId || req.params.id;

  Pet.findById(petId).exec((err, pet) => {
    if (err) {
      console.log('Error: ' + err);
      res.redirect(`/pets/${req.params.id}`);
    }
    const charge = stripe.charges.create({
        amount: pet.price * 100,
        currency: 'usd',
        description: `Purchased ${pet.name}, ${pet.species}`,
        source: token,
      }).then((chg) => {
        // Convert the amount back to dollars for ease in displaying in the template
        const user = {
          email: req.body.stripeEmail,
          amount: chg.amount / 100,
          petName: pet.name
        };
        // After we get the pet so we can grab it's name, then we send the email
        nodemailerMailgun.sendMail({
          from: 'no-reply@example.com',
          to: user.email, // An array if you have multiple recipients.
          subject: 'Pet Purchased!',
          template: {
            name: 'email.handlebars',
            engine: 'handlebars',
            context: user
          }
        }).then(info => {
          console.log('Response: ' + info);
          res.redirect(`/pets/${req.params.id}`);
        }).catch(err => {
          console.log('Error: ' + err);
          res.redirect(`/pets/${req.params.id}`);
        });
      })
      .catch(err => {
        console.log('Error: ' + err);
      });
  })
});

module.exports = petsRouter