const express = require('express')

const  {requireSignin} = require('../controllers/auth')

const  { userById , allUsers ,  getUser,updateUser , hasAuthorization ,deleteUser,userPhoto,addFollower,addFollowing,removeFollower,removeFollowing,findPeople} = require('../controllers/user')



const router = express.Router()


router.put("/user/follow", requireSignin, addFollowing, addFollower);
router.put("/user/unfollow", requireSignin, removeFollowing, removeFollower);

router.get('/users', allUsers )
router.get('/user/:userId',  requireSignin ,getUser)
router.put('/user/:userId',  requireSignin , hasAuthorization ,updateUser)
router.delete('/user/:userId',  requireSignin , hasAuthorization ,deleteUser)

//a quien seguir
router.get('/user/findpeople/:userId',requireSignin,findPeople)

router.get("/user/photo/:userId",userPhoto)
router.param('userId',userById)


module.exports = router
