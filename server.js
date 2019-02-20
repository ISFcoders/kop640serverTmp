const fs = require('fs');
const Web3 = require('web3'); // ! внутри package.json указана версия web3: 1.0.0-beta.46
const Express = require('express');

// ###########################################################
// var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('offersToSell.ts', { flags: 'w' });
  // Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

// ###########################################################

const app = Express();
const wsProvider = "wss://ropsten.infura.io/ws"; // ! wss
const web3 = new Web3(new Web3.providers.WebsocketProvider(wsProvider)); // ! Websocket
const contractAddress = "0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
const contractABI = JSON.parse(fs.readFileSync('./abi/contractAbi6040.json','utf-8'));
const eContract = web3.eth.Contract(contractABI, contractAddress); // ! eth.Contract

app.get('/fresh', function(req, res) {

    getEvents();

    async function getEvents() {
        eContract.events.OfferToSell({filter: {}, fromBlock:0, toBlock:'latest'}, function(error, result) { })
        .on('data', (event) => {

            let eventsJSON = web3.eth.abi.decodeLog([{
                type: 'address',
                name: 'seller',
                indexed: true
            },{
                type: 'uint256',
                name: 'valueLot',
                indexed: false
            },{
                type: 'uint256',
                name: 'price',
                indexed: false
            }],
            event.raw.data,
            event.raw.topics[1]); // ! topics[1] - has address

            makeRequest(eventsJSON.seller);

            // console.log(eventsJSON.seller);

        })
    }

    async function makeRequest(seller) {
        eContract.methods.showOffersToSell(seller).call({from: seller}, (err, result) => {
            let allOffersToSell = [];
            let index = 0;
            if(result) {
                allOffersToSell[index] = {
                    seller: seller, 
                    valueLot: result[1], 
                    price: result[2], 
                    status: result[0] 
                };
                console.log(allOffersToSell[index]);
            index++;
            }
        });
    }

    // makeRequest();

/*     let allOffersToSell;
    eContract.methods.showOffersToSell(eventsJSON.seller).call((err, result) => {
        console.log(result);
            if (err != null) {
            console.log('Error ' + err);
          }
          if (result[0]) {
            allOffersToSell[index] = {
              seller: eventsJSON.seller, 
              valueLot: result[1], 
              price: result[2], 
              status: result[0] 
            };
        }
    }); */


    res.send('/fresh');
});

app.listen(3005, function() {
    console.log('Starting listener on port 3005')
});