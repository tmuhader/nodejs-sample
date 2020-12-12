import createError from 'http-errors';
// import {createRequire} from 'module';
// const require = createRequire(import.meta.url);
import express from 'express';
import usersController from '../controllers/usersController.js';
const router = express.Router();

// #route:  POST /register
// #desc:   Register a new user
// #access: Public
router.post('/register',usersController.createUser);

/*  GET users listing. */
router.get('/', usersController.createUser);

router.get('/error', (req,res)=>{
  throw createError(500,'error in entered data');
})


export default router;
