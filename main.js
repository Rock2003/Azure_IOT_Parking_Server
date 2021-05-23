const app = require('express')();

const fs = require('fs');
const fileName = './file.json';
const file = require(fileName);


const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1} = require('uuid');
require('dotenv').config();

 
let lotsBlobClient = [' ', ' ', ' ']; 
let lotsBlobDownload = [' ', ' ', ' ']; 
let filesToz = [' ', ' ', ' ']; 
let lotsIsFull = [false, false, false]; 


async function main() {
    console.log('Starting...');
    // Quick start code goes here

    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;

    // Create the BlobServiceClient object which will be used to create a container client
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

    // Create a unique name for the container
    const containerName = 'data';

    // Get a reference to a container
    const containerClient = blobServiceClient.getContainerClient(containerName);


    // List the blob(s) in the container.
    for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name.startsWith('72cb2982-ec1f-4120-9611-a3de06389739/0/')) {
            lotsBlobClient[2] = blob.name;
        } else if(blob.name.startsWith('72cb2982-ec1f-4120-9611-a3de06389739/25/')) {
            lotsBlobClient[1] = blob.name;
        } else if(blob.name.startsWith('72cb2982-ec1f-4120-9611-a3de06389739/30/')) {
            lotsBlobClient[0] = blob.name;
        }
    }
    console.log(lotsBlobClient);
    
    lotsBlobClient[0] = containerClient.getBlockBlobClient(lotsBlobClient[0]);
    lotsBlobClient[1] = containerClient.getBlockBlobClient(lotsBlobClient[1]);
    lotsBlobClient[2] = containerClient.getBlockBlobClient(lotsBlobClient[2]);



    lotsBlobDownload[0] = await lotsBlobClient[0].download(0);
    lotsBlobDownload[1] = await lotsBlobClient[1].download(0);
    lotsBlobDownload[2] = await lotsBlobClient[2].download(0);


    console.log('\nDownloaded blob content...');


    for(let i = 0; i < 3; i++) {
        filesToz[i] = (await streamToString(lotsBlobDownload[i].readableStreamBody)).split('\n');
        let status = '';
        try {
            for(const tabone of filesToz[i]) {
                const obj = JSON.parse(tabone);
                status = obj.telemetry.lotState;
            }
        } catch(err) {
            console.log( i + " " + status);
        }
        if(status == 'nocar') {
            lotsIsFull[i] = false;
        } else {
            lotsIsFull[i] = true;
        }
    }


    file.lot1 = lotsIsFull[0];
    file.lot2 = lotsIsFull[1];
    file.lot3 = lotsIsFull[2];



    fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
      });

    // A helper function used to read a Node.js readable stream into a string
    async function streamToString(readableStream) {
        return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
        });
    }





}


app.get('/', (req, res) => {
    try{
        main();
    } catch(err) {
        console.log(err);
    }
    res.sendFile('C:/Users/Youssef/Desktop/Azureeeeeeeeeeee/Azure_IOT_Parking_Server/index.html');
});

app.get('/index.js',  (req, res) => {
    res.sendFile('C:/Users/Youssef/Desktop/Azureeeeeeeeeeee/Azure_IOT_Parking_Server/index.js');
});

app.get('/style.css',  (req, res) => {
    res.sendFile('C:/Users/Youssef/Desktop/Azureeeeeeeeeeee/Azure_IOT_Parking_Server/style.css');
});
app.get('/file.json',  (req, res) => {
    res.sendFile('C:/Users/Youssef/Desktop/Azureeeeeeeeeeee/Azure_IOT_Parking_Server/file.json');
});
app.get('/1-mercedes-amg-gt63-fourdoor-coupe-2019-uk-fd-hero-front.png',  (req, res) => {
    res.sendFile('C:/Users/Youssef/Desktop/Azureeeeeeeeeeee/Azure_IOT_Parking_Server/1-mercedes-amg-gt63-fourdoor-coupe-2019-uk-fd-hero-front.png');
});


app.listen(3000, () => console.log("Listening on port 3000..."));
// main().then(() => console.log('Done')).catch((ex) => console.log(ex.message));
