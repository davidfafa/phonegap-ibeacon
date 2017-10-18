// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var eventCnt = 1;
var isMonitorRunning = false;
var isRangeRunning = false;


var logToDom = function (message) {		
	//var e = document.getElementById('result');	
	//e.innerText = message;
	var node = document.createElement("p");                  // Create a <p> node
	var textnode = document.createTextNode(message);         // Create a text node
	node.appendChild(textnode);                              // Append the text to <p>	
	document.getElementById("result").appendChild(node);     // Append <p> to <div> with id="result" 
};	

var clearLog = function() {
	document.getElementById("result").innerText='';
	eventCnt = 1;
}

/**
 * Function that creates a BeaconRegion data transfer object.
 * 
 * @throws Error if the BeaconRegion parameters are not valid.
 */
function createBeacon() {
//    var uuid = '00000000-0000-0000-0000-000000000000'; // mandatory
	var uuid = 'fda50693-a4e2-4fb1-afcf-c6eb07647825'; // mandatory
    var identifier = 'myiBeacon'; // mandatory
    var minor = ''; // optional, defaults to wildcard if left empty
    var major = ''; // optional, defaults to wildcard if left empty

    // throws an error if the parameters are not valid
    var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
   
    return beaconRegion;   
} 

//////////////////////////////iBeacon Start Monitoring/////////////////////
function startMonitoring() {
	clearLog();
	var delegate = new cordova.plugins.locationManager.Delegate();
	
	delegate.didDetermineStateForRegion = function (pluginResult) {
		logToDom('['+eventCnt+'] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
	//	cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;
	};

	delegate.didStartMonitoringForRegion = function (pluginResult) {
		logToDom('didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
	};

	delegate.didRangeBeaconsInRegion = function (pluginResult) {
		logToDom('['+eventCnt+'] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;
	};

	//var uuid = 'fda50693-a4e2-4fb1-afcf-c6eb07647825';
	//var identifier = 'myiBeacon';
	//var minor = 10001;
	//var major = 23366;
	var beaconRegion = createBeacon();//new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

	cordova.plugins.locationManager.setDelegate(delegate);

	// required in iOS 8+
	cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
	// or cordova.plugins.locationManager.requestAlwaysAuthorization()	
	
	//Start monitoring a single iBeacon
	cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e);logToDom('startMonitoringForRegion fail:' + e.message);myApp.alert(e.message);})
	.done();
	
}
//////////////////////////////iBeacon Stop Monitoring/////////////////////
function stopMonitoring() {
	var beaconRegion = createBeacon();
	
	//Stop ranging a single iBeacon
	cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();
}

//////////////////////////////iBeacon Start Ranging/////////////////////
function startRanging() {
	clearLog();
	var delegate = new cordova.plugins.locationManager.Delegate();
	
	delegate.didDetermineStateForRegion = function (pluginResult) {
		logToDom('['+eventCnt+'] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
		//cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;
	};

	delegate.didStartMonitoringForRegion = function (pluginResult) {
		logToDom('['+eventCnt+']didStartMonitoringForRegion:' + JSON.stringify(pluginResult));
		eventCnt++;
	};
	
	delegate.didEnterRegion = function (pluginResult) {
		logToDom('['+eventCnt+']didEnterRegion:' + JSON.stringify(pluginResult));
		eventCnt++;
	};
	
	delegate.didExitRegion = function (pluginResult) {
		logToDom('['+eventCnt+']didExitRegion:' + JSON.stringify(pluginResult));
		eventCnt++;
	};

	delegate.didRangeBeaconsInRegion = function (pluginResult) {
		logToDom('['+eventCnt+'] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;
	};

	//var uuid = 'fda50693-a4e2-4fb1-afcf-c6eb07647825';
	//var identifier = 'myiBeacon';
	//var minor = 10001;
	//var major = 23366;
	var beaconRegion = createBeacon();//new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

	cordova.plugins.locationManager.setDelegate(delegate);

	// required in iOS 8+
	cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
	// or cordova.plugins.locationManager.requestAlwaysAuthorization()

	//Start ranging a single iBeacon
	cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
		.fail(function(e) { console.error(e);logToDom('startRangingBeaconsInRegion fail:' + e.message);myApp.alert(e.message,'Error');})
		.done();	
}
//////////////////////////////iBeacon Stop Ranging/////////////////////
function stopRanging() {
	var beaconRegion = createBeacon();
	
	//Stop ranging a single iBeacon
	cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
  //  console.log("Device is ready!");
	 cordova.plugins.locationManager.isBluetoothEnabled()
    .then(function(isEnabled){
     //   console.log("isEnabled: " + isEnabled);	
		logToDom('[DOM] isBluetoothEnabled: ' + isEnabled);
        if (isEnabled) {
           // cordova.plugins.locationManager.disableBluetooth();
        } else {
            cordova.plugins.locationManager.enableBluetooth();        
        }
    })
    .fail(function(e) { console.error(e); })
    .done();
	
});

$$('.monitor .button').on('click', function () {
   if(isMonitorRunning) {
		stopMonitoring();
		isMonitorRunning = false;
		this.innerText = 'Start Monitoring';
		this.style.color='blue';
		myApp.alert("Monitoring Stopped!",'ShakeZb');
   }
   else {
		startMonitoring(); 		
		isMonitorRunning = true;		
		this.innerText = 'Stop Monitoring';
		this.style.color='red';
   }     
});


$$('.range .button').on('click', function () {
   if(isRangeRunning) {
		stopRanging();
		isRangeRunning = false;
		this.innerText = 'Start Ranging';
		this.style.color='blue';
		myApp.alert("Ranging Stopped!",'ShakeZb');
   }
   else {
		startRanging(); 		
		isRangeRunning = true;		
		this.innerText = 'Stop Ranging';
		this.style.color='red';
   }     
});

$$('.clear .button').on('click', function () {   
     clearLog();
});



// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})