const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { getSupabase, newId, requireData } = require('./supabase');

dotenv.config();

const ADMIN_EMAIL = 'admin@truetwist.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'TrueTwist Admin';

const seed = async () => {
    try {
        const supabase = getSupabase();
        console.log('Supabase connected for seeding...');

        const existingResult = await supabase.from('users').select('id').eq('email', ADMIN_EMAIL).maybeSingle();
        const userExists = requireData(existingResult.data, existingResult.error);
        if (userExists) {
            console.log('User already exists!');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const result = await supabase.from('users').insert({
            id: newId(),
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin'
        });
        requireData(result.data, result.error);

        console.log('Admin user created successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
};

seed();
