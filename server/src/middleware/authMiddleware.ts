import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

type JwtPayload = {
    id: number;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) =>  {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).send('Unauthorized!');
    
    const token = authorization.split(' ')[1];

    try {
        const { id } = jwt.verify(token, process.env.JWT_PASS || '') as JwtPayload;
        
        const user = await prisma.user.findUnique({
            where: {
                id
            }
        });
    
        if (!user) return res.status(401).send('Unauthorized!');
    
        req.user = {id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin};
    
        next();
    } catch (error) {
        return res.status(400).json({error})
    }
}