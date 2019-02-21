const fs = require('fs');
//const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const Shh = require('web3-shh');
const Express = require('express');

const app = Express();
// const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e4c80087f04c4a51ba9a4bf1d43897b5"));

// var ws_provider = 'wss://mainnet.infura.io/ws'
var web3 = new Web3(new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws'));
// var ZastrinPay = contract(zastrin_pay_artifacts);
// var econtract = new web3.eth.Contract(ZastrinPay.abi, '<address>');


console.log("web3.eth.blockNumber =", web3.eth.blockNumber);
// console.log("web3.eth =", web3.eth);
// console.log("web3 =", web3);
console.log ("web3.shh.version =", web3.shh.version);
console.log ("web3.version.api =", web3.version.api)
console.log ("web3.shh.info =", web3.shh.info)
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
    // console.log(abi2);
    // console.log(abi);
    // var MyContract = web3.eth.contract(abi);
    // var myContractInstance = MyContract.at('0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f');
    var myContractInstance = new web3.eth.Contract(abi, '0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f');
    // console.log(myContractInstance);
    // console.log(myContractInstance.totalSupply);
    console.log(myContractInstance.options.address);
    console.log(myContractInstance.options.jsonInterface);
    console.log(myContractInstance.options.from);
    console.log(myContractInstance.abi);
    // console.log(myContractInstance.methods.symbol());

    console.log("Starting listner ....");
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
    
/* 
    web3.eth.subscribe('OfferToSell', {} ,function(error, result) {
      if(!error) {
        console.log()
      }
    }); */

  
    
    web3.eth.clearSubscriptions();

  async function getEvents() {
    myContractInstance.events.OfferToSell({}, {fromBlock: 0, toBlock: 'latest'}, function(error, result){
      if (result !== undefined) {
        console.log(result);
        var args = result.returnValues;
        args["_txn"] = result.transactionHash;
        console.log(args);
      }
      if (error !== undefined) {
        console.log('error = ', error);
      }
    });
  }

  getEvents();

 
    
/*     myContractInstance.evensts.Transfer({}, {fromBlock: 0, toBlock: 'latest'}, (error, result) => {
      if (result !== undefined) {
        var args = result.returnValues;
        args["_txn"] = result.transactionHash;
        console.log(args);
      }
    });
 */
    res.send('/fresh2');
});

app.listen(3003, () => console.log('Example app listening on port 3003'));