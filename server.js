const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const jwt = require("jsonwebtoken")
const app = express()


app.use(express.static(path.join(__dirname, "public")))
app.use(cors())
app.use(express.json())

const port = 5000

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "react_db"
})





const users = [
    {
        id: 1,
        username: "admin@admin.com",
        password: "admin",
        isAdmin:true
    },
    {
        id: 2,
        username: "admin2@admin.com",
        password: "admin2",
        isAdmin:true
    },
    {
        id: 3,
        username: "user@user.com",
        password: "user",
        isAdmin:false
    }
];


let refreshTokens = [];
app.post("/refresh", (req,res) => {
    const refreshToken = req.body.token;

    if(!refreshToken) return res.status(401).json("You are not authenticated!");
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, "myRefreshSecretKey", (err,user) =>{
        err && console.log(err);
        refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefrestToken(user);

        refreshTokens.push(newRefreshToken);
        res.status(200).json({
            accessToken: newAccessToken,
            refreshToken:  newRefreshToken
        })
    })


})


const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    if(authHeader){
        const token = authHeader.split(" ")[1];
      
        jwt.verify(token, "mySecretKey", (err, user) => {
       
            if(err){
                return res.status(403).json("Token is not valid");
            }
          

            req.user = user;
            next();
        });
    }else {
        res.status(401).json("You are not authenticated" );
    }
};
app.post("/logout", verify, (req,res) => {
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
    
    res.status(200).json("You logged out successfully.");
});


app.delete("/users/:userId",verify,(req,res) => {
  
    if(res){
        res.status(200).json("user action valid");
    }else{
        res.json("Invalid action");
    }
})



const generateAccessToken = (user) => {
    return jwt.sign({id: user.id,username:user.username}, "mySecretKey", { expiresIn: "5m"});
};

const generateRefrestToken = (user) => {
    return jwt.sign({id: user.id,username:user.username}, "myRefreshSecretKey");
}

app.post('/', (req, res) => {
   

    // const values = {
    //     req.body.username,
    //     req.body.password,
    //    }
    const user = users.find((u) => {
        return u.username === req.body.email && u.password === req.body.password;
    });
    if(user){
        // res.json(user)
        // const accessToken = jwt.sign({id: user.id,username:user.username}, "mySecretKey", { expiresIn: "15m"});
        const accessToken =  generateAccessToken(user);
        const refreshToken =  generateRefrestToken(user);
        const datakey = 'gegena';
        refreshTokens.push(refreshToken);
        res.json({
            isValid:true,
            dataKey:datakey,
            tmessage:'Valid User',
            bmessage:'Valid Credentials',
            email:req.body.email,
            accessToken,
            refreshToken
        });
    }else{
        res.json({tmessage: "Invalid User",bmessage:"Incorrect email or password please try again.",isValid:false});
        
    }

//    res.json("its works")

})


app.post('/login_sql',(req,res) =>{
    const values = [
        req.body.email,
        req.body.password,
    ]
    const sql = "SELECT email FROM users WHERE email =? AND password =?";
  
    db.query(sql,values, (err, result) => {
        if(result.length > 0){
            //  res.json({success: 'valid'})
            
            const accessToken =  generateAccessToken(result);
            const refreshToken =  generateRefrestToken(result);
    
            refreshTokens.push(refreshToken);


            // res.json({success: accessToken});
            res.json({
                isValid:true,
                tmessage:'Valid User',
                bmessage:'Valid Credentials',
                email:req.body.email,
                accessToken,
                refreshToken
            });

           
        }else{
            // res.json({success: 'invalid'})

            res.json({tmessage: "Invalid User",bmessage:"Incorrect email or password please try again.",isValid:false});
         
        }

        // if(result != null) return res.json({message: 'Something unexpected has occured' + err})
        // return res.json({success: "Successfuly Logged in"})
    })

})


app.get("/userinfo", verify, (req,res) => {
    if(res){
        const email = req.user.username;
        var elementPos = users.map(function(x) {return x.username; }).indexOf(email);
        var objectFound = users[elementPos];
        const userInfo = {
            email:objectFound.username,
            isAdmin:objectFound.isAdmin
        }
        //console.log(req.user.username);
          res.status(200).json(userInfo);
       //   console.log(result);
         


      
    }else{
        res.json("Invalid action");
    }
});




app.listen(port, ()=>{
    console.log('listening... PORT:',port)
})