const fs = require('fs');
const Web3 = require('web3'); // web3: 1.0.0-beta.46
const Express = require('express');

/*
const util = require('util');
var logFile = fs.createWriteStream('offersToSell.ts', { flags: 'w' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;
*/

const app = Express();
const wsProvider = "wss://ropsten.infura.io/ws";
const web3 = new Web3(new Web3.providers.WebsocketProvider(wsProvider));
const contractAddress = "0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
const contractABI = JSON.parse(fs.readFileSync("./abi/contractAbi6040.json", "utf-8"));
const eContract = web3.eth.Contract(contractABI, contractAddress);

const fileOffersToSell = "./data/offers-to-sell.json";
let allOffersToSell = [];

init();
setInterval(requestAllOffersToSell, 50000);

function init() {
    if (!fs.existsSync(fileOffersToSell)) {
        updateOffersToSell();
    }
}

function updateOffersToSell() {
    fs.writeFileSync(fileOffersToSell, JSON.stringify(allOffersToSell));
    console.log('file update: offersToSell');
}

function requestAllOffersToSell() {
    let allOffers = [];
    getEvents();
    setTimeout(updateOffersToSell, 9000);
    console.log('blockchain request: offersToSell');

    async function getEvents() {
        eContract.events
            .OfferToSell({filter: {}, fromBlock: 0, toBlock: 'latest'}, function (error, result) {
            })
            .on('data', (event) => {
                let eventsJSON = web3.eth.abi.decodeLog(
                    [{
                        type: 'address',
                        name: 'seller',
                        indexed: true
                    }, {
                        type: 'uint256',
                        name: 'valueLot',
                        indexed: false
                    }, {
                        type: 'uint256',
                        name: 'price',
                        indexed: false
                    }],
                    event.raw.data,
                    event.raw.topics[1]); // topics[1] has address

                makeRequest(eventsJSON.seller);
                allOffersToSell = allOffers;
            });
    }

    async function makeRequest(seller) {
        eContract.methods
            .showOffersToSell(seller)
            .call({from: seller}, (err, result) => {
                let allOffersToSell = [];
                let index = 0;
                if (result) {
                    allOffersToSell[index] = {
                        seller: seller,
                        valueLot: result[1],
                        price: result[2],
                        status: result[0]
                    };
                    allOffers[allOffers.length] = allOffersToSell[index];
                    // console.log(allOffersToSell[index]);
                }
            });
    }
}

app.get('/request/sell', function(req, res) {
    requestAllOffersToSell();
    res.send('/request/sell');
});

app.get('/info', function(req, res) {
    res.send(`Offers count: ${ allOffersToSell.length } <br /> ${ JSON.stringify(allOffersToSell) }`);
});

app.get('/getfile/sell', function(req, res) {
    res.send(fs.readFileSync(fileOffersToSell, 'utf-8'));
});

app.listen(3005, function() {
    console.log('Starting listener on port 3005');
});