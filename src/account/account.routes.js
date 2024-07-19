'use strict'
import { Router } from "express"
import { saveAccount, updateAccount, deleteAccount, getA, getAccount ,searchA } from "./account.controller.js"
const api = Router()

api.post('/saveAccount', saveAccount)
api.put('/updateAccount/:id', updateAccount)
api.delete('/deleteAccount/:id', deleteAccount)

api.get('/getA', getA)
api.get('/getAccount', getAccount)
api.post('/searchA', searchA)

export default api