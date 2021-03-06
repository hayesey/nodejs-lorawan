console.log("Starting server...")
const ttn = require("ttn");
const app = require("express")();
const http = require("http").Server(app);
const bodyParser = require("body-parser");

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBAnj7QHSMovZ5NC6K2a5xAHFm_03FH0Is' //replace with the API key you got from Google
});

var appID = "wifi_scanner"
var accessKey = "ttn-account-v2.0xvhCscj_PtVDBONFD3Ak1Os2lWdmKSeyZf0UM7wFdY"

var macAddress1 = ""
var macAddress2 = ""
var macAddress3 = ""

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//this is the default home page of our application
app.get("/", function(req, res){
    res.sendFile(__dirname + "/map.html")
})

app.get("/2", function(req, res){
    res.sendFile(__dirname + "/map2.html")
})

app.get("/generator", function(req, res){
    googleMapsClient.geolocate({
	"considerIp": false,
	"wifiAccessPoints": [
	    {
		"macAddress": macAddress1
	    },
	    {
		"macAddress": macAddress2
	    },
	    {
		"macAddress": macAddress3
	    }
	]
    }, function(err, response) {
	console.log(response)
	console.log(response.json.location)
	return res.json(response.json.location)
    })
})

//opening mqtt connection with ttn
ttn.data(appID, accessKey)
    .then(function(client) {
	//on uplink messages
	client.on("uplink", function(devID, payload) {
	    //print the message in the console
	    console.log("Received uplink from ", devID)
	    console.log(payload.payload_fields)
	    macAddress1 = payload.payload_fields.Bssid1
	    macAddress2 = payload.payload_fields.Bssid2
	    macAddress3 = payload.payload_fields.Bssid3
	})
    })
//Error handling
    .catch(function (error) {
	console.error("Error", error)
	process.exit(1)
    })
	
http.listen(8000);
