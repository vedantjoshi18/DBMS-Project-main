const mongoose = require('mongoose');
const dotenv = require('dotenv');
// Adjust path to User model based on where script is run
const User = require('../src/models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        // Use MONGODB_URI as defined in .env
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'vedantjosh5@gmail.com';
        const password = '123456';
        const adminData = {
            name: 'Admin User',
            email,
            password,
            role: 'admin',
            phone: '9999999999'
        };

        let user = await User.findOne({ email });

        if (user) {
            user.password = password;
            user.role = 'admin';
            await user.save();
            console.log('User updated to Admin');
        } else {
            user = await User.create(adminData);
            console.log('Admin User created');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedAdmin();
