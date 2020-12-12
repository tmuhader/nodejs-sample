import User from '../models/user.js';
import createError from 'http-errors';
import debugLib from 'debug';
import cryptoRandomString from 'crypto-random-string';
import secretCode from '../models/secretCode.js';
const debug = debugLib('controller:user');

//We could also include the next function to be called if the route handler does not complete the request cycle, but in all
// these cases it does, so we've omitted it.
/**
 * test function
 * @param {Object} req
 * @param {Object} res
 * @author Tristan Muhader
 */
// export an object literal exposing all the controller API functions. This is convenient and encourage the single-responsibility principle and
// expose only one clear interface, which provides an entry point for the module.
export default{
    async createUser(req, res, next){
        const user = new User(req.body);
        try {
            let existingUser =  await User.findOne({email:user.email});
            if(existingUser instanceof User)
                throw createError(400,'The provided email is registered already.');
            let savedUser = await user.save();
            //${req.protocol}://${req.hostname}${req.originalUrl}
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const code = cryptoRandomString({length:6, type: 'url-safe'});
            debug(`Please use the following link to activate ${baseUrl}/users/verify-account/${savedUser._id}/${code}`);
            const activationCode = new secretCode({email: user.email, code});
            await activationCode.save();
            res.status(201).send({savedUser});
        }catch (e) {
            debug(`error in user controller ${e.message} `)
            // For errors returned from asynchronous functions invoked by route handlers and middleware, you must pass
            // them to the next() function, where Express or your custom error handler will catch and process them
            e.errors = {
                message: e.message
            };
            next(e);
        }
    }
}