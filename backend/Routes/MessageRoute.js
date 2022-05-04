const MessageCtrl = require("../Controllers/MessageController");
const router = require("express").Router();
//!Message

//Get Message
router.post("/getmessage", MessageCtrl.GetAllMessage);
//ADD Message
router.post("/send", MessageCtrl.AddMessageMongo);
module.exports = router;
