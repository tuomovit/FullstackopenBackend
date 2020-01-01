  
require('dotenv').config()
const express = require('express')
const morgan = require('morgan');
const cors = require('cors')


const app = express()

const Person = require('./models/person')

app.use(cors())

morgan.token('body', function (req, res) { return JSON.stringify(req.body) });

app.use(express.static('build'))
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

const bodyParser = require('body-parser')

app.use(bodyParser.json())


let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
    
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/info', (req, res) => {
  
  res.send(`Puhelinluettelossa nimiä: ${persons.length}
  <br> ${Date()}
  `)
})

const generateId = () => {
  const maxId = Math.floor(Math.random() * 100) + 1;
  return maxId;
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number ) {
    return response.status(400).json({
      error: 'nimi tai numero puuttuu'
    })
  }

  
  //if (persons.findIndex(person => person.name === body.name) > -1) {
  //  return response.status(400).json({
  //    error: 'nimi on jo lisätty'
  //  })
 // }

  const person = new Person ({
    name: body.name,
    number: body.number,
    id: generateId(),
  })

  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  })
  .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person.toJSON())
    } else {
      response.status(404).end() 
    }
  })
  .catch(error => {
    console.log(error)
    response.status(400).send({ error: 'malformatted id' })
  })
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedNote => {
      response.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error("virheilmoitus", error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Serveri pyörii portissa ${PORT}`)
})