const ttn = require("ttn")
const express = require("express")
var expressWs = require("express-ws")
var basicAuth = require('express-basic-auth')
const fs = require("fs")
const path = require("path")
var expressWs = expressWs(express())

var app = expressWs.app
app.use(basicAuth({
    users: {'paul': 'yk57ufc'},
    challenge: true,
    realm: 'nodesensors',
}))
console.log("Starting server ...")

const appID = "dampness-monitor" // Change this to your app ID
const accessKey = "ttn-account-v2.fM3yZyyeCezGVhPYe6Q8FAe7KNou_EfMsHSHlt2sfTE" // Change this to your access key

//const deviceID = "pauls_lopy"

//const server = express()
//

// get the path to the directory in which is the file
const dir = process.env.DATA_DIR || "."
// set the constant to the full path of the file named data.json in the current directory.
const file = path.resolve(dir, "data.json")
// open the file named data.json as we previously set it up in the const file.
fs.openSync(file, 'a')

// function reading the data and returning a promise with the JSON data.
const read = function () {
    return new Promise(function (resolve, reject) {
	// start reading the file
	fs.readFile(file, "utf8", function (err, data) {
	    if (err) {
		return reject(err)
	    }
	    // return the parsed data
	    return resolve(JSON.parse(data || "[]"))
	})
    })
}

// function writing the data to the JSON file.
const write = function (data) {
    return new Promise(function (resolve, reject) {
	fs.writeFile(file, JSON.stringify(data), "utf8", function (err) {
	    if (err) {
		return reject(err)
	    }
	    return resolve()
	})
    })
}

// we will buffer data here
buffer = []

read().then(data => buffer = data)

//ws(server)

app.use(express.static("public"))

var aWss = expressWs.getWss("/data")


ttn.data(appID, accessKey)
    .then(function (client) {
	client.on("uplink", function (devID, payload) {
	    console.log("Received uplink from", devID)
	    console.log(payload)
	    aWss.clients.forEach(function(wsClient) {
		console.log("sending to client")
		wsClient.send(JSON.stringify(payload))
	    })
	    
	    // store the payload in the buffer
	    buffer.push(payload)
	    write(buffer)
	})
    })
    .catch(function (error) {
	console.error(error)
	ws.close()
    })

app.ws("/data/:count", function (ws, req) {
    console.log("New websocket opened")
    var pcount = req.params.count
    console.log("req.params.count: ", pcount)
    // send all items in the buffer
    //console.log("buffer ", buffer)
    // sends all items in array
    //buffer.forEach(function (payload) {
    // sends last 500 items in array
    buffer.slice(Math.max(buffer.length - pcount, 1)).forEach(function (payload) {
	ws.send(JSON.stringify(payload))
    })

//    ws.on("close", function () {
//	client.close()
//    })

    // Listen to WebSocket events coming from the client.
    ws.on("message", function (payload) {
	const parsed = JSON.parse(payload)
	console.log("Received websocket message", parsed)
	// checking if the message comming from the websocket is indead a "downlink" event
	if (parsed && parsed.type == "downlink") {
	    console.log("Scheduling downlink", parsed)
	    client.send(deviceID, parsed.fields)
	}
    })

})		    

// here take note that process.env is a simple object which contain all your environment variables and we are selecting the PORT one. If there's not any port defined we simply use the 4000 one on localhost.
const port = parseInt(process.env.PORT, 10) || 4000
console.log("HTTP server listening on", port, "...")
app.listen(port)
