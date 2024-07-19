import express from 'express'
import { validateJwt, isAdmin, isClient } from '../middlewares/validate-jwt.js'
import { registerClient, login, getUserData, updateUserData, getU, deleteU } from './user.controller.js';
import {validateImage} from '../middlewares/storage.js'

const api = express.Router();

//rutas Publicas
api.post('/registerClient', validateImage.array('imageUser', 10), registerClient)
api.post('/login', login)
api.put('/updateS/:id', updateUserData)
api.get('/getU', getU)
api.delete('/deletedU/:id', deleteU)



//rutas Privadas
api.get('/get', validateJwt, getUserData)


export default api