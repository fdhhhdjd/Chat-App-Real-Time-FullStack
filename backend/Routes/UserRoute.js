const userCtrl = require("../Controllers/userController");
const router = require("express").Router();
//!User
//Register
router.post("/register", userCtrl.register);

module.exports = router;
