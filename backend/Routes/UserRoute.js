const userCtrl = require("../Controllers/userController");
const router = require("express").Router();
//!User

//Register
router.post("/register", userCtrl.register);

//Login
router.post("/login", userCtrl.Login);

//Get All User Id
router.get("/getall/:id", userCtrl.GetIdUsers);

//Logout
router.get("/logout/:id", userCtrl.Logout);

//Choose Image
router.post("/setavatar/:id", userCtrl.setAvatar);
module.exports = router;
