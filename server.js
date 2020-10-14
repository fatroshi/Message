let express  = require('express');
let bodyParser = require('body-parser');
let app = express();
let http = require('http').Server(app)
let io = require('socket.io')(http);

const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'msg',
    password: 'root',
    port: 5432
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));


app.get('/messages', (req, res) => {
   //res.send(messages);
   pool.query('SELECT * FROM messages ORDER BY id ASC', (err, result) => {
       if (err){
           console.log(err);
       }
       res.status(200).json(result.rows);
   })
});

app.post('/messages', (req, res) => {

    const {name, message} = req.body;

    pool.query('INSERT INTO messages (name, message) VALUES ($1, $2)', [name, message], (err, result) => {
        if (err)
        {
            console.log(err)
        }

        io.emit('message', req.body);
        res.status(201);
    })
});

io.on('connection', (socket) => {
    console.log('a user connected');
})

let server = http.listen(3000, () => {
    console.log("Sever is listening on port: ", server.address().port);
});