# RESTful Movie API

*REQUIRES Node.js*

**INSTALLATION -----------------------------------------------------------------------------**

1. Clone this repository:
	`git clone https://github.com/stoopfrench/RESTful_Movie_API_Node.git`
2. cd into the directory:
	`cd RESTful_Movie_API_Node`
3. Install Dependencies:
	`npm install`
4. Start the MongoDB client:
	`sudo mongod`
		
		Enter your password if required.
		
5. Open a new terminal tab (the other one should be running the mongoDB service).
6. Seed the Database with the custom seeder in `db_utilities` from the sample .csv file:
	`npm run seeder`
7. Start the local server:
	`npm start`
8. Use an API Development Enviroment (ex. Postman) to make requests to the API.
		
		Make sure the program is making request at the correct port:
		Default: http://localhost:8080
	**The port can be changed by modifying the value of the `port` property in `config/default.json`**

BE SURE TO CRASH OUT (`^C`) OF THE MONGOD SERVICE IN THE TERMINAL WHEN YOURE FINISHED EXPLORING

**TESTING -----------------------------------------------------------------------------------**

The `test` directory contains detailed tests for all the routes.  

Run the tests: `npm run test`

**ENDPOINTS --------------------------------------------------------------------------------**

**Movie Search**

GET `/api/titles`
 	
 	Returns ALL the movies in the database

	Sort By:
		Index # - /api/titles?sort=index
		Year - /api/titles?sort=year
		Releases - /api/titles?sort=releases

GET `/api/titles/<index>`
 	
 	Returns the movie stored with that INDEX #

**Create New Movie**

POST `/api/titles`
	
	Creates a new movie in the database.
	
	Template: { title: 'string', year: 'number', genres: 'string ( seperated by , )' }

**Update Movie**

PATCH `/api/titles/<index>`
	
	Updates one or more values of a movie in the database.
	
	Template: [{ property: <property name>, value: <new value }]

**Delete Movie**

DELETE `/api/titles/<index>`

	Deletes the movie with that INDEX #.

**Genre Index**

GET `/api/genre`
	
	Returns a list of ALL the genres in the database sorted by the number of movies in the genre.

**Search by Genre**

GET `/api/genre/<genre>`
	
	Returns the movies stored with that genre.

**Rename a Genre**

PATCH `/api/genre`

	Renames a genre.

	Template: { genre: <genre to rename>, newName: <new name for genre> }

**Year Index**

GET `/api/year`

	Returns a list of ALL the years in the database sorted by the number of movies released that year.

**Search by Year**

GET `/api/year/<year>`
	
	Returns the movies from that year.




