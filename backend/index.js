const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { log, error } = require('console');
const dotenv = require('dotenv');
const Description = require('./models/Description');
const { type } = require('os');
//
const stripe = require('stripe')('sk_test_51PBwnaSHpwiHugIPn6Ysw5y5mpWx51yz5unYIpBLxy60YXyUJ40oVnL4PqNrgicBplCH2XSA9c9Cxj6lvnvAzwtP00ncbR49oK');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

//
dotenv.config();
app.use(express.json());
app.use(cors());

//
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;
  
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'inr'
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
//

//Database Connection with MongoDB
mongoose.connect("mongodb+srv://vishal:root@cluster0.nnk0cdc.mongodb.net/e-commerce")

// Review Schema and Model
const reviewSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        required: true,
        default: '',
    },
    comment:{
        type: String,
        required: true,
    },
    date: { type: Date, default: Date.now },
  });
  const Review = mongoose.model('Review', reviewSchema);
  
  // Routes
  app.get('/description', async (req, res) => {
    try {
      const description = await Description.findOne();
      res.json(description);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  app.get('/reviews', async (req, res) => {
    try {
      const reviews = await Review.find();
      res.json(reviews);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
  
  app.post('/reviews', async (req, res) => {
    const { username, rating, comment } = req.body;
  
    try {
      const newReview = new Review({
        username,
        rating,
        comment,
      });
  
      await newReview.save();
      res.status(201).json(newReview);
    } catch (error) {
      res.status(500).send('Server Error');
    }
  });
    
//API Creation

app.get("/", (req, res) => {
    res.send("Express Server is running successfully");
})

//Image Storage Engine

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
       return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage: storage})

//Creating Upload Endpoints for Images
app.use('/images', express.static('upload/images'))

app.post('/upload', upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

//Schema for creating products
const Product = mongoose.model('Product', {
    id:{
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    size: {
        type: String,
        default: "No Size",    
    },
    description: {
        type: String,
        default: "No Description",
    },
    date:{
        type: Date,
        default: Date.now,
    },
    available:{
        type: Boolean,
        default: true,
    },
})

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
        available: req.body.available
    });
    console.log(product);
    await product.save();
    console.log("Product Added Successfully");
    res.json({
        success: true,
        name: req.body.name,
    });
})

//Creating API for deleting products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Product Deleted Successfully");
    res.json({
        success: true,
        name: req.body.name,
    })
})

// Creating API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema creating for User Model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
  
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now
    }
})

//Creating Endpoint for registering the user
app.post('/signup', async (req, res) =>{
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors:" An existing user found with same email ID"});
    }
    let cart ={}
    for (let i = 0; i < 300; i++) {
        cart[i]=0;        
    }
    const user =new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    })

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token});
})

// Creating Endpoint for User Login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }    
    const token = jwt.sign(data, 'secret_ecom');
    res.json({success:true, token});
        }
        else {
            res.json({success: false, errors: "Incorrect Password"})
        }
    }
    else {
        res.json({success: false, errors: "Wrong Email ID"})
    }
})

//Creating Endpoint for New Collection Data
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({
        category: { $nin: ['kid', 'accessory'] }
    });
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Data Fetched");
    res.send(newcollection);
})

//Creating Endpoint for Popular in Women
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({category: "women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in Women Fetched");
    res.send(popular_in_women);
})

// Creating middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        }
        catch (error) {
            res.status(401).send({ errors: "Please authenticate using a valid token" });
        }
    }
}
// Middleware to verify JWT token
// const verifyToken = (req, res, next) => {
//     const token = req.header('Authorization');
//     if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });
  
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded; // Attach user data to request object
//       next(); // Proceed to the next middleware
//     } catch (error) {
//       res.status(400).json({ message: 'Invalid token.' });
//     }
//   };
// Creating Endpoint for Adding Products to Cart
app.post('/addtocart',fetchUser, async (req, res) => {
    console.log("Added",req.body.itemId);
    //
   let userData = await Users.findOne({ _id: req.user.id });
   userData.cartData[req.body.itemId] += 1;
   await Users.findOneAndUpdate({ _id: req.user.id }, {cartData: userData.cartData})
   //
   res.send({success: true, message: "Item Added Successfully"});
})

//Creating Endpoint for Removing Products from Cart
app.post('/removefromcart',fetchUser, async (req, res) => {
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if(userData.cartData[req.body.itemId]>0){
        userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, {
        cartData: userData.cartData
    })
    res.send({success: true, message: "Item Removed Successfully"});
})

// Creating Endpoint for Fetching Cart Data
app.post('/getcart',fetchUser, async (req, res) => {
    console.log("Cart Data Fetched");
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);

})

app.listen(port, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Server is running on port " + port);
    }
})