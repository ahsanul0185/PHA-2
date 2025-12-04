import express from 'express'
import config from './config'
import initDB from './config/db'

const app = express()

// initializing db
initDB()

app.get("/", (req, res) => {
    res.json({message : "Welcome to Vahicle Management System"})
})

app.listen(config.port, () => {
    console.log(`server is running at port ${config.port}`) 
})