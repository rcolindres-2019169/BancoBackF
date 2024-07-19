'use strict'

import User from './user.model.js'
import { encrypt, checkPassword } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'
import bcrypt from 'bcrypt';



/*Admin por default*/
export const createDefaultAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ role: 'ADMIN' });
        if (!existingAdmin) {
            const hashedPassword = await encrypt('ADMINB');
            const defaultAdmin = new User({
                name: 'Admin',
                username: 'ADMINB',
                dpi: '1234567898745',
                address: 'Admin Address',
                phone: '12345678',
                email: 'admin@example.com',
                password: hashedPassword,
                jobname: 'Admin Job',
                income: 1000,
                role: 'ADMIN'
            });
            await defaultAdmin.save();
            console.log('El administrador predeterminado se ha creado exitosamente.');
        } else {
            console.log('Ya existe un administrador en la base de datos.');
        }
    } catch (error) {
        console.error('Error al crear el administrador predeterminado:', error);
    }
}


export const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.findOne({ username: identifier });

        if (!user) {
            return res.status(404).send({ message: 'Usuario no encontrado' });
        }

        // Comparar la contraseña proporcionada con la contraseña almacenada en la base de datos
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            };

            const token = await generateJwt(loggedUser);

            return res.send({ message: `Bienvenido ${loggedUser.name}`, token, role: user.role });
        }

        return res.status(404).send({ message: 'Credenciales inválidas' });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error durante el inicio de sesión' });
    }
};


export const registerClient = async (req, res) => {
    try {
        const { name, username, dpi, address, phone, email, password, jobname, income } = req.body;

        // Verificar si los ingresos mensuales son al menos Q100
        if (income < 100) {
            return res.status(400).send({ message: 'Ingresos mensuales insuficientes. Deben ser al menos Q100.' });
        }

        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).send({ message: 'El nombre de usuario o correo electrónico ya está en uso.' });
        }

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await encrypt(password);

        // Crear un nuevo usuario con los datos proporcionados
        const newUser = new User({
            name,
            username,
            dpi,
            address,
            phone,
            email,
            password: hashedPassword, // Utilizar la contraseña encriptada
            jobname,
            income,
            role: 'USER' // Asignar el rol de usuario por defecto
        });

        // Si se cargaron archivos, guardar las rutas de las imágenes en el usuario
        if (req.files && req.files.length > 0) {
            newUser.imageUser = req.files.map(file => '/uploads' + file.filename);
        }

        await newUser.save();
        return res.status(201).send({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('Error al registrar al cliente:', error);
        return res.status(500).send({ message: 'Error al registrar al cliente.' });
    }
};




export const updateUserData = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = await User.findById(id); // Encuentra el usuario por su id

        if (!currentUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Actualiza los campos permitidos
        const { name, username, dpi, address, phone, email, jobname, income, role } = req.body;

        // Actualiza los campos del usuario
        currentUser.name = name || currentUser.name;
        currentUser.username = username || currentUser.username;
        currentUser.dpi = dpi || currentUser.dpi;
        currentUser.address = address || currentUser.address;
        currentUser.phone = phone || currentUser.phone;
        currentUser.email = email || currentUser.email;
        currentUser.jobname = jobname || currentUser.jobname;
        currentUser.income = income || currentUser.income;
        currentUser.role = role || currentUser.role;

        await currentUser.save();

        return res.send(currentUser);
    } catch (error) {
        console.error('Error updating user data:', error);
        return res.status(500).send({ message: 'Error updating user data' });
    }
};


export const getUserData = async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(404).send({ message: 'User not found' });
        }

        return res.send(currentUser);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).send({ message: 'Error fetching user data' });
    }
};

export const getU = async (req, res) => {
    try {
        let users = await User.find().populate();
        if (!users) return res.status(404).send({ message: 'There are no user' })
        return res.send({ users })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting users' })
    }
}

export const deleteU = async (req, res) => {
    try {
        let { id } = req.params
        let deletedUser = await User.findOneAndDelete({ _id: id })
        if (!deletedUser) return res.status(404).send({ message: 'User not found and not deleted' })
        return res.send({ message: `User with name ${deletedUser.name} deleted successfully` })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting user' })
    }
}

export const resetPassword = async (req, res) => {
    const { identifier, newPassword } = req.body;

    try {
        // Buscar el usuario por su nombre de usuario o correo electrónico
        const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar la contraseña del usuario
        user.password = hashedPassword;
        await user.save();

        return res.status(200).send({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        return res.status(500).send({ message: 'Error del servidor' });
    }
};