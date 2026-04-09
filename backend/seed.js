const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/minihr');
        console.log('MongoDB Connected for seeding...');

        const userExists = await User.findOne({ email: 'urvashi@gmail.com' });
        if (userExists) {
            console.log('User already exists!');
            process.exit(0);
        }

        await User.create({
            name: 'Urvashi',
            email: 'urvashi@gmail.com',
            password: 'Pass@123',
            role: 'admin'
        });

        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seed();
