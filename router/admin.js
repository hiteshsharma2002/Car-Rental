const express = require("express");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");

const bodyparser = require("body-parser");
const urlencoded = bodyparser.urlencoded({ extended: true });
const mong1 = require("../models/Mongo_Admin");
const router1 = express.Router();
const session = require("express-session");
const mong2 = require("../models/Mongo_Brand");
const mong3 = require("../models/Mongo_Vehicle");
const multer = require("multer");
const path = require("path");
const bookmong = require('../models/Mongo_Booking');

// middleware of session
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// admin login
router1.get("/adminLogin", function (req, res) {
  res.render("adminLogin");
});

router1.post("/adminLogin", urlencoded, async (req, res) => {
  try {
    const { name, pass, email } = req.body;

    const admin = await mong1.findOne({ name });

    if (!admin) {
      res.send("Admin with this name or password does not exist");
    }
    if (admin.pass === pass) {
      req.session.adminEmail = {
        name: admin.name,
        pass: admin.pass,
        email: admin.email,
      };
      // res.send('admin login successful');
      res.redirect(`/admin/admindashboard`);
    } else {
      res.send("incorrect password");
    }
  } catch (err) {
    res.send("cannot login at this time");
  }
});

router1.get("/admindashboard", function (req, res) {
  const { name, email } = req.session.adminEmail

  res.render("admindashboard", { name, email });
});

// update pssword

router1.post("/change-password", urlencoded, async (req, res) => {
  const { password, newPassword, confirmPassword } = req.body;

  if (!password || !newPassword || !confirmPassword) {
    return res.send("All fields are required");
  }

  if (newPassword !== confirmPassword) {
    return res.send("Password and confirm password must be same");
  }

  try {
    const adminn = await mong1.findOne({ pass: password });

    if (!adminn) {
      return res.send("Current password is wrong");
    } else {
      adminn.pass = newPassword;
      await adminn.save();

      res.render("admindashboard");
    }
  } catch (err) {
    res.send("An error occured during changing the password");
  }
});

// brand

router1.get("/brand/create", function (req, res) {
  res.render("admincreatebrand");
});

router1.post("/brand/add", urlencoded, async (req, res) => {
  try {
    const { brandname } = req.body;

    const newBrand = new mong2({
      brandname,
    });

    const savebrand = await newBrand.save();
    res.send("Brand saved successfully");
  } catch (err) {
    res.send(err.message);
  }
});

router1.get("/brand/manage", async (req, res) => {
  try {
    const data = await mong2.find();

    // return res.render("adminBrandtable", { data });
    res.json(data);
  } catch (err) {
    res.send(err.message);
  }
});

// delete of brand

router1.get("/delete/:id", async (req, res) => {
  try {
    await mong2.findByIdAndDelete(req.params.id);
    res.redirect("/admin/brand/manage");
  } catch (err) {
    console.log(err.message);
  }
});

// Route for editing brand
router1.get("/edit/:id", async (req, res) => {
  const user = await mong2.findById(req.params.id);
  res.render("adminBrandedit", { user });
});

//Update brand

router1.post("/edit/:id", urlencoded, async (req, res) => {
  const { brandname } = req.body;
  await mong2.findByIdAndUpdate(req.params.id, { brandname });
  res.redirect("/admin/brand/manage");
});

// vehicles

router1.get("/vehicle/post", async (req, res) => {
  const data2 = await mong2.find();

  res.render("adminvehiclepost", { data2, msg: "" });
});

// multer

const mystorage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: mystorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const fileType = /jpeg|jpg|png|gif/;
    const extname = fileType.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileType.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed in these format"));
    }
  },
});

router1.post(
  "/vehiclep",
  urlencoded,
  upload.array("image", 5),
  async (req, res) => {
    try {
      const { title, car, over, price, fuel, carmodel, seating } = req.body;

      // Map through req.files to store all file paths
      const imagePath = req.files.map((file) => `/uploads/${file.filename}`);

      const newvehicle = new mong3({
        title,
        car,
        over,
        price,
        fuel,
        carmodel,
        seating,
        image: imagePath,
      });

      await newvehicle.save();
      // res.send('Vehicle saved successfully');
      const data2 = await mong2.find();

      res.render("adminvehiclepost", {
        data2,
        msg: "Files uploaded successfully!",
      });
    } catch (err) {
      res.send(err.message);
    }
  }
);

// router1.get("/vehicle/manage", async (req, res) => {
//   const vehdata = await mong3.find();

//   return res.render("adminvehicletable", { vehdata });
// });

// --------------------- search vehicle start -----------------------------------

router1.get('/apivehicle/manage', async (req, res) => {
  try {
    let query = {}; // Default: fetch all vehicles

    if (req.query.search) {
      query.title = { $regex: new RegExp(req.query.search, "i") }; // Case-insensitive search
    }

    const vehdata = await mong3.find(query); // Fetch vehicles from MongoDB
    // res.render('adminvehicletable', { vehdata, searchQuery: req.query.search || "" });
    res.json(vehdata);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
});


router1.get('/vehicle/manage', async (req, res) => {
  try {
    let query = {}; // Default: fetch all vehicles

    if (req.query.search) {
      query.title = { $regex: new RegExp(req.query.search, "i") }; // Case-insensitive search
    }

    const vehdata = await mong3.find(query); // Fetch vehicles from MongoDB
    res.render('adminvehicletable', { vehdata, searchQuery: req.query.search || "" });
    // res.json(vehdata);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).send("Internal Server Error");
  }
});


// --------------------- search vehicle end -----------------------------------

// delete vehicle

router1.get("/deleteveh/:id", async (req, res) => {
  try {
    await mong3.findByIdAndDelete(req.params.id);
    return res.redirect("/admin/vehicle/manage");
  } catch (err) {
    res.send(err);
  }
});

// edit vehicle

router1.get("/editveh/:id", async (req, res) => {
  const vehdata2 = await mong3.findById(req.params.id);

  const brand = await mong2.find();
  res.render("adminvehicleedit", { vehdata2, brand });
});

// update vehicle

router1.post("/editvehicle/:id", urlencoded, async (req, res) => {
  try {
    console.log(req.params.id);
    const { title, price, over, fuel, carmodel, seating } = req.body;
    console.log("Received Data:", req.body); // Debugging

    await mong3.findByIdAndUpdate(req.params.id, {
      title,
      price,
      over,
      fuel,
      carmodel,
      seating,
    });

    return res.redirect("/admin/vehicle/manage");
  } catch (err) {
    res.send(err.message);
  }
});

//-------------------- edit vehicle image start -----------------------------------

// Route to display the edit image form
router1.get("/update-img/:imgid/:imgindex", async (req, res) => {
  try {
    const { imgid, imgindex } = req.params;

    const vehicleid = await mong3.findById(imgid);

    if (!vehicleid) {
      res.send("vehicle does'nt found");
    }

    const vehicleindex = vehicleid.image[imgindex];
    if (!vehicleindex) {
      res.send("image not found");
    }

    res.render("editimage", { imgid, imgindex, vehicleindex });
  } catch (err) {
    res.send(err.message);
  }
});

router1.post(
  "/update-image/:imgid/:imgindex",
  upload.single("file"),
  urlencoded,
  async (req, res) => {
    const { imgid, imgindex } = req.params;
    const file = req.file;

    if (!file) {
      res.send("no file uploaded");
    }

    try {
      const veh = await mong3.findById(imgid);

      if (!veh) {
        return res.send("no vehicle found");
      }
      if (!veh.image[imgindex]) {
        return res.send("no vehicle image found");
      }

      const newimagepath = `/uploads/${file.filename}`;
      veh.image[imgindex] = newimagepath;

      await veh.save();
      return res.send("image updated successfully");
    } catch (err) {
      res.send(err.message);
    }
  }
);

//-------------------- edit vehicle image end -----------------------------------

// -------------------- delete vehicle image start -----------------------------------

router1.get("/delete-image/:imgid/:imgindex", async (req, res) => {
  try {
    const { imgid, imgindex } = req.params;

    const vehdata2 = await mong3.findById(imgid);

    if (!vehdata2) {
      res.send("cannot find vehicle");
    }

    vehdata2.image.splice(imgindex, 1);

    await vehdata2.save();
    const brand = await mong2.find();
    // return res.send('deleted successfuly');
    res.render("adminvehicleedit", { vehdata2, brand });
  } catch (err) {
    console.log(err.message);
  }
});

// -------------------- delete vehicle image end -----------------------------------

// -----------------------add new images start -------------------------------------

const uploads = multer({
  storage: mystorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const fileType = /jpeg|jpg|png|gif/;
    const extname = fileType.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileType.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed in these format"));
    }
  },
});


router1.post('/add-image/:newid', uploads.array('addImage', 10), urlencoded, async (req, res) => {
  
  try {
    const { newid } = req.params;

    const newvehicle = await mong3.findById(newid);
    const brand = await mong2.find();

    if (!newvehicle) {
      return res.send('vehicle not found');
    }

    const newImagePath = req.files.map((file) => `/uploads/${file.filename}`);

    newvehicle.image.push(...newImagePath);
    await newvehicle.save();

    res.render('adminvehicleedit', { vehdata2:newvehicle,brand });
  }

  catch (err) {
    res.send(err.message);
  }

})

// -----------------------add new images end -------------------------------------



// ------------------------ signout start --------------------------------

router1.get('/signout', function (req, res) {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.send('cannot logout');
    }
    res.render('adminLogin');
  })
  

})

// ------------------------ signout end --------------------------------


// ------------------------------------- bookings start------------------------

router1.post('/booking', async (req, res) => {
  
  try {
    
  const { from, to, message, vehicle,fname } = req.body;
  
  const newBooking = new bookmong({
    from, to, message, vehicle, fname, status: 'not confirmed yet', postdate: new Date(),
  
  })

  await newBooking.save();
  res.json({message:'Booking saved successfully'});
  }
  catch (err) {
    console.log(err);
  }

})

router1.get("/bookings", async (req, res) => {
  try {
    const bookings = await bookmong.find(); 
    res.render("bookingtable", { bookings }); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

router1.get("/apibookings", async (req, res) => {
  try {
    const bookings = await bookmong.find(); 
    res.json( bookings ); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});


router1.post('/update-booking/:id',urlencoded, async(req, res) => {
  
  try {
    const { status } = req.body;

    const update = await bookmong.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );

    res.redirect('/admin/bookings');
  }
  catch (err) {
    console.log('An error occured');
  }

})


// ------------------------------------- bookings start------------------------






module.exports = router1;
