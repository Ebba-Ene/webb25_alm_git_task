const mongoose = require('mongoose');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/product_api_test');
});

afterAll(async () => {
    await mongoose.disconnect();
});

afterEach(async () => {
    await User.deleteMany({});
});

describe('User model validation', () => {
    
    it('creates a valid user with mail, password', () => {
        const user = new User({
            name: 'Elon Musk',
            email: 'elon@musk.com',
            password: 'password123'
        });
            
            const error = user.validateSync();
            expect(error).toBeUndefined();         
    });

    it('fails when email is missing', () => {
        const user = new User({});
        const error = user.validateSync();
        expect(error).toBeDefined();
        expect(error.errors.email.message).toBe('email is required');
    });

 it('fails when two users have the same email', async () => {
        await User.create({
            name: 'User One',
            email: 'test@test.com',
            password: 'password123'
        });

        let error;
        try {
            await User.create({
                name: 'User Two',
                email: 'test@test.com',
                password: 'password123'
            });
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
        expect(error.code).toBe(11000);
    });

    it('stores password as hash, not plain text', async () => {
        const rawPassword = 'password123'
        const user = await User.create({
            name: 'Elon Musk',
            email: 'elon@musk.com',
            password: rawPassword
        })

        expect(user.password).not.toBe(rawPassword)

        expect(user.password).toMatch(/^\$2b\$/)
        const isMatch = await bcrypt.compare(rawPassword, user.password)
        expect(isMatch).toBe(true)
    })
});