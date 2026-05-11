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

    it('updates user non password fields without changing password', async () => {
        const user = await User.create({
            name: 'Elon Musk',
            email: 'elon@musk.com',
            password: 'password123'
        });

        const updatedUser = await User.findByIdAndUpdate(user._id, { name: 'Jeff Bezos' }, { new: true });

        expect(updatedUser.name).toBe('Jeff Bezos');
        expect(updatedUser.password).toBe(user.password);
    });

    it('hashes password when updating password', async () => {
        const user = await User.create({
            name: 'Elon Musk',
            email: 'elon@musk.com',
            password: 'password123'
        });

        const updatedUser = await User.findByIdAndUpdate(user._id, { password: 'newpassword456' }, { new: true });

        expect(updatedUser.password).not.toBe('newpassword456');
        expect(updatedUser.password).toMatch(/^\$2b\$/);

        const isMatch = await bcrypt.compare('newpassword456', updatedUser.password);
        expect(isMatch).toBe(true);

        const oldMatch = await bcrypt.compare('password123', updatedUser.password);
        expect(oldMatch).toBe(false);
    });
});