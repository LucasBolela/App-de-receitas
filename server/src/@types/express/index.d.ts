import Express from 'express'

declare global {
    namespace Express {
        export interface Request {
            user: {
                id: number;
                name: string;
                email: string;
                isAdmin: boolean;
            }
        }
    }
}