const app = require("express")();
const http = require("http").Server(app);
const io = require('socket.io')(http);
const bodyParser = require("body-parser");
const fs = require("fs")
const path = require("path")
const ttn = require("ttn")

const deviceID = "pauls_lopy"

const appID = "dampness-monitor" // Change this to your app ID
const accessKey = "ttn-account-v2.fM3yZyyeCezGVhPYe6Q8FAe7KNou_EfMsHSHlt2sfTE" // Change this to your access key

// get the path to the directory in which is the file
const dir = process.env.DATA_DIR || "."
// set the constant to the full path of the file named data.json in the current directory.
const file = path.resolve(dir, "data.json")

// the variable used to store the downlink url will now be global and changed once we receive our first uplink.
var downlink_link = ""

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

// special reading function to extract the data from the JSON file and transform them into something usable for our graph.
const readchart = function () {
    return new Promise(function (resolve, reject) {
	// start reading the file again
	fs.readFile(file, "utf8", function (err, data) {
	    if (err) {
		return reject(err)
	    }
	    // put the data into a variable
	    var datajson = JSON.parse(data || "[]")
	    //initialize an empty array
	    var tab = []
	    //for each element of our json file we get the temperature and the date
	    for (var i=0; i < datajson.length; i++){
		var obj = datajson[i]
		var temp = obj.temperature
		var date = obj.date
		// and we push it to the previously empty array
		tab.push([date, temp])
	    }
	    // return the full array with the "graph-ready" data
	    return resolve(tab || "[]")
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

// write the temperature of the uplink message to our JSON file.
function writeTemp(temp) {
    return read().then(function(data){
	var now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	var newEntry = {'date':now, 'temperature':temp}
	data.push(newEntry)
	return write(data)
    })
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html")
})

app.get('/chartdata', function(req, res) {
    console.log('GET CHARTDATA')
    return readchart().then(res.json.bind(res))
})

//the treament of the POST request made to the /on URL
app.post("/on", function(req, res) {
    //we create the message to be sent
    var msg = {
	"dev_id": deviceID,
	"port": 1,
	"payload_raw": "AQ=="
    }
    //if the downlink link is defined we send the request
    if (downlink_link != "") {
	request({
	    url: downlink_link,
	    method: "POST",
	    json: msg
	})
    }
    //if not we print an error message
    else {
	console.log("Error, wait for an uplink message to come in to get the downlink url")
    }
})

//the treament of the POST request made to the /off URL
app.post("/off", function(req, res) {
    //this is our downlink message
    var msg = {
	"dev_id": deviceID,
	"port": 1,
	"payload_raw": "AA=="
    }
    //if the downlink url is set, we send the request
    if (downlink_link != "") {
	request({
	    url: downlink_link,
	    method: "POST",
	    json: msg
	})
    }
    //if not we print the error message to the console
    else {
	console.log("Error, wait for an uplink message to come in to get the downlink url")
    }
})

app.post("/endpoint", function(req, res) {
    console.log(req.body)
    writeTemp(req.body.payload_fields.temperature)
    downlink_link = req.body.downlink_url
    io.emit('message', req.body);
    res.sendFile(__dirname + "/index.html")
})

http.listen(8000, function(){
    console.log('listening on *:8000')
    ttn.data(appID, accessKey)
        .then(function (client) {
	    // send all items in the buffer
	    //buffer.forEach(function (payload) {
		//ws.send(JSON.stringify(payload))
	    //})

	    client.on("uplink", function (devID, payload) {
		console.log("Received uplink from", devID)
		console.log(payload['payload_fields'])
		//ws.send(JSON.stringify(payload))

		// store the payload in the buffer
		//buffer.push(payload)
	    })

	})
        .catch(function (error) {
	    console.error(error)
	})
	    

});

