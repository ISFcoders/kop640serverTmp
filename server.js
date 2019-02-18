const fs = require('fs');
//const Tx = require('ethereumjs-tx');
const Web3 = require('web3');
const Express = require('express');

const app = Express();
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/e4c80087f04c4a51ba9a4bf1d43897b5"));

web3.eth.getBlock('latest', function(err, res) {
    console.log(err);
    console.log(res);

});


//const contractAddress = "0x401157C4DA67cf16841549e4D0794F7F67bc8a4f"; // "0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
const contractAddress = "0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
const contractABI = JSON.parse(fs.readFileSync('./abi/contractAbi6040.json','utf-8'));


app.get('/fresh1', function(req, res) {

    let myContract = web3.eth.contract(contractABI);
    let contractInstance = myContract.at(contractAddress);
    console.log(contractInstance);

    async function f() {
        return new Promise((resolve, reject) => {
            let res = contractInstance.OfferToSell.get({fromBlock: 0, toBlock: 'latest'});
            console.log(res);
            resolve('ok');
        });

        //const ev = await Promisify(cb => result.get(cb));
        /*result.get({fromBlock: 0, toBlock: 'latest'}, async () => {
            console.log('_');
        });*/
    };
    f().then(result => {
        console.log('then');
    });
    res.send('ok');
});

app.get('/fresh2', function(req, res){
    let contractInstance = web3.eth.contract(contractABI); //.at(contractAddress);
    //let contractInstance = myContract.at(contractAddress);
    //console.log(contractInstance);

    var events = contractInstance.OfferToBuy({address: contractAddress}, {fromBlock:0, toBlock:'latest'}).get((err, result )=> {
        console.log('ok');
    });
    console.log(events);
    events.watch(function(error, event) {
        console.log('okkkkk');
    })
    console.log(events);
    res.send('/fresh2');
});


const Promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );

app.get('/fresh', function(req, res){

    let contractInstance = web3.eth.contract(contractABI).at(contractAddress);
    console.log(contractInstance);
    async function f() {
        return new Promise((resolve, reject) => {
            contractInstance.OfferToBuy({address: contractAddress}, {fromBlock:0, toBlock:'latest'}).get((err, result )=> {
                console.log(result);
            });


                /*.then((err, logs) => {
                console.log('get');
                resolve('ok');
            });*/
        });

        //const ev = await Promisify(cb => result.get(cb));
        /*result.get({fromBlock: 0, toBlock: 'latest'}, async () => {
            console.log('_');
        });*/
    };
    f().then(result => {
        console.log('then');
    });


    //console.log(result);
    /*.get((err, logs) => {
        console.log('logs');
    });*/



    //console.log(result);

    //var contract = new web3js.eth.contract(contractABI, contractAddress); //).at(contractAddress)
    //console.log(contract.abi);
    /*contract.methods.offerToSell(
        {
            address: tokenContractAddress
        },
        {
            fromBlock: 0,
            toBlock: 'latest'
        }).call();
    */

    /*contract.methods.offerToSell(
        {
            address: tokenContractAddress
        },
        {
            fromBlock: 0,
            toBlock: 'latest'
        }
    ).get((err, logs) => {
        console.log(result);
    });*/
    res.send('ok');
});

app.get('/sendtx',function(req,res){

        var myAddress = 'ADDRESS_THAT_SENDS_TRANSACTION';
        var privateKey = Buffer.from('YOUR_PRIVATE_KEY', 'hex')
        var toAddress = 'ADRESS_TO_SEND_TRANSACTION';

        //contract abi is the array that you can get from the ethereum wallet or etherscan
        var contractABI = require('./abi/contractAbi04.json');
        var contractAddress ="0xfcbb10fbc7c0a6ef80abc6bd674ae0254fe3972f";
        //creating contract object
        var contract = new web3js.eth.Contract(contractABI,contractAddress);

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function(v){
            console.log("Count: "+v);
            count = v;
            var amount = web3js.utils.toHex(1e16);
            //creating raw tranaction
            var rawTransaction = {"from":myAddress, "gasPrice":web3js.utils.toHex(20* 1e9),"gasLimit":web3js.utils.toHex(210000),"to":contractAddress,"value":"0x0","data":contract.methods.transfer(toAddress, amount).encodeABI(),"nonce":web3js.utils.toHex(count)}
            console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx
            var transaction = new Tx(rawTransaction);
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash',console.log);
                
            contract.methods.balanceOf(myAddress).call()
            .then(function(balance){console.log(balance)});
        })
    });
app.listen(3004, () => console.log('Example app listening on port 3004'));