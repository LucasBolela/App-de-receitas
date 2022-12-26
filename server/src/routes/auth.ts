import { prisma } from '../lib/prisma';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../helpers/HttpErrors';


export const authRoutes = Router();

authRoutes.post('/signup', async function signUpRoutes(request: Request, response: Response, next: NextFunction) {
    try {
        const createuserBody = z.object({
            email: z.string().email(),
            name: z.string(),
            password: z.string(),
            isAdmin: z.boolean().optional(),
        });
    
        const { email, name, isAdmin, password } = createuserBody.parse(request.body);
    
        let user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });
    
        if (user) {
            throw new BadRequestError(`Email ${email} already exists!`);
        }
    
        const hashPassword = await bcrypt.hash(password, 10);
    
        user = await prisma.user.create({
            data: {
                email: email,
                name: name,
                isAdmin: isAdmin,
                password: hashPassword,
            }
        })
    
        return response.status(201).send(`User ${name} created sucessfully!`)
    } catch (err) {
        next(err);
    }

});

authRoutes.put('/forget-password/:id', async (request: Request, response: Response, next: NextFunction) => {
    try {

        const getIdParams = z.object({
            id: z.string().transform(str => Number(str))
        })
    
        const passwordBody = z.object({
            password: z.string(),
        })
    
        const { id } = getIdParams.parse(request.params);
    
        const { password } = passwordBody.parse(request.body);
    
        const hashPassword = await bcrypt.hash(password, 10);
    
        await prisma.user.update({
            data: {
                password: hashPassword, 
            },
            where: {id: id}
        });
    
        return response.status(200).send("Password updated successfully!")
    } catch (err) {
        next(err);
    }
});

authRoutes.post('/login', async (request: Request, response: Response, next: NextFunction) => {
    try {

        const authBody = z.object({
            email: z.string().email(),
            password: z.string()
        });
    
        const { email, password } = authBody.parse(request.body);
    
        const user = await prisma.user.findUnique({
            where: {
                email,
            }
        });
    
        if (!user) throw new BadRequestError("E-mail or password invalid!");
    
        const verifyPass = await bcrypt.compare(password, user.password);
    
        if (!verifyPass) throw new BadRequestError("E-mail or password invalid!");
    
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_PASS || '',
            { expiresIn: '1h'}
        );
    
        const { password:_, ...userLogin } = user;

        return response.status(200).send({
            token,
            user: userLogin
        });

    } catch (err) {
        next(err);
    }
});