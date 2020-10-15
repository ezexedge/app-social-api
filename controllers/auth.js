require('dotenv').config()
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

const User = require('../models/user')

exports.signup = async (req,res) => {
	const userExists = await User.findOne({email: req.body.email})
	if(userExists)return res.status(403).json({
		error: "Email is taken"
	})

	const user = await new User(req.body)
	await user.save()
	res.status(200).json({ message: 'signup success please login' })
}


exports.signin = (req,res) => {
	const { email,password} = req.body
	User.findOne({email}, (err,user) =>{
		if(err || !user){
			return res.status(401).json({
				error: "el usuario no existe"
			})
		}

		if(!user.authenticate(password)){
				return res.status(401).json({
				error: "el email o password son incorrectas"
			})	
		}

		const token = jwt.sign({_id: user._id , role: user.role}, process.env.JWT_SECRET)

		res.cookie("t",token,{expire: new Date() + 9999 })

		const {_id,name,email,role} = user

		return res.json({ token, user: {_id,email,name,role}})
		
	})

	
}

exports.signout = (req,res) =>{
	res.clearCookie("t")
	return res.json({message: "signout success!"})
}


exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"], // added later
  userProperty: "auth",
});


exports.socialLogin = (req, res) => {
    // try signup by finding user with req.email
    let user = User.findOne({ email: req.body.email }, (err, user) => {
        if (err || !user) {
            // create a new user and login
            user = new User(req.body);
            req.profile = user;
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });
        } else {
            // update existing user with new social info and login
            req.profile = user;
            user = _.extend(user, req.body);
            user.updated = Date.now();
            user.save();
            // generate a token with user id and secret
            const token = jwt.sign(
                { _id: user._id, iss: "NODEAPI" },
                process.env.JWT_SECRET
            );
            res.cookie("t", token, { expire: new Date() + 9999 });
            // return response with user and token to frontend client
            const { _id, name, email } = user;
            return res.json({ token, user: { _id, name, email } });
        }
    });
};

//764408314784-o64fj4u6c3613v2is1abmlisc8e037i5.apps.googleusercontent.com clientid
//iwxrp-SFGXsDSSRFoqU_kPNt  cliente secreto

