'use strict'

import Account from './account.model.js';
import User from '../user/user.model.js'

const generateAccountNumber = () => {
    const randomNumber = Math.floor(10000000000000 + Math.random() * 90000000000000);
    return `GTQ-${randomNumber}`;
};

export const saveAccount = async (req, res) => {
    try {
        const data = req.body;

        // Verificar si se proporciona el ID del usuario
        if (!data.user) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        // Buscar el usuario en la base de datos
        const user = await User.findById(data.user);

        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Generar el número de cuenta
        data.accountNumber = generateAccountNumber();

        // Crear una nueva cuenta con los datos proporcionados
        const account = new Account(data);

        // Guardar la cuenta en la base de datos
        await account.save();

        // Populear el usuario en la cuenta guardada
        const populatedAccount = await Account.findById(account._id).populate('user', 'name');

        return res.send({ message: 'Registered successfully', account: populatedAccount });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error registering account', error: err.message });
    }
};


export const updateAccount = async (req, res)=>{
    try{
        let { id } = req.params
        let data = req.body
        if(Object.keys(data).length === 0) return res.status(401).send({ message: 'Update is empty, not updated' })

        let updatedAccount = await Account.findOneAndUpdate(
            {_id: id},
            data,
            { new: true}
        )
        if(!updatedAccount) return res.status(401).send({ message: 'Account not found and not updated' })
            return res.send({ message: 'Updated account', updatedAccount })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error updating account' })
    }
}

export const deleteAccount = async(req,res) =>{
    try{
        let { id } = req.params
        let deleteAccount = await Account.findOneAndDelete({ _id: id })
        if (!deleteAccount) return res.status(404).send({ message: 'Account not found and not deleted' })
        return res.send({ message: `Account deleted successfully` })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error deleting account' })
    }
}


export const getA = async (req, res) => {
    try {
        let accounts = await Account.find()
        if (!accounts || accounts.length === 0) {
            return res.status(404).send({ message: 'There are no accounts' });
        }
        return res.send({ accounts });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting accounts' });
    }
}

export const getAccount = async (req, res) => {
    try {
        let accounts = await Account.find().populate('user', 'name'); // Aquí se usa populate('user')
        if (!accounts || accounts.length === 0) {
            return res.status(404).send({ message: 'There are no accounts' });
        }
        return res.send({ accounts });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error getting accounts' });
    }
}

export const searchA = async (req, res) => {
    try {
        const { search } = req.body;
        const accounts = await Account.find({ type: { $regex: new RegExp(search, 'i') } });

        if (accounts.length === 0) {
            return res.status(404).send({ message: 'Account not found' });
        }

        res.send({ message: 'Accounts found', accounts });
    } catch (error) {
        console.error('Error searching accounts:', error);
        res.status(500).send({ message: 'Error searching accounts' });
    }
};