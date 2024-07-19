import Account from '../account/account.model.js';
import Deposit from '../deposit/deposit.model.js'
import { createDepositReceipt } from '../receipts/receipt.controller.js';

export const makeDeposit = async (req, res) => {
    const { accountNumber, amount } = req.body;

    try {
        // Validar los datos de entrada
        if (!accountNumber || amount <= 0) {
            return res.status(400).send({ message: 'Invalid input data' });
        }

        // Buscar la cuenta de destino por su número de cuenta
        const account = await Account.findOne({ accountNumber }).populate('user'); // Populate para obtener el usuario

        // Verificar si la cuenta existe
        if (!account) {
            return res.status(404).send({ message: 'Account not found' });
        }

        // Convertir amount a un número
        const depositAmount = Number(amount);

        if (isNaN(depositAmount)) {
            return res.status(400).send({ message: 'Invalid amount' });
        }

        // Asegurarse de que totalBalance es un número
        const currentBalance = Number(account.totalBalance) || 0;

        if (isNaN(currentBalance)) {
            return res.status(400).send({ message: 'Invalid totalBalance in account' });
        }

        // Actualizar el balance de la cuenta
        account.totalBalance = currentBalance + depositAmount;

        // Guardar la actualización de la cuenta
        await account.save();

        // Registrar el depósito y crear el recibo
        const receiptPath = await createDepositReceipt(account, depositAmount);

        // Enviar respuesta de éxito con el nombre del usuario y la URL del recibo
        res.status(201).send({
            message: 'Deposit successful',
            deposit: {
                accountNumber: account.accountNumber,
                amount: depositAmount,
                date: new Date()
            },
            account: {
                accountNumber: account.accountNumber,
                totalBalance: account.totalBalance,
                userName: account.user.name // Asegúrate de que el usuario tiene un campo 'name'
            },
            receiptUrl: receiptPath // Incluye la URL del recibo en formato PDF
        });
    } catch (error) {
        // Manejar errores del servidor
        console.error(error);
        res.status(500).send({ message: 'Deposit failed', error: error.message });
    }
};



export const getDepositHistory = async (req, res) => {
    try {
        const deposits = await Deposit.find().populate({
            path: 'accountNumber',
            populate: {
                path: 'user',
                select: 'name' // Selecciona los campos que deseas mostrar del usuario
            }
        });

        res.status(200).send(deposits);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to retrieve deposit history', error: error.message });
    }
};

export const getAllDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find();
        res.status(200).json(deposits);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los depósitos', error });
    }
};