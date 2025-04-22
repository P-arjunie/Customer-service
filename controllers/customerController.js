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


// Get customer details using decoded JWT
exports.getCustomerProfile = async (req, res) => {
    try {
        // 1. Extract JWT token from the Authorization header
        const token = req.header('Authorization');
        
        // 2. If no token is present, return a 401 (Unauthorized) status
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        
        // 3. Verify the token by calling the auth service
        try {
            const verifyResponse = await axios.get(
                `${process.env.AUTH_SERVICE_URL}/api/auth/verify-token`,
                { headers: { 'Authorization': token } }
            );
            
            // 4. Get the email from the verified response
            const email = verifyResponse.data.email;
            
            // 5. Look for the customer in the database using the email
            const customer = await Customer.findOne({ email });
            
            // 6. If customer is not found, return a 404 (Not Found) status
            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }
            
            // 7. Send back the customer profile data
            res.status(200).json(customer);
            
        } catch (verifyError) {
            // If token verification fails
            console.error('Token verification failed:', verifyError.response?.data || verifyError.message);
            
            // Pass through the status code and message from the auth service
            return res.status(verifyError.response?.status || 401).json({ 
                message: verifyError.response?.data?.message || 'Invalid or expired token.' 
            });
        }
        
    } catch (err) {
        // If any error occurs, return a 500 (Internal Server Error) status
        console.error('Error fetching customer profile:', err.message);
        res.status(500).json({
            message: 'Failed to fetch customer profile',
            error: err.message,
        });
    }
};