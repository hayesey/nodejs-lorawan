// public/client.js
const ws = new WebSocket("ws://" + window.location.host + "/data")

ws.addEventListener("open", function () {
    console.log("Socket opened!")
})

ws.addEventListener("error", function (error) {
    console.log("Socket errored:", error)
})

ws.addEventListener("message", function (message) {
    // parse incoming messages as JSON and add them to the list of events.
    var payload = JSON.parse(message.data)
    addEvent(payload)
})

// addEvent adds the event to the list of events.
function addEvent(event) {
    // create a datapoint with the values we are interested in
    var point = {
	time: new Date(event.metadata.time).valueOf(), // the time as milliseconds since the unix epoch
	//temperature: event.payload_fields.temperature_3,
	//pressure: event.payload_fields.barometric_pressure_2,
	//battery: event.payload_fields.analog_in_1
	temperature: event.payload_fields.temperature
    }

    // draw the point
    drawEvent(point)
}

// Create the chart
var charttemp = Highcharts.chart("graphtemperature", {
    chart: {
	type: "area",
    },
    title: {
	text: "Temperature",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		return Highcharts.dateFormat("%H:%M:%S", this.value)
	    },
	},
    },
    yAxis: {
	title: "Temperature",
    },
    series: [{
	name: "Temperature",
	data: [],
    }],
})
/*
var chartpress = Highcharts.chart("graphpressure", {
    chart: {
	type: "area",
    },
    title: {
	text: "Barometric Pressure",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		return Highcharts.dateFormat("%H:%M:%S", this.value)
	    },
	},
    },
    yAxis: {
	title: "Pressure",
    },
    series: [{
	name: "Pressure",
	data: [],
    }],
})

var chartbatt = Highcharts.chart("graphbattery", {
    chart: {
	type: "area",
    },
    title: {
	text: "Battery Voltage",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		return Highcharts.dateFormat("%H:%M:%S", this.value)
	    },
	},
    },
    yAxis: {
	title: "Voltage",
    },
    series: [{
	name: "Voltage",
	data: [],
    }],
})
*/

// draw new incoming events
function drawEvent (point) {
    charttemp.series[0].addPoint([
	point.time,
	point.temperature,
    ], true, false, false)
/*
    chartpress.series[0].addPoint([
	point.time,
	point.pressure,
    ], true, false, false)

    chartbatt.series[0].addPoint([
	point.time,
	point.battery,
    ], true, false, false)
*/
}


// setLED instructs the backend to send a downlink message with the led field set to status.
function setLED (status) {
    const payload = {
	type: "downlink",
	fields: {
	    state: {
		led: status,
	    },
	},
    }
    ws.send(JSON.stringify(payload))
    alert("Downlink scheduled!")
}

// select element with the id="downlink-on" in our case the LED on button and call the setLED() function with true.
document.getElementById("downlink-on").addEventListener("click", function () {
    setLED(true)
})

// select element with the id="downlink-off" in our case the LED off button and call the setLED() function with false.
document.getElementById("downlink-off").addEventListener("click", function () {
    setLED(false)
})

