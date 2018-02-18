# Simple Movie API

*REQUIRES Node.js*

**INSTALLATION -----------------------------------------------------------------------------**

1. Clone this repository:
	`git clone https://github.com/stoopfrench/movie_api_mongo.git`
2. cd into the directory:
	`cd movie_api_mongo`
3. Install Dependencies:
	`npm install`
4. Start the MongoDB client:
	`sudo mongod`

	Enter your password if required.
5. Open a new terminal tab (the other one should be running the mongoDB service).
6. Populate the Database from the dump file:
	`mongorestore -d movie-database dump/movie-database`
7. Start the local server:
	`npm start`
8. Use an API Development Enviroment (ex. Postman) to make requests to the API.
		
		Make sure the program is making request at the correct port:
		Default: http://localhost:8080
	**The port can be changed by modifying the value of the `port` property in `variables.js`**

BE SURE TO CRASH OUT (`^C`) OF THE MONGOD SERVICE IN THE TERMINAL WHEN YOURE FINISHED EXPLORING



**ENDPOINTS --------------------------------------------------------------------------------**

**Movie Search**

GET `http://localhost:8080/titles`
 	
 	Returns ALL the movies in the database

GET `http://localhost:8080/titles/<id>`
 	
 	Returns the movie stored with that ID

**Create New Movie**

POST `http://localhost:8080/titles`
	
	Creates a new movie in the database.
	
	Template: {id: 'number', title: 'string', year: 'number', genres: 'string ( seperated by | )'}

**Update Movie**

PATCH `http://localhost:8080/titles/<id>`
	
	Updates one or more values of a movie in the database.
	
	Template: [{ propName: <property-name>, value: <new-property-value }]

**Delete Movie**

DELETE `http://localhost:8080/titles/<id>`

	Deletes the movie with that ID.

**Genre Index**

GET `http://localhost:8080/genre`
	
	Returns a list of ALL the genres in the database.

**Search by Genre**

GET `http://localhost:8080/genre/<genre>`
	
	Returns the movies stored with that genre.

**Movies by Year**

GET `http://localhost:8080/year`
	
	Returns ALL movies listed by year (ascending).

**Search by Year**

GET `http://localhost:8080/year/<year>`
	
	Returns the movies from that year.

**Year Index**

GET `http://localhost:8080/year/index`

	Returns a list of ALL the years in the database.



