const jwt = require("jsonwebtoken")

const auth = async(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1]

        if(!token){
            return res.status(401).json({error:"Access denied. No token provided."})
        }

        let decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        res.status(500).json({error:"Authentication Failed"})
    }
}

const adminAuth = async (req, res, next) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization Failed' });
    }
  };

module.exports = {auth, adminAuth}