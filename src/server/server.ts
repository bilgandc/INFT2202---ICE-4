"use strict"

// import necessary modules and types
import express, { Request, Response } from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './contactRoutes.js';


// convert path to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// initialize express
const app = express();
const port = process.env.PORT || 3000;

async function startServer() {
    try{
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        })
    }catch(error){
        console.error("Failed to start server",error);
        process.exit(1);
    }
}

// middleware to parse incoming json payloads
app.use(express.json());

// server static file (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, '../..')));

// server static assets from node_modules for client-side user and rendering
app.use('/node_modules/@fortawesome/fontawesome-free',
    express.static(path.join(__dirname, '../../node_modules/@fortawesome/fontawesome-free')));

app.use('/node_modules/bootstrap',
    express.static(path.join(__dirname, '../../node_modules/bootstrap')));

// mount the contact routes within Node
// delegate all /api/contacts/* request to it
app.use('/api/contacts', contactRoutes);

const users = [
    {
        DisplayName: "Lady Gaga",
        EmailAddress: "ladygaga@gmail.com",
        Username: "mothermonster",
        Password: "12345",
    },
    {
        DisplayName : "Henry Cavill",
        EmailAddress: "henry@gmail.com",
        Username: "henrycavill",
        Password: "12345"
    },
    {
        DisplayName : "Chris Evans",
        EmailAddress: "chris@gmail.com",
        Username: "chrisevans",
        Password: "12345"
    },
    {
        DisplayName : "admin",
        EmailAddress: "admin@gmail.com",
        Username: "admin1",
        Password: "12345"
    }
];

// route to server the home page
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../", "index.html"));
});

// API endpoint to return the list of users as JSON
app.get('/users', (req: Request, res: Response) => {
    res.json({ users });
});

// start the server
await startServer();