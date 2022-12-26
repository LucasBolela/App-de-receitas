import { prisma } from '../lib/prisma';
import { Router, Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../helpers/HttpErrors';

export const userRoutes = Router();

userRoutes.get('/users', async function usersRoutes(request: Request, response: Response, next: NextFunction) {
    try {
        if (!request.user.isAdmin) throw new UnauthorizedError('User unauthorized!');
        
        let users = await prisma.user.findMany({
            select: {id: true, name: true, email: true, isAdmin: true, createdAt: true},
            orderBy: {id: 'desc'},
        });
        let usersCount = await prisma.user.count();
    
        return response.status(200).send({users, count: usersCount});
        
    } catch (err) {
        next(err);
    }
});

userRoutes.get('/profile', async (request: Request, response: Response) => {
    return response.status(200).send(request.user);
});

userRoutes.get('/profile/recipes', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.user;
    
        const recipes = await prisma.recipe.findMany({
            where: {
                ownerId: id,
            }
        })
    
        return res.status(200).send({
            recipes,
            count: recipes.length
        });
        
    } catch (err) {
        next(err);
    }
})