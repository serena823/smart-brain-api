const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex');


const db = knex({
    client: 'pg',
    connection: {
    host : '127.0.0.1',
    user : 'siqishao',
    password : '',
    database : 'smart-brain'
  }
});

// db.select('*').from('users').then(data => {
// 	console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());



const database = {
	users: [
	{
		id: '123',
		name: 'john',
		email: 'john@gmail.com',
		password: 'cookies',
		entries: 0,
		joined: new Date()
	},
	{
		id: '124',
		name: 'sam',
		email: 'sam@gmail.com',
		password: 'apple',
		entries: 0,
		joined: new Date()
	},
	]
}

app.get('/', (req, res)=> {
	res.send(database.users);
})

app.post('/signin',(req, res) => {
	if(req.body.email === database.users[0].email && 
		req.body.password === database.users[0].password){
		// res.json('success')
		res.json(database.users[0]);
	}else{
	}
})

app.post('/register', (req, res)=>{
	const {email, name, password} = req.body;
	console.log(password)
	const saltRounds = 10;
    var salt = bcrypt.genSaltSync(saltRounds);
	const hash = bcrypt.hashSync(password,salt);
	console.log(hash)
	    db.transaction(trx => {
	    	trx.insert({
	    		hash: hash,
	    		email: email
	    	})
	    	.into('login')
	    	.returning('email')
	    	.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
						email:loginEmail[0],
						name: name,
						joined: new Date()
					})
					.then(user =>{
						res.json(user[0]);
					})
	    	})
	    	.then(trx.commit)
	    	.catch(trx.rollback)
	    })
		.catch(err => res.status(400).json('unable to register'))
	
})

app.get('/profile/:id',(req, res) =>{
	const { id } =req.params;
	db.select('*').from('users').where({id})
	.then(user =>{
		if (user.length) {
			res.json(user[0])
		} else{
			res.status(400).json('not found')
		}	
	})
	.catch(err => res.status(400).json('error getting user'))
})

app.put('/image',(req,res)=>{
	const { id } =req.body;
	db('users').where('id','=',id)
	.increment('entries', 1)
	.returning('entries')
	.then(entries =>{
		res.json(entries[0]);
	})
	.catch(err => res.status(400).json('unable to get entries'))

	 
})

app.listen(3000,()=> {
	console.log('app is running on port 3000')
})

/*
/ --> res =this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/