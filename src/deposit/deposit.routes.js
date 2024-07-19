import express from 'express'
import { makeDeposit, getDepositHistory, getAllDeposits } from './deposit.controller.js';
import { validateJwt } from '../middlewares/validate-jwt.js'


const api = express.Router();

//rutas Publicas
api.post('/save', makeDeposit)
api.get('/get', getDepositHistory)
api.get('/getAllDeposit', getAllDeposits)

export default api