import express from 'express'
import { makeTransfer, getTransferHistory, reverseTransfer } from './transfer.controller.js';
import { validateJwt} from '../middlewares/validate-jwt.js'


const api = express.Router();

//rutas Publicas
api.post('/trans', makeTransfer)
api.get('/get', validateJwt, getTransferHistory)
api.post('/reverseTransfer', validateJwt, reverseTransfer)


export default api