import { createTransferReceipt } from '../receiptsTransfer/receiptsTransfer.controller.js'; 
import User from '../user/user.model.js'
import Transfer from './transfer.model.js';
import Account from '../account/account.model.js'; 



export const makeTransfer = async (req, res) => {
    const { fromAccount, toAccount, amount, comment } = req.body;

    try {
        // Validar los datos de entrada
        if (!fromAccount || !toAccount || amount <= 0) {
            return res.status(400).send({ message: 'Invalid input data' });
        }

        // Verificar límite de transferencia por cantidad
        const transferLimit = 2000;
        if (Number(amount) > transferLimit) {
            return res.status(400).send({ message: `Transfer amount exceeds the limit of ${transferLimit}` });
        }

        // Buscar la cuenta de origen y la cuenta de destino por sus números de cuenta
        const fromAccountData = await Account.findOne({ accountNumber: fromAccount });
        const toAccountData = await Account.findOne({ accountNumber: toAccount });

        // Verificar si las cuentas existen
        if (!fromAccountData || !toAccountData) {
            return res.status(404).send({ message: 'One or both accounts not found' });
        }

        // Convertir amount a un número
        const transferAmount = Number(amount);

        if (isNaN(transferAmount)) {
            return res.status(400).send({ message: 'Invalid amount' });
        }

        // Asegurarse de que totalBalance en la cuenta de origen sea un número
        const currentFromBalance = Number(fromAccountData.totalBalance) || 0;

        if (isNaN(currentFromBalance)) {
            return res.status(400).send({ message: 'Invalid totalBalance in fromAccount' });
        }

        // Asegurarse de que totalBalance en la cuenta de destino sea un número
        const currentToBalance = Number(toAccountData.totalBalance) || 0;

        if (isNaN(currentToBalance)) {
            return res.status(400).send({ message: 'Invalid totalBalance in toAccount' });
        }

        // Verificar si hay suficiente saldo en la cuenta de origen para la transferencia
        if (currentFromBalance < transferAmount) {
            return res.status(400).send({ message: 'Insufficient balance in fromAccount' });
        }

        // Verificar límite de transferencia por día
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const transfersToday = await Transfer.find({
            fromAccount,
            date: {
                $gte: todayStart,
                $lt: todayEnd
            }
        });

        const dailyTransferLimit = 10000;
        const totalTransferredToday = transfersToday.reduce((total, transfer) => total + transfer.amount, 0);

        if (totalTransferredToday + transferAmount > dailyTransferLimit) {
            return res.status(400).send({ message: `Transfer amount exceeds the daily limit of ${dailyTransferLimit}` });
        }

        // Obtener el nombre del titular de la cuenta de origen y destino
        const fromAccountHolderName = fromAccountData.name || 'Nombre no disponible';
        const toAccountHolderName = toAccountData.name || 'Nombre no disponible';

        // Actualizar los balances de las cuentas de origen y destino
        fromAccountData.totalBalance = currentFromBalance - transferAmount;
        toAccountData.totalBalance = currentToBalance + transferAmount;

        // Guardar las actualizaciones de las cuentas
        await fromAccountData.save();
        await toAccountData.save();

        // Generar la factura de transferencia
        const transferDate = new Date(); // Fecha de la transferencia
        const transferReceiptPath = await createTransferReceipt({
            fromAccount,
            toAccount,
            amount: transferAmount,
            comment,
            date: transferDate, 
            fromAccountHolderName,
            toAccountHolderName 
        });

        // Registrar la transferencia
        res.status(201).send({
            message: 'Transfer successful',
            transfer: {
                fromAccount,
                toAccount,
                amount: transferAmount,
                date: transferDate, 
                fromAccountHolderName, 
                toAccountHolderName,
                status: 'realizada'
            },
            transferReceiptPath
        });
    } catch (error) {
        // Manejar errores del servidor
        console.error(error);
        res.status(500).send({ message: 'Transfer failed', error: error.message });
    }
};

export const getTransferHistory = async (req, res) => {
    try {
        let userId = req.user._id;

        // Obtener las cuentas del usuario
        const userAccounts = await Account.find({ user: userId });

        // Obtener las transferencias relacionadas con las cuentas del usuario
        const transfers = await Transfer.find({ 
            $or: [
                { fromAccount: { $in: userAccounts.map(account => account.accountNumber) } }, 
                { toAccount: { $in: userAccounts.map(account => account.accountNumber) } }
            ] 
        }).sort({ date: -1 });

        // Enviar respuesta con las transferencias
        res.status(200).send({
            message: 'User transfer history retrieved successfully',
            transfers
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving user transfer history', error: error.message });
    }
};


    export const reverseTransfer = async (req, res) => {
    let { transferId } = req.body;

    try {
        // Buscar la transferencia por su ID
        const transfer = await Transfer.findById(transferId);

        // Verificar si la transferencia existe
        if (!transfer) {
            return res.status(404).send({ message: 'Transfer not found' });
        }

        const transferDate = new Date(transfer.date);
        const now = new Date();

        // Verificar si la transferencia se realizó hace menos de 1 minuto
        if ((now - transferDate) / 1000 > 60) {
            return res.status(400).send({ message: 'Transfer cannot be reversed after 1 minute' });
        }

        // Buscar las cuentas involucradas
        const fromAccountData = await Account.findOne({ accountNumber: transfer.fromAccount });
        const toAccountData = await Account.findOne({ accountNumber: transfer.toAccount });

        // Verificar si las cuentas existen
        if (!fromAccountData || !toAccountData) {
            return res.status(404).send({ message: 'One or both accounts not found' });
        }

        // Revertir los balances
        fromAccountData.totalBalance += transfer.amount;
        toAccountData.totalBalance -= transfer.amount;

        // Guardar los cambios en las cuentas
        await fromAccountData.save();
        await toAccountData.save();

        // Actualizar el estado de la transferencia a 'cancelada'
        transfer.status = 'cancelada';
        await transfer.save();

        res.status(200).send({ message: 'Transfer reversed successfully' });
    } catch (error) {
        // Manejar errores del servidor
        res.status(500).send({ message: 'Transfer reversal failed', error: error.message });
    }
}