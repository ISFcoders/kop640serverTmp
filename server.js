const fs = require('fs');
// const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const Shh = require('web3-shh');
const Express = require('express');

const app = Express();
// const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e4c80087f04c4a51ba9a4bf1d43897b5"));

var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));

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

const contractAddress = "0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
const contractABI = JSON.parse(fs.readFileSync('./abi/contractAbi6040.json','utf-8'));

app.get('/fresh2', (req, res) => {

    const abi = JSON.parse(fs.readFileSync('./abi/contractAbi6040.json','utf-8'));
    const abi2 = require('./abi/contractAbi6040.json');
    var myContractInstance = new web3.eth.Contract(abi, '0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f');

    // console.log("Starting listner ....");
    async function getStatus() {
      let status = await web3.eth.net.isListening();
      if (status) {
        console.log("Есть соединение");
        console.log(status);
      }
    }
    getStatus();

    async function getTotalSupply() {
      let totalSupply = await myContractInstance.methods.totalSupply().call((err, log) => {
        console.log(totalSupply);
      })
    }
    // getTotalSupply();
    
  async function getEvents() {

    let offersArray2 = await myContractInstance.once('OfferToSell', {
      filter: { address: '0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f'}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0 }, (error, event) => { console.log(event); });

    let offersArray = await myContractInstance.events.OfferToSell( {
      filter: { address: '0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f'},
      fromBlock: 0, toBlock: 'latest'});
    console.log('##############################################');
    // console.log(myContractInstance.events);
    console.log(web3.eth.events);
    console.log('##############################################');
    return offersArray;

  }

 getEvents().then((err, log) => {
  console.log('====================================================');
   console.log('log = ', log);
   console.log('err = ', err);
   console.log('====================================================');
 });

    res.send('/fresh2');
});

app.listen(3003, () => console.log('Example app listening on port 3003'));