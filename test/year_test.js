process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const should = chai.should()

const Movie = require('../api/models/movieModel')

chai.use(chaiHttp)

describe('Requests to /year', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to /year', () => {
        it('Returns an index of Years stored in the database', (done) => {
            createMovie().then(movie => {
                chai.request(app)
                    .get('/year')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.should.have.property('years')
                        res.body.should.have.property('count').eql(1)
                        done()
                    })
            })
        })
    })

    describe('GET request to /year/<id>', () => {
        it('Returns the movies in the database from this year', (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .get(`/year/${movie.year}`)
                    .send(movie)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.should.have.property('year').eql(`${movie.year}`)
                        res.body.should.have.property('count').eql(1)
                        res.body.should.have.property('movies')
                        done()
                    })
            })
        })
    })
})


const createMovie = () => {
    return new Promise((resolve, reject) => {
        const movieTemplate = {
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