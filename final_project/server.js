const ttn = require("ttn")
const express = require("express")
const ws = require("express-ws")
const fs = require("fs")
const path = require("path")

console.log("Starting server ...")

const appID = "dampness-monitor" // Change this to your app ID
const accessKey = "ttn-account-v2.fM3yZyyeCezGVhPYe6Q8FAe7KNou_EfMsHSHlt2sfTE" // Change this to your access key

//const deviceID = "pauls_lopy"

const server = express()
//
// we will buffer data here
const buffer = []

// get the path to the directory in which is the file
const dir = process.env.DATA_DIR || "."
// set the constant to the full path of the file named data.json in the current directory.
const file = path.resolve(dir, "data.json")
// open the file named data.json as we previously set it up in the const file.
fs.openSync(file, 'a')



ws(server)

server.use(express.static("public"))

server.ws("/data", function (ws, req) {
    console.log("New websocket opened")
    ttn.data(appID, accessKey)
        .then(function (client) {
	    // send all items in the buffer
	    buffer.forEach(function (payload) {
		ws.send(JSON.stringify(payload))
	    })

	    client.on("uplink", function (devID, payload) {
		console.log("Received uplink from", devID)
		console.log(payload)
		ws.send(JSON.stringify(payload))

		// store the payload in the buffer
		buffer.push(payload)
	    })

	    ws.on("close", function () {
		client.close()
	    })

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
        .catch(function (error) {
	    console.error(error)
	    ws.close()
	})
	    })

// here take note that process.env is a simple object which contain all your environment variables and we are selecting the PORT one. If there's not any port defined we simply use the 4000 one on localhost.
const port = parseInt(process.env.PORT, 10) || 4000
console.log("HTTP server listening on", port, "...")
server.listen(port)
