import mongoose from 'mongoose';
import validator from 'validator';
import '../connections/defaultConnect.js';
import debugLib from 'debug';

const debug = debugLib('model:user');
const GENDERS = Object.freeze({
        MALE: 'male',
        FEMALE: 'female',
        OTHER: 'other'
    }),
    STATUSES = Object.freeze({
        NOT_INITIALIZED: 'NOT_INITIALIZED',
        ACTIVE: 'ACTIVE',
        SUSPENDED: 'SUSPENDED',
        DEACTIVE: 'DEACTIVE'
    });

const userSchema  = new mongoose.Schema({
    name: {
        type: String,
        required: [true,'Please enter your name'],
        trim: true,
    },
    userName: {
        type : String,
        required: true,
        unique: true
    },
    //todo add username path to use the username as a public ID for our users in the app without compromising their email address which would inundate the user with spam
    email: {
        type: String,
        required: [true,'Please enter your email'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            // Validators always receive the value to validate as their first argument and must return Boolean.
            // Returning false or throwing an error means validation failed. https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
            validator: value => validator.isEmail(value),
            message: props => `${props.value} is not a valid value for ${props.path}`
        }
    },
    //todo hash the password before save
    password: {
        type: String,
        required: [true,'Please enter your password'],
        // `password` will be excluded when you do `User.find()` unless you explicitly project it in.
        select: false
    },
    gender: {
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        enum: Object.values(GENDERS)
    },
    status: {
        type: String,
        uppercase: true,
        enum: Object.values(STATUSES),
        default: STATUSES.NOT_INITIALIZED
    },
},{
    timestamps: true
});

Object.assign(userSchema.statics,{GENDERS,STATUSES});

function validationErrorsFormatter(err){
    let errors = {};
    if(err.name ==="ValidationError"){
        err.status =400;
        // get an array of all property keys (paths' names) in the err.errors object. And for each error in path, add a new property
        // in the errors object where the property key is the path name (errors.key but since key is a variable then we use the bracket notation)
        // and the value of the property key is only the error message as opposed to a long message used by the built-in err.errors object.
        debug(`content of Object.entries(err.errors): ${Object.entries(err.errors) }`);
        Object.keys(err.errors).forEach((key)=>{
            errors[key] = err.errors[key].message;
        });

    }
    // Uniqueness in Mongoose is not a validation parameter (like required); it tells Mongoose to create a unique index
    // in MongoDB for that field. The uniqueness constraint is handled entirely in the MongoDB server. When you add a
    // document with a duplicate key, the MongoDB server will return the error (E11000...).
    if(err.name === 'MongoError' && err.code === 11000){
        err.status =400;
        Object.keys(err.keyPattern).forEach((key)=>{
            errors[key] = `value already exist`;
        })
    }
    err.errors = errors;
}
// error handler middleware registered as post hook for user save() operation
userSchema.post('save',function (err, doc, next){
    debug(`error in the user model: ${err.errors}`);
    // if validation error, then set the error status code to 400 (bad request) and convert error messages to a more
    // user friendly format
    validationErrorsFormatter(err);
    next(err);
});

// error handler middleware registered as post hook for user update() operation
userSchema.post('update',function (err,doc,next){
    debug(`error in the user model: ${err.errors}`);
    // if validation error, then set the error status code to 400 (bad request) and convert error messages to a more
    // user friendly format
    validationErrorsFormatter(err);
    next(err);
})


export default mongoose.model('User',userSchema);