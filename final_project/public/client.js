// public/client.js
const ws = new WebSocket("ws://" + window.location.host + "/data/500")

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
	device: event.dev_id,
	humidity: event.payload_fields.humidity,
	battery: event.payload_fields.battvoltage,
	temperature: event.payload_fields.temperature
    }

    // draw the point
    drawEvent(point)
}

// Create the charts
var chartl1 = Highcharts.chart("graphl1", {
    chart: {
	type: "line",
    },
    title: {
	text: "Sensor 1",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		//return Highcharts.dateFormat("%H:%M:%S", this.value)
		return Highcharts.dateFormat("%H:%M %d/%m", this.value)
	    },
	},
    },
    yAxis: {
	title: "",
    },
    series: [{
	name: "Temperature (degC)",
	data: [],
    }, {
	name: "Relative Humidity (%)",
	data: [],
    }],
})

var chartl2 = Highcharts.chart("graphl2", {
    chart: {
	type: "line",
    },
    title: {
	text: "Sensor 2",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		//return Highcharts.dateFormat("%H:%M:%S", this.value)
		return Highcharts.dateFormat("%H:%M %d/%m", this.value)
	    },
	},
    },
    yAxis: {
	title: "",
    },
    series: [{
	name: "Temperature (degC)",
	data: [],
    }, {
	name: "Relative Humidity (%)",
	data: [],
    }],
})

var chartl3 = Highcharts.chart("graphl3", {
    chart: {
	type: "line",
    },
    title: {
	text: "Sensor 3",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		//return Highcharts.dateFormat("%H:%M:%S", this.value)
		return Highcharts.dateFormat("%H:%M %d/%m", this.value)
	    },
	},
    },
    yAxis: {
	title: "",
    },
    series: [{
	name: "Temperature (degC)",
	data: [],
    }, {
	name: "Relative Humidity (%)",
	data: [],
    }],
})

var chartl4 = Highcharts.chart("graphl4", {
    chart: {
	type: "line",
    },
    title: {
	text: "Sensor 4",
    },
    xAxis: {
	title: {
	    text: "Time",
	},
	labels: {
	    formatter: function () {
		//return Highcharts.dateFormat("%H:%M:%S", this.value)
		return Highcharts.dateFormat("%H:%M %d/%m", this.value)
	    },
	},
    },
    yAxis: {
	title: "",
    },
    series: [{
	name: "Temperature (degC)",
	data: [],
    }, {
	name: "Relative Humidity (%)",
	data: [],
    }],
})


var chartbatt = Highcharts.chart("graphbattery", {
    chart: {
	type: "line",
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
		//return Highcharts.dateFormat("%H:%M:%S", this.value)
		return Highcharts.dateFormat("%H:%M %d/%m", this.value)
	    },
	},
    },
    yAxis: {
	title: "Voltage",
    },
    series: [{
	name: "Sensor 1",
	data: [],
    }, {
	name: "Sensor 2",
	data: [],
    }, {
	name: "Sensor 3",
	data: [],
    }, {
	name: "Sensor 4",
	data: [],
    }],
})


// draw new incoming events
function drawEvent (point) {
    if (point.device == "dampmon1") {
	chartl1.series[0].addPoint([
	    point.time,
	    point.temperature,
	], true, false, false)
	chartl1.series[1].addPoint([
	    point.time,
	    point.humidity,
	], true, false, false)

	chartbatt.series[0].addPoint([
	    point.time,
	    point.battery,
	], true, false, false)

    } else if (point.device == "dampmon2") {
	chartl2.series[0].addPoint([
	    point.time,
	    point.temperature,
	], true, false, false)
	chartl2.series[1].addPoint([
	    point.time,
	    point.humidity,
	], true, false, false)

	chartbatt.series[1].addPoint([
	    point.time,
	    point.battery,
	], true, false, false)

    } else if (point.device == "dampmon3") {
	chartl3.series[0].addPoint([
	    point.time,
	    point.temperature,
	], true, false, false)
	chartl3.series[1].addPoint([
	    point.time,
	    point.humidity,
	], true, false, false)

	chartbatt.series[2].addPoint([
	    point.time,
	    point.battery,
	], true, false, false)

    } else if (point.device == "dampmon4") {
	chartl4.series[0].addPoint([
	    point.time,
	    point.temperature,
	], true, false, false)
	chartl4.series[1].addPoint([
	    point.time,
	    point.humidity,
	], true, false, false)

	chartbatt.series[3].addPoint([
	    point.time,
	    point.battery,
	], true, false, false)

    }

/*
    charthumidity.series[0].addPoint([
	point.time,
	point.humidity,
    ], true, false, false)
*/

}


/*
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

*/
