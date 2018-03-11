process.env.NODE_ENV = 'test'

const mongoose = require('mongoose')
const config = require('config')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const should = chai.should()

const Movie = require('../api/models/movieModel')

chai.use(chaiHttp)

describe('Requests to /api/titles', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to /api/titles', () => {
        it('Returns all Movies from the Database', (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .get('/api/titles')
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.have.property('results')
                        res.body.should.have.property('data')
                        res.body.data.should.be.a('array')
                        res.body.data[0].should.have.property('title')
                        res.body.data[0].should.have.property('year')
                        res.body.data[0].should.have.property('index')
                        res.body.data.length.should.be.eql(1)
                        done()
                    })
            })
        })
    })

    describe('POST request to /api/titles', () => {
        it('Creates a new movie in the database', (done) => {

            const movie = {
                title: 'Mocha TEST 1',
                year: 1990,
                genres: 'Action,Comedy,Tragedy'
            }

            chai.request(app)
                .post('/api/titles')
                .send(movie)
                .end((err, res) => {
                    res.should.have.status(201)
                    res.should.be.json
                    res.body.should.be.a('object')
                    res.body.message.should.be.eql('added new movie')
                    res.body.should.have.property('created')
                    res.body.created.should.have.property('title').equal(movie.title)
                    res.body.created.should.have.property('year').equal(movie.year)
                    res.body.created.should.have.property('genres').equal(movie.genres.split(',').join('|'))
                    res.body.created.should.have.property('index').eql(1)
                    done()
                })
        })
    })

    describe('GET request to /api/titles/<index>', () => {
        it('Returns the movie in the database with this INDEX', (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .get(`/api/titles/${movie.index}`)
                    .send(movie)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.data.should.have.property('result')
                        res.body.data.result.should.have.property('title')
                        res.body.data.result.should.have.property('year')
                        res.body.data.result.should.have.property('genres')
                        res.body.data.result.should.have.property('index').eql(movie.index)
                        done()
                    })
            })
        })
    })

    describe('PATCH request to /api/titles/<index>', () => {
        it('Updates the movie with this INDEX', (done) => {

            const patchUpdates = [{ property: 'title', value: 'Mocha TEST 2' }, { property: 'year', value: 2000 }]
            createMovie().then(movie => {
                chai.request(app)
                    .patch(`/api/titles/${movie.index}`)
                    .send(patchUpdates)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.message.should.be.equal('Movie updated')
                        res.body.should.have.property('updates')
                        res.body.updates.should.have.property(patchUpdates[0].property).equal(patchUpdates[0].value)
                        res.body.updates.should.have.property(patchUpdates[1].property).equal(patchUpdates[1].value)
                        res.body.should.have.property('result')
                        res.body.result.should.have.property(patchUpdates[0].property).equal(patchUpdates[0].value)
                        res.body.result.should.have.property(patchUpdates[1].property).equal(patchUpdates[1].value)
                        done()
                    })
            })
        })
    })

    describe('DELETE request to /api/titles/<index>', () => {
        it('Removes the movie with this INDEX', (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .delete(`/api/titles/${movie.index}`)
                    .end((err, res) => {
                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.a('object')
                        res.body.message.should.be.equal('Movie deleted')
                        done()
                    })
            })
        })
    })
})

describe('Bad Requests to /api/titles', () => {
    beforeEach((done) => {
        Movie.remove({}, (err) => {
            done()
        })
    })

    describe('GET request to invalid url', () => {
        it('Returns a 404 error', (done) => {

            chai.request(app)
                .get('/titl')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.error.message.should.be.equal('Route not found')
                    done()
                })
        })
    })

    describe('GET request to /api/titles/<index> with invalid INDEX', () => {
        it('Returns a 404 error with a message', (done) => {

            chai.request(app)
                .get('/api/titles/2')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.message.should.be.equal('No entry found with that INDEX')
                    done()
                })
        })
    })

    describe('POST request to /api/titles with missing properties', () => {
        it('Returns a 400 error', (done) => {

            const badMovie = {
                title: 'Bad Request Title',
                year: 1993
            }
            chai.request(app)
                .post('/api/titles')
                .send(badMovie)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('error')
                    done()
                })
        })
    })

    describe('PATCH request to /api/titles with an invalid INDEX', () => {
        it("Returns a 404 error with the message 'No entry found with that INDEX'", (done) => {

            const updates = [{ property: 'title', value: 'New Title' }]
            chai.request(app)
                .patch('/api/titles/5')
                .send(updates)
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('message')
                    res.body.message.should.be.equal('No entry found with that INDEX')
                    done()
                })
        })
    })

    describe('PATCH request to /api/titles/<index> with an invalid patch request', () => {
        it("Returns a 400 error with the message 'Patch Failed: Invalid patch request'", (done) => {

            const patchUpdates = [{ wrongName: 'title', value: 'Mocha TEST 2' }, { property: 'year', value: 2000 }]
            createMovie().then(movie => {
                chai.request(app)
                    .patch(`/api/titles/${movie.index}`)
                    .send(patchUpdates)
                    .end((err, res) => {
                        res.should.have.status(400)
                        res.body.should.have.property('error')
                        res.body.error.should.have.property('message')
                        res.body.error.message.should.be.equal('Patch Failed: Invalid patch request')
                        done()
                    })
            })
        })
    })

    describe('PATCH request to /api/titles/<index> with an update to INDEX', () => {
        it("Returns a 400 error with the message 'Patch Failed: Changes to the INDEX property are not permitted'", (done) => {

            const patchUpdates = [{ property: 'index', value: '5' }, { property: 'year', value: 2000 }]
            createMovie().then(movie => {
                chai.request(app)
                    .patch(`/api/titles/${movie.index}`)
                    .send(patchUpdates)
                    .end((err, res) => {
                        res.should.have.status(400)
                        res.body.should.have.property('error')
                        res.body.error.should.have.property('message')
                        res.body.error.message.should.be.equal('Patch Failed: Changes to the INDEX property are not permitted')
                        done()
                    })
            })
        })
    })

    describe('DELETE request to /api/titles/<index> with an invalid INDEX', () => {
        it("Returns a 404 error with the message 'No entry found with that ID'", (done) => {

            createMovie().then(movie => {
                chai.request(app)
                    .delete('/api/titles/8')
                    .end((err, res) => {
                        res.should.have.status(404)
                        res.body.should.have.property('message')
                        res.body.message.should.be.equal('No entry found with that INDEX')
                        done()
                    })
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
            .post('/api/titles')
            .send(movieTemplate)
            .end((err, res) => {
                resolve(res.body.created)
            })
    })
}