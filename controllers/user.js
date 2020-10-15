const _ = require('lodash')
const User = require('../models/user')
const formidable = require('formidable');
const fs = require('fs');


exports.userById = (req,res,next,id) => {
	User.findById(id)
	.populate('following','_id name')
	.populate('followers','_id name')
	.exec((err,user)=>{
		if(err || !user){
			return res.json({
				error: 'user not found'
			})
		}

		req.profile = user
		next()
	})
}


exports.hasAuthorization = (req, res, next) => {
    let authorized = req.profile && req.auth && req.profile._id == req.auth._id;
    // console.log("req.profile ", req.profile, " req.auth ", req.auth);
    console.log(authorized);
 
    if (!authorized) {
        return res.status(403).json({
            error: "User is not authorized to perform this action"
        });
    }
    next();
};

exports.allUsers = (req,res) => {
	User.find((err,users)=> {
		if(err){
			return res.status(400).json({
				error: err
			})
		}

		res.json(users)
	}).select('name email updated created')
}



exports.getUser = (req,res) => {
	req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}


exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    // console.log("incoming form data: ", form);
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save user
        let user = req.profile;
        // console.log("user in update: ", user);
        user = _.extend(user, fields);

        user.updated = Date.now();
        // console.log("USER FORM DATA UPDATE: ", user);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
		}
		
		console.log(files)

        user.save((err, result) => {
			console.log(err)
            if (err) {
                return res.status(400).json({
                    error: 'llene todos los campos'
                });
            }
            user.hashed_password = undefined;
            user.salt = undefined;
            // console.log("user after update with formdata: ", user);
            res.json(user);
        });
    });
};


exports.deleteUser = (req,res,next) => {
	let user = req.profile 
	user.remove((err,user)=>{
		if(err){
			return res.status(400).json({
				error: err
			})
		}
		res.json({
			message: 'usuario borrado'
		})
	})
}

exports.userPhoto = (req,res,next) => {
	 
	if(req.profile.photo.data){

		res.set(("Content-Type",req.profile.photo.contentType))
		return res.send(req.profile.photo.data)

	}
	next()
}
/*
exports.addFollowing = (req,res,next) => {
	User.findByIdAndUpdate(req.body.userId,{$push: {following : req.body.followId}},(err,result)=> {
		if(err){
			return res.status(400).json({error: err})
		}
		next()

	})
}

/*

exports.addFollower = (req,res) => {
	User.findByIdAndUpdate(req.body.followId,{$push: {followers : req.body.userId}}, 
		{new: true}
					)
					 .populate('following',' _id name')
					 .populate('followers',' _id name')
					.exec((err,result)=>{
						if(err){
							return res.status(400).json({
								error: err
							})
						}
						result.hashed_password = undefined
						result.salt = undefined
						res.json(result)
					})


}





exports.removeFollowing = (req,res,next) => {
	User.findByIdAndUpdate(req.body.userId,{$pull: {following : req.body.unfollowId}},(err,result)=> {
		if(err){
			return res.status(400).json({error: err})
		}
		next()

	})
}


exports.removeFollower = (req,res) => {
	User.findByIdAndUpdate(req.body.unfollowId,{$pull: {followers : req.body.userId}}, 
		{new: true}
					)
					 .populate('following','_id name')
					 .populate('followers','_id name')
					.exec((err,result)=>{
						if(err){
							return res.status(400).json({
								error: err
							})
						}
						result.hashed_password = undefined
						result.salt = undefined
						res.json(result)
					})


}

*/


exports.addFollower = (req, res) => {
    User.findByIdAndUpdate(req.body.followId, { $push: { followers: req.body.userId } }, { new: true })
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);
        });
};

// remove follow unfollow
exports.addFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId, { $push: { following: req.body.followId } }, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err });
        }
        next();
    });
};

exports.removeFollowing = (req, res, next) => {
    User.findByIdAndUpdate(req.body.userId, { $pull: { following: req.body.unfollowId } }, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err });
        }
        next();
    });
};

exports.removeFollower = (req, res) => {
    User.findByIdAndUpdate(req.body.unfollowId, { $pull: { followers: req.body.userId } }, { new: true })
        .populate('following', '_id name')
        .populate('followers', '_id name')
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                });
            }
            result.hashed_password = undefined;
            result.salt = undefined;
            res.json(result);
        });
};


exports.findPeople = (req,res) => {
	let following = req.profile.following
	console.log(following)
	//lo que hago es consulta ala db user y devuelvo
	//los que no se repiten entre following y la base datos
	//adepmas hago un push en following para agregarme a mi
	//de esa forma no aparecen a los que sigo y yo
	following.push(req.profile._id)
	console.log(following)
	User.find({_id : {$nin : following}}, (err,users) => {
		if(err){
			return res.status(400).json({
				error: err
			})
		}else{
			res.json(users)
		}
	}).select('name')
}