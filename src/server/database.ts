import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import {pipeline} from "stream";

dotenv.config();

const USER_NAME = process.env.MONGO_USER!;
const PASSWORD = process.env.MONGO_PASSWORD!;
const DB_NAME = process.env.MONGO_DB!;
const CLUSTER = process.env.MONGO_CLUSTER!;
const MONGO_URI = `mongodb+srv://${USER_NAME}:${PASSWORD}@${CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

class Database {
    private static instance: Database;
    private client: MongoClient;
    private db:Db | null = null;

    private constructor() {
        this.client = new MongoClient(MONGO_URI);
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    public async connect(): Promise<Db> {
        if (!this.db){
            try{
                await this.client.connect();
                console.log(`Connected to Database: ${DB_NAME}`);
                this.db = this.client.db(DB_NAME);
            }catch(error){
                console.error("Failed to connect to Database", error);
                throw error;
            }
        }
        return this.db;
    }

    public async disconnect(): Promise<void> {
        await this.client.close();
        console.log(`Disconnected to Database: ${this.db}`);
        this.db = null;

    }
}

export default Database;
