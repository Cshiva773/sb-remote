declare module 'db.ts' {
    import { Db } from "mongodb";
    
    export const connectToDatabase: () => Promise<Db>;
}