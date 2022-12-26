import { prisma } from '../lib/prisma';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import multerConfig from '../config/multer';
import filePath from '../helpers/filePath';
import { BadRequestError } from '../helpers/HttpErrors';

export const recipesRoutes = Router();

const upload = multer(multerConfig);

recipesRoutes.post('/recipes', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { id } = request.user;

        const createrecipeBody = z.object({
            title: z.string(),
            content: z.string(),
        });
    
        const { title, content } = createrecipeBody.parse(request.body);
    
        const owner = await prisma.user.findUnique({
            where:{
                id,
            }
        });
    
        if (!owner) throw new BadRequestError('Owner not found!');
    
        await prisma.recipe.create({
            data: {
                title: title,
                content: content,
                ownerId: owner.id,
            }
        });
    
        return response.status(201).send(`Recipe ${title} successfully registered!`)
        
    } catch (err) {
        next(err);
    }
});

recipesRoutes.post('/recipes/image', upload.single('image'), async (request: Request, response: Response, next: NextFunction) => {
    try {
        let image = request.file?.filename;
    
        if (!image) throw new BadRequestError('Image not working!')
    
        image = image.split(' ').join('-');
    
        const recipeFileBody = z.object({
            legend: z.string().optional(),
            recipeId: z.string().transform(str => Number(str))
        });
    
        const { legend, recipeId } = recipeFileBody.parse(request.body);
    
        const files = await prisma.recipeFiles.create({
            data: {
                path: image,
                recipeId,
                legend,
            }
        });
        
        return response.json({
            message: `Image registered!`,
            files
        });
        
    } catch (err) {
        next(err);
    }
})

recipesRoutes.get('/recipes', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const recipes = await prisma.recipe.findMany({
            select: {
                id: true,
                title: true,
                content: true,
                owner: {
                    select: {
                        name: true
                    }
                },
                files: {
                    select: {
                        id: true,
                        legend: true,
                        path: true
                    },
                }
            },
            orderBy: {
                id: 'desc'
            }
        });

        const recipeCount = await prisma.recipe.count();
    
        const newRecipes = recipes.map(recipe => {
            let newRecipe = recipe.files.map(file => {
                let url = filePath() + file.path;
                return {...file, url}
            })
            return {
                ...recipe,
                files: newRecipe
            }
        });
    
        return response.status(200).send({
            recipes: newRecipes,
            count: recipeCount,
        });
        
    } catch (err) {
        next(err);
    }
});

recipesRoutes.get('/recipes/user/:id', async (request: Request, response: Response, next: NextFunction) => {
    try {
        const getUserParams = z.object({
            id: z.string().transform(str => Number(str))
        });
    
        const { id } = getUserParams.parse(request.params);
    
        const recipes = await prisma.recipe.findMany({
            where: {
                ownerId: id
            },
            orderBy:{
                id: 'desc'
            }
        });

        const countRecipes = await prisma.recipe.count({
            where: {
                ownerId: id
            },
        });
    
        return response.status(200).send({recipes, count: countRecipes});
        
    } catch (err) {
        next(err);
    }
});