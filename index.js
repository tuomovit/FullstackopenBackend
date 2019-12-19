  
const express = require('express')
const morgan = require('morgan');
const cors = require('cors')


const app = express()
app.use(cors())
morgan.token('body', function (req, res) { return JSON.stringify(req.body) });


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

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number ) {
    return response.status(400).json({
      error: 'nimi tai numero puuttuu'
    })
  }

  
  if (persons.findIndex(person => person.name === body.name) > -1) {
    return response.status(400).json({
      error: 'nimi on jo lisätty'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})



const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})