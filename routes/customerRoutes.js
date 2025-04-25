const express = require('express');
const { registerCustomer, loginCustomer, getCustomerProfile, updateCustomerProfile } = require('../controllers/customerController');

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", getCustomerProfile);
router.put('/profile', updateCustomerProfile);

module.exports = router;