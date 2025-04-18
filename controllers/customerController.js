const Customer = require("../models/Customer");
const axios = require("axios");

//register customer
exports.registerCustomer = async (req, res) => {
    try{
        const { name, email, phone, address, password } = req.body;

        //check whether an exisiting customer
        const exsitingCustomer = await Customer.findOne({email});
        if(exsitingCustomer){
            return res.status(400).json({message: "Customer already exists"});
        }
        //
        //save to customer db
        const newCustomer = new Customer({
            name,
            email,
            phone,
            address
        });
        await newCustomer.save();

        //send pwd to auth service
        await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/register`, {
            email,
            password,
            role: 'customer'
        });

        res.status(201).json({message: "Customer registred successfully"});
    } catch (err) {
        console.error("Full error: ", err);
        res.status(500).json({ message: "Registration failed", error: err.message || "Unknown error" });
    }
    
}

//custoemr login
exports.loginCustomer = async (req, res) => {
    try{
        const {email, password} = req.body;

        //send data to auth service
        const authresponse = await axios.post (`${process.env.AUTH_SERVICE_URL}/api/auth/login`, {
            email, 
            password,
        });

        //return the token and data from auth service
        res.status(200).json({
            message: "Login successful",
            token: authresponse.data.token,
        })
    }catch (err){
        console.error("Login error:", err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            message: "Login failed",
            error: err.response?.data || err.message,
        });
    }
}

//get customer details
exports.getCustomerProfile = async (req, res) => {
    try{
        const {email} = req.params;
        const customer = await Customer.findOne({email});
        if(!customer){
            return res.status(404).json({message: "Customer not found"});
        }
        res.status(200).json(customer);
    }catch (err){
        console.error("Error fetching customer profile:", err.message);
        res.status(500).json({message: "Failed to fetch customer profile", error: err.message});
    }
}