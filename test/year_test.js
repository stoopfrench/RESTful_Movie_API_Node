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
                        res.body.should.have.property('year').equal(`${movie.year}`)
                        res.body.should.have.property('count').eql(1)
                        res.body.should.have.property('movies')
                        done()
                    })
            })
        })
    })
})

describe('Bad Requests to /year', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to invalid url', () => {
        it('Returns a 404 error', (done) => {
            
            chai.request(app)
                .get('/yeara')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.error.message.should.be.equal('Route not found')
                    done()
                })
        })
    })

    describe('GET request to /genre/<genre> with invalid ID', () => {
        it("Returns a 404 error with the message 'No Movies found from that year'", (done) => {
            
            chai.request(app)
                .get('/year/2000')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.be.equal('No Movies found from that year')
                    done()
                })
        })
    })
})


const createMovie = () => {
    return new Promise((resolve, reject) => {
        const movieTemplate = {
            title: 'Mocha Movie Template',
            year: 1991,
            genres: 'Action,Comedy,Tragedy'
        }

        chai.request(app)
            .post('/titles')
            .send(movieTemplate)
            .end((err, res) => {
                resolve(res.body.created)
            })
    })
}