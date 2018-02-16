# Requires Node.js

##Installation:

1. Clone this repository:
	`git clone https://github.com/stoopfrench/movie_api_mongo.git`
2. cd into the directory:
	`cd movie-api-mongo`
3. Install Dependencies:
	`npm install`
4. Start the MongoDB client:
	`sudo mongod`
	-Enter your password if required.
5. Populate the Database from the dump file:
	`mongorestore -d movie-database dump/movie-database`
6. Start the local server:
	`npm start`
7. Use an API Development Enviroment (ex. Postman) to make request to the API.