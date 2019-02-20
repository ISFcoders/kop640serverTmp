const fs = require('fs');
const Web3 = require('web3'); // ! внутри package.json указана версия web3: 1.0.0-beta.46
const Express = require('express');

// ###########################################################
// var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
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
    // eContract.events.OfferToSell({address: contractAddress, fromBlock:0, toBlock:'latest'}, function(error, result) { // ! { address, from, to }
    // console.log(eContract.events.OfferToBuy({filter: {}, fromBlock:0, toBlock:'latest'}));
    eContract.events.OfferToSell({filter: {}, fromBlock:0, toBlock:'latest'}, function(error, result) { // ! { address, from, to }
        // ! будет выполнено через несколько секунд...
        // console.log(result);
        // console.log(result);
        // console.log('error = ', error);
        // console.log('result = ', result);
        // console.log(result.returnValues);
        // console.log(result.returnValues[1]);
    })
    .on('data', (event) => {
        // console.log(event); // same results as the optional callback above
        // console.log(web3.eth.abi.encodeFunctionSignature('OfferToBuy(address,uint256,uint256)'));
        // console.log('event.raw.topics = ', event.raw.topics[1]);
        // console.log('event.signature = ', event.signature);

        console.log(
        web3.eth.abi.decodeLog([{
            type: 'address',
            name: 'seller',
            indexed: true
        },{
            type: 'uint256',
            name: 'valueLot',
            // indexed: false
        },{
            type: 'uint256',
            name: 'price',
            // indexed: false
        }],
        event.raw.data,
        event.raw.topics[1])); // ! topics[1] - has address
    })
    .on('changed', (event) => {
        // remove event from local database
    });
    res.send('/fresh');
});

app.listen(3005, function() {
    console.log('Starting listener on port 3005')
});