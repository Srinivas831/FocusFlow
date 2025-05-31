const express = require('express');
const { connection } = require('./db');
const cors = require('cors');
const { authRouter } = require('./routes/auth.routes');
const { sessionRouter } = require('./routes/session.routes');
const { blocklistRouter } = require('./routes/blocklist.routes');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/session', sessionRouter);
app.use('/blocklist', blocklistRouter);

app.get('/', (req, res) => {
    res.send('Hello World!!!!');
});

app.listen(8080, async()=>{
    try {
        await connection;
        console.log("Connected to MongoDB");
        console.log("server is running at port 8080")
    } catch (error) {
        console.log("Error connecting to MongoDB", error);
    }
})


