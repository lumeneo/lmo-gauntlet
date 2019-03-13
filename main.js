var request = require('request');

console.log("This client runs backend processes in here also");


var options = {
  uri: 'http://localhost:8070/json_rpc',
  method: 'POST',
  json: {"jsonrpc":"2.0","id":1,"password":"password","method":"getStatus","params":{}}
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("it is here"+JSON.stringify(response.body)); // Print the shortened url.
    //sender.send('mainprocess-response', JSON.stringify(response.body));
  }else{
    console.log(error);
  }
});

var options2 = {
  uri: 'http://localhost:8070/json_rpc',
  method: 'POST',
  //json: {"jsonrpc":"2.0","id":1,"password":"password","method":"sendTransaction","params":{"transfers":[{"address":"darkjwUGb5seYKVd2pB45ND78quwLKaaGAJPZp8yeDKdXWPDpBaCaZU54mxuEKemqn7mUpTQ6QDiHJKuQyVbk7mB4srHa36Ks1","amount":500000}],"fee":100000,"anonymity":3,"changeAddress":"darkKKmNMKoRuZaDZKEhEMCxjPsrBzoBM6g884auquqwEepqnaPAZwchnWKoPJpSBfS2CyJ6euEXgg9zKQS2EmBp4DKhGigrnk"}}
  json: {"jsonrpc":"2.0","id":1,"password":"password","method":"getTransaction","params":{"transactionHash":"c8dab34a083a11e7091927d74420cee1d07f5552d5ed9722856581d41632589b"}}
};

request(options2, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log("it is here"+JSON.stringify(response.body)); // Print the shortened url.
    //sender.send('mainprocess-response', JSON.stringify(response.body));
  }else{
    console.log(error);
  }
});

function listlockunspent(sender){

  var returnUSTXL = "";

  rpc.listlockunspent().then(result => {
    console.log("im in the return");
    var resx = JSON.stringify(result);
    var resx2 = JSON.parse(resx)["result"]
    //console.log(JSON.parse(resx)["result"][0]["txid"]);
    for(tx in resx2){
      console.log(resx2[tx]["txid"]);
      returnUSTXL = returnUSTXL+resx2[tx]["txid"]+"\n";
      rpc.gettransaction(resx2[tx]["txid"]).then(txresult => {
        var restx = JSON.stringify(txresult);
        var restx2 = JSON.parse(restx)["result"]["details"];
        console.log(JSON.parse(restx)["result"]);
        returnUSTXL = returnUSTXL+JSON.parse(restx)["result"];
        console.log(JSON.stringify(restx2))
        returnUSTXL = returnUSTXL+JSON.stringify(restx2);
      });

    }
    //console.log(resx2);
    //console.log(result);
    sender.send('mainprocess-response', "UNSPENT LOCKED FUNDS: "+returnUSTXL);
  }).catch(error => {
    console.log(error);
  });

}

var balance;

function callBackMyBalance(stringed){
  balance = stringed;
}

function callmybalance(sender,address){

  console.log("in the function"+address);



  client.getBalance(address, 6, function(err, balance, resHeaders) {
    if (err) return console.log(err);
    console.log('Balance:', balance);
    sender.send('mainprocess-response', "its here"+balance);
  });



}

const {ipcMain} = require('electron');

// Attach listener in the main process with the given ID
ipcMain.on('request-mainprocess-action', (event, arg) => {
    // Displays the object sent from the renderer process:
    //{
    //    message: "Hi",
    //    someData: "Let's go"
    //}
    var balance;
      if(JSON.parse(JSON.stringify(arg))["command"] == "getBalance"){
        balance = callmybalance(event.sender,JSON.parse(JSON.stringify(arg))["Key"]);
      }else if(JSON.parse(JSON.stringify(arg))["command"] == "getLockedUnspent"){
        listlockunspent(event.sender);
      }
      console.log(
          arg
      );
});

ipcMain.on('transaction-gauntlet', (event, arg) => {
  var options2 = {
    uri: 'http://149.28.240.182:8080/json_rpc',
    method: 'POST',
    //json: {"jsonrpc":"2.0","id":1,"password":"password","method":"sendTransaction","params":{"transfers":[{"address":"darkjwUGb5seYKVd2pB45ND78quwLKaaGAJPZp8yeDKdXWPDpBaCaZU54mxuEKemqn7mUpTQ6QDiHJKuQyVbk7mB4srHa36Ks1","amount":500000}],"fee":100000,"anonymity":3,"changeAddress":"darkKKmNMKoRuZaDZKEhEMCxjPsrBzoBM6g884auquqwEepqnaPAZwchnWKoPJpSBfS2CyJ6euEXgg9zKQS2EmBp4DKhGigrnk"}}
    json: {"jsonrpc":"2.0","id":1,"password":"password","method":"getTransaction","params":{"transactionHash":arg["transaction"]}}
  };

  request(options2, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log("it is here"+JSON.stringify(response.body)); // Print the shortened url.
      console.log("this is where I can start the game and credit the operator and store the database");
      var myTransaction = JSON.parse(JSON.stringify(response.body))["result"]["transaction"]["transfers"];
      for(tx in myTransaction){
        if(myTransaction[tx]["address"] == "darkjwUGb5seYKVd2pB45ND78quwLKaaGAJPZp8yeDKdXWPDpBaCaZU54mxuEKemqn7mUpTQ6QDiHJKuQyVbk7mB4srHa36Ks1"){
          //darkRrgn9QCVdCjM2e9udZ1WBwK2mFbqRf3F1fP2jmDTACQN55f7FqRg4W9wHZNWrm8tWC3R4HuUfbhZFSivjxoC6Bs3W5xBVB
          console.log("Player has funds of "+myTransaction[tx]["amount"]+ " so setting canplay to true");
          event.sender.send('gauntlet-transaction', "Player Loaded funds of "+myTransaction[tx]["amount"]);
        }
      }
      console.log(myTransaction);
      //sender.send('mainprocess-response', JSON.stringify(response.body));
    }else{
      console.log(error);
    }
  });

});



const { app, BrowserWindow } = require('electron')

  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  let win

  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({ width: 800, height: 600 })



    // and load the index.html of the app.
    win.loadFile('index.html')

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow)

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
