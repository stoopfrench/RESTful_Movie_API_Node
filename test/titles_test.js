process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const should = chai.should()

const Movie = require('../api/models/movieModel')

chai.use(chaiHttp)

const createMovie = () => {
	return new Promise((resolve, reject) => {
		const movieTemplate =  {
			title: 'Mocha Test 1',
			year: 1990,
			genres: 'Action|Comedy|Tragedy'
		}

		chai.request(app)
		.post('/titles')
		.send(movieTemplate)
		.end((err, res) => {
			resolve(res.body.created)
		})
	})
}

describe('Requests to /titles', () => {
	beforeEach((done) => {
		Movie.remove({}, (err) => { 
    		done()
        })
	})  

	describe('GET request to /titles', () => {
		it('Returns all Movies from the Database', (done) => {
			
			chai.request(app)
			.get('/titles')
			.end((err, res) => {
				res.should.have.status(200)
				res.body.should.have.property('results')
				res.body.should.have.property('movies')
				res.body.movies.should.be.a('array')
				res.body.movies.length.should.be.eql(0)
				done()
			})
		})
	})

	describe('POST request to /titles', () => {
		it('Creates a new movie in the database', (done) => {
			
			const movie = {
				title: 'Mocha TEST 1',
				year: 1990,
				genres: 'Action|Comedy|Tragedy'
			}

			chai.request(app)
			.post('/titles')
			.send(movie)
			.end((err, res) => {
				res.should.have.status(201)
				res.body.should.be.a('object')
				res.body.message.should.be.eql('added new movie')
				res.body.should.have.property('created')
				res.body.created.should.have.property('title')
				res.body.created.should.have.property('year')
				res.body.created.should.have.property('genres')
				res.body.created.should.have.property('id').eql(1)
				done()
			})
		})
	})

	describe('GET request to /titles/<id>', () => {
		it('Returns the movie in the database with this ID', (done) => {
			
			createMovie().then(movie => {
				chai.request(app)
				.get(`/titles/${movie.id}`)
				.send(movie)
				.end((err, res) => {
					res.should.have.status(200)
					res.body.should.be.a('object')
					res.body.should.have.property('movie')
					res.body.movie.should.have.property('title')
					res.body.movie.should.have.property('year')
					res.body.movie.should.have.property('genres')
					res.body.movie.should.have.property('id').eql(movie.id)
					done()
				})
			})
		})
	})

	describe('PATCH request to /titles/<id>', () => {
		it('Update the movie with the this ID', (done) => {

			const patchUpdates = [{property: 'title', value: 'Mocha TEST 2'},{property: 'year', value: 2000}]
			createMovie().then(movie => {
				chai.request(app)
				.patch(`/titles/${movie.id}`)
				.send(patchUpdates)
				.end((err,res) => {
					res.should.have.status(200)
					res.body.should.be.a('object')
					res.body.message.should.be.eql('Movie updated')
					res.body.should.have.property('updates')
					res.body.updates.should.have.property(patchUpdates[0].property).eql(patchUpdates[0].value)
					res.body.updates.should.have.property(patchUpdates[1].property).eql(patchUpdates[1].value)
					res.body.should.have.property('result')
					res.body.result.should.have.property(patchUpdates[0].property).eql(patchUpdates[0].value)
					res.body.result.should.have.property(patchUpdates[1].property).eql(patchUpdates[1].value)
					done()
				})
			})
		})
	})

	describe('DELETE request to /titles/<id>', () => {
		it('Removes the movie with the this ID', (done) => {

			createMovie().then(movie => {
				chai.request(app)
				.delete(`/titles/${movie.id}`)
				.end((err,res) => {
					res.should.have.status(200)
					res.body.should.be.a('object')
					res.body.message.should.be.eql('Movie deleted')
					done()
				})
			})
		})
	})
})  
