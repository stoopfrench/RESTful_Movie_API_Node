# RESTful Movie API

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

**TESTING -----------------------------------------------------------------------------------**

Run the Mocha tests in the `/test` directory: `npm run test`

**ENDPOINTS --------------------------------------------------------------------------------**

**Movie Search**

GET `http://localhost:<port>/titles`
 	
 	Returns ALL the movies in the database

	Sort By:
		Title - http://localhost:<port>/titles?sort=title
		ID - http://localhost:<port>/titles?sort=id
		Year - http://localhost:<port>/titles?sort=year


GET `http://localhost:<port>/titles/<id>`
 	
 	Returns the movie stored with that ID

**Create New Movie**

POST `http://localhost:<port>/titles`
	
	Creates a new movie in the database.
	
	Template: { title: 'string', year: 'number', genres: 'string ( seperated by , )' }

**Update Movie**

PATCH `http://localhost:<port>/titles/<id>`
	
	Updates one or more values of a movie in the database.
	
	Template: [{ property: <property name>, value: <new value }]

**Delete Movie**

DELETE `http://localhost:<port>/titles/<id>`

	Deletes the movie with that ID.

**Genre Index**

GET `http://localhost:<port>/genre`
	
	Returns a list of ALL the genres in the database sorted by the number of movies in the genre.

	Options:
		Return the list in Alphabetical Order - http://localhost:<port>/genre?sort=name

**Search by Genre**

GET `http://localhost:<port>/genre/<genre>`
	
	Returns the movies stored with that genre.

**Rename a Genre**

PATCH `http://localhost:<port>/genre`

	Renames a genre.

	Template: { genre: <genre to rename>, newName: <new name for genre> }

**Year Index**

GET `http://localhost:<port>/year/index`

	Returns a list of ALL the years in the database sorted by the number of movies released that year.

	Options:
		Returns the list in numerical order - http://localhost:<port>/year?sort=year

**Search by Year**

GET `http://localhost:<port>/year/<year>`
	
	Returns the movies from that year.




