const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

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

app.post('/',(req,res) =>{
    const values = [
        req.body.email,
        req.body.password,
    ]
    const sql = "SELECT * FROM users WHERE email =? AND password =?";
  
    db.query(sql,values, (err, result) => {
        if(result.length > 0){
            res.json({success: 'valid'})
           
        }else{
            res.json({success: 'invalid'})
            // res.json({message: 'Something unexpected has occured' + err})
        }

        // if(result != null) return res.json({message: 'Something unexpected has occured' + err})
        // return res.json({success: "Successfuly Logged in"})
    })

})

app.listen(port, ()=>{
    console.log('listening... PORT:',port)
})