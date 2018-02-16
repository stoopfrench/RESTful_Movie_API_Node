# Requires Node.js

##Installation:

1. Clone this repository:
	`git clone https://github.com/stoopfrench/movie_api_mongo.git`
2. Install Dependencies:
	`npm install`
3. Start the MongoDB client:
	`sudo mongod`
	-Enter your password if required.
4. Populate the Database from the dump file:
	`mongorestore -d movie-database dump/movie-database`
5. Start the local server:
	`npm start`
6. Use an API Development Enviroment (ex. Postman) to make request to the API.