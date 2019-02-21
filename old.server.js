const fs = require('fs');
//const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const Shh = require('web3-shh');
const Express = require('express');

const app = Express();
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e4c80087f04c4a51ba9a4bf1d43897b5"));
// Shh.attach(web3, "shh");

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
    // console.log("web3.eth.blockNumber =", web3.eth.blockNumber);
    // console.log("web3.eth =", web3.eth);
    // console.log("web3 =", web3);
    // console.log ("web3.shh.version =", web3.shh.version);
    // console.log ("web3.version.api =", web3.version.api)
    // console.log ("web3.shh.info =", web3.shh.info)
    const abi = JSON.parse(fs.readFileSync('./abi/contractAbi6040.json','utf-8'));
    var MyContract = web3.eth.contract(abi);
    var myContractInstance = MyContract.at('0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f');

    async function connect() { //note async function declaration
        if(!await web3.isConnected()){ //await web3@0.20.5
        //if(!await web3.eth.net.isListening()){ //await web3@1.0.0-beta.34
            console.log("notconnected");
            process.exit();
        }
    
        console.log("Start await web3.shh.newSymKey");
        var kId = await web3.shh.newSymKey(); //note await
        console.log("=================== await web3.shh.newSymKey() ======================");
        console.log(kId);
    
    }
    
    connect();
    // console.log(myContractInstance);
    console.log(myContractInstance.totalSupply());
    console.log(myContractInstance.symbol());
  /*   console.log(myContractInstance.OfferToSell({}, {fromBlock: 0, toBlock: 'latest'})
    .get((err, res) => {
        console.log(res);
      })); */

      var offersVar = myContractInstance.OfferToSell( {}, { fromBlock: 0, toBlock: 'latest' } );
      var offresVarFiltered = offersVar.get((err, logs) => {
        const accounts = {};
        for (let i = 0; i < logs.length; i++) {
          const log = logs[i];
          accounts[log.args.seller] = 1;
        }
        console.log(accounts);
        const arrayAccounts = Object.keys(accounts);
        const allOffersToSell = new Array();
        let loops = 0;
        let index = 0;
        for (let i = 0; i < arrayAccounts.length; i++) {
          this._tokenContract.showOffersToSell(arrayAccounts[i], (err, result) => {
            if (err != null) {
              console.log('Error ' + err);
              reject(err);
            }
            if (result[0]) {
              // console.log(`arrayAccounts[i] ${arrayAccounts[i]}`);
              allOffersToSell[index] = {
                seller: arrayAccounts[i], 
                valueLot: result[1], 
                price: result[2], 
                status: result[0] 
              };
              ++index;
            }
            ++loops;

            if (loops >= arrayAccounts.length) {
              resolve(allOffersToSell);
              console.log(allOffersToSell);
            }
          });
        }
      });

/*       if (web3.isConnected())
        console.log("Web3 connection established");
      else
        throw "No connection"; */
    
    //   console.log(offresVarFiltered);


    myContractInstance.Transfer().watch(function(err, payload) {
        if(err || payload.args == undefined) {
          console.log("=================== Error Payloads Checking ======================");
          console.log(err);    // err => [Error: filter not found]
        }
    });
    // watch for an event with {some: 'args'}
    // var myEvent = myContractInstance.OfferToSell({}, {fromBlock: 0, toBlock: 'latest'});
    // myEvent.watch(function(error, result){
    //     if(!error) {
    //         console.log(result);
    //     }
    // });

    
    // // would get all past logs again.
    // var myResults = myEvent.get(function(error, logs){ 
    //     if(!error) {
    //         console.log(`logs ${logs}`);
    //     }
    // });
    
    // // would stop and uninstall the filter
    // myEvent.stopWatching();
    res.send('/fresh2');
});

app.get('/filter1', (err, res) => {
    const filter = web3.eth.filter({
        fromBlock: 0,
        toBlock: 'latest',
        address: contractAddress,
        topics: [web3.sha3('OfferToSell(address,uint256,uint256)')]
      }).get(function (err, result) {
          console.log(result);
          app.send('OK');
      })
      
});

app.get('/filter2', (err, res) => {
    console.log(contractInstance.event);
    contractInstance.event.OfferToSell({
        filter: {},
        fromBlock: 0,
        toBlock: 'latest'
        }, function(error, event){ 
            console.log(event); 
    })
})

app.listen(3003, () => console.log('Example app listening on port 3003'));