'use strict'

import { Router } from "express"
import { save, update, deleteA, get, search, assignUserToOffer, getOfferHistory, getOffersByUserCount } from "./offer.controller.js"
import { validateJwt } from '../middlewares/validate-jwt.js'




const api = Router()

api.post('/save', save)
api.put('/update/:id', update)
api.delete('/delete/:id', deleteA)
api.get('/get', get)
api.post('/search', search)
api.post('/offer', validateJwt, assignUserToOffer);
api.get('/getOfferHistory', validateJwt, getOfferHistory)
api.get('/grafica', getOffersByUserCount)

export default api