'use strict'

import Offer from './offer.model.js'
import Account from '../account/account.model.js'

export const save = async (req,res)=>{
    try{
        let data = req.body
        let offer = new Offer(data)
        await offer.save()
        return res.send({message: `Registered succesfully, ${offer.name}`})
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error registering offer', err: err })
    }
}

export const update = async (req,res)=>{
    try{
        let { id } = req.params
        let data = req.body
        if(Object.keys(data).length === 0) return res.status(401).send({ message: 'Update is empty, not updated' })

        let updatedOffer = await Offer.findOneAndUpdate(
            {_id: id},
            data,
            { new: true}
        )
        if(!updatedOffer) return res.status(401).send({ message: 'Offer not found and not updated' })
            return res.send({ message: 'Updated offer', updatedOffer })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error updating offer' })
    }
}

export const deleteA = async(req,res) =>{
    try{
        let { id } = req.params
        let deletedOffer = await Offer.findOneAndDelete({ _id: id })
        if (!deletedOffer) return res.status(404).send({ message: 'Offer not found and not deleted' })
        return res.send({ message: `Offer with name ${deletedOffer.name} deleted successfully` })
    }catch(err){
        console.error(err)
        return res.status(500).send({ message: 'Error deleting offer' })
    }
}

export const get = async (req, res) => {
    try {
        let offers = await Offer.find()
        if (!offers) return res.status(404).send({ message: 'There are no offer' })
        return res.send({ offers })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting offers' })
    }
}

export const search = async (req, res) => {
    try {
        const { search } = req.body;
        const offers = await Offer.find({ name: { $regex: new RegExp(search, 'i') } });

        if (offers.length === 0) {
            return res.status(404).send({ message: 'Offers not found' });
        }

        res.send({ message: 'Offers found', offers });
    } catch (error) {
        console.error('Error searching offers:', error);
        res.status(500).send({ message: 'Error searching offers' });
    }
};


export const assignUserToOffer = async (req, res) => {
    const { offerId } = req.body;
    const userId = req.user.id; // Accede al ID del usuario desde req.user
  
    if (!offerId || !userId) {
      console.log('Missing offerId or userId:', { offerId, userId });
      return res.status(400).json({ message: 'OfferId and userId are required' });
    }
  
    try {
      console.log(`Received offerId: ${offerId}, userId: ${userId}`);
  
      // Busca la oferta por su ID
      const offer = await Offer.findById(offerId);
      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }
  
      // Verifica si el usuario ya está asignado a la oferta
      if (offer.user.includes(userId)) {
        return res.status(403).json({ message: 'User is already assigned to this offer' });
      }
  
      // Busca la cuenta asociada al usuario
      const account = await Account.findOne({ user: userId });
      if (!account) {
        console.log(`Account not found for userId: ${userId}`);
        return res.status(404).json({ message: 'Account not found' });
      }
  
      // Verifica si el saldo de la cuenta es suficiente para comprar la oferta
      if (account.totalBalance < offer.price) {
        return res.status(403).json({ message: 'Insufficient balance to purchase the offer' });
      }
  
      // Actualiza el saldo de la cuenta
      account.totalBalance -= offer.price;
  
      // Asigna el usuario a la oferta
      offer.user.push(userId);
  
      // Guarda los cambios en la oferta y la cuenta
      await offer.save();
      await account.save();
  
      res.status(200).json({ message: 'User assigned to offer, price updated, and account balance updated', offer });
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ message: 'Server error', error });
    }
};


  export const getOfferHistory = async (req, res) => {
    try {
        let userId = req.user._id;
        //console.log(User ID: ${userId});

        const account = await Account.findOne({ user: userId }).select('accountNumber');
        if (!account) {
            return res.status(404).send({ message: 'Account not found for this user.' });
        }

        const query = { user: userId };

        if (req.query.type) {
            query.type = req.query.type;
        }

        const offers = await Offer.find(query).sort({ date: -1 });

        if (offers.length === 0) {
            return res.status(404).send({ message: 'No offers found for this user.' });
        }

        res.status(200).send({
            message: 'User offers history retrieved successfully',
            accountNumber: account.accountNumber,
            offers
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving user offers history', error: error.message });
    }
};

export const getOffersByUserCount = async (req, res) => {
    try {
        const offers = await Offer.aggregate([
            { 
                $match: { 
                    user: { $exists: true, $ne: null } // Filtra documentos donde 'user' existe y no es nulo
                } 
            },
            { 
                $project: { 
                    name: 1, 
                    price: 1, 
                    percentage: 1, 
                    userCount: { $cond: { if: { $isArray: "$user" }, then: { $size: "$user" }, else: 0 } }
                } 
            },
            { 
                $sort: { 
                    userCount: 1 // Orden ascendente por la cantidad de usuarios
                } 
            }
        ]);

        if (offers.length === 0) {
            return res.status(404).send({ message: 'No offers found' });
        }

        res.send({ offers });
    } catch (error) {
        console.error('Error getting offers by user count:', error);
        res.status(500).send({ message: 'Error getting offers by user count', error });
    }
};