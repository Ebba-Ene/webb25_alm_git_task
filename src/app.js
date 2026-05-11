const cors = require('cors')
const express = require('express')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/products', productRoutes)
app.use('/categories', categoryRoutes)
app.use('/users', userRoutes)

app.get('/', (req, res) => {
  res.json({
    'GET /': 'Api directory',
    '/products': {
      'GET /': 'Get all products',
      'GET /:id': 'Get product by id',
      'POST /': {
        Description: 'Create a product',
        body: {
          name: 'required string',
          price: 'required number',
          description: 'optional'
        }
      },
      'PUT /:id': {
        Description: 'Update a product',
        body: {
          name: 'required string',
          price: 'required number',
          description: 'optional'
        }
      },
      'DELETE /:id': 'Delete a product'
    },

    '/users': {
      'GET /': 'Get all users',
      'GET /:id': 'Get user by id',
      'POST /': {
        Description: 'Create a user',
        body: {
          name: 'required string',
          email: 'required string',
          password: 'required string'
        }
      },
      'PUT /:id': {
        Description: 'Update a user',
        body: {
          name: 'optional string',
          email: 'optional string',
          password: 'optional string'
        }
      },
      'DELETE /:id': 'Delete a user'
    }
  })
})

module.exports = app
