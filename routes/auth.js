const express = require('express')

const  {signup , signin,signout, socialLogin } = require('../controllers/auth')

const  { userById } = require('../controllers/user')


const {userSignupValidator} = require('../validator')

const router = express.Router()

router.post('/signup', userSignupValidator ,signup )
router.post('/signin', signin )
router.get('/signout', signout )
router.post("/social-login", socialLogin); 

router.param('userId',userById)


module.exports = router
