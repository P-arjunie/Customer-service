const express = require('express');
const { registerCustomer, loginCustomer, getCustomerProfile } = require('../controllers/customerController');

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", getCustomerProfile);

module.exports = router;