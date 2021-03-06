// Code for platform detection
var isMaterial = Framework7.prototype.device.ios === false;
var isIos = Framework7.prototype.device.ios === true;

// Add the above as global variables for templates
Template7.global = {
  material: isMaterial,
  ios: isIos,
};


// Initialize app
var myApp = new Framework7({
  material: isIos? false : true,
  template7Pages: true,
  precompileTemplates: true,
  swipePanel: 'left',
  swipePanelActiveArea: '30',
  swipeBackPage: true,
  animateNavBackIcon: true,
  pushState: !!Framework7.prototype.device.os,	
});


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
var notificationID = 0;
// Dictionary of beacons.
var beacons = {};
// Timer that displays list of beacons.
var updateTimer = null;
// Specify your beacon 128bit UUIDs here.
var regions =
	[
		// Estimote Beacon factory UUID.
		//{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
		// Sample UUIDs for beacons in our lab.
		{uuid:'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'},
		{uuid:'8DEEFBB9-F738-4297-8040-96668BB44281'}
		//{uuid:'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
		//{uuid:'E20A39F4-73F5-4BC4-A12F-17D1AD07A961'},
		//{uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE'},
		//{uuid:'585CDE93-1B01-42CC-9A13-25009BEDC65E'}
];

var logToDom = function (message) {				
	$$("#result").append('<p>'+message+'</p>');
};	

var clearLog = function() {
	$$('#result').html('');		
	eventCnt = 1;
}
function displayBeaconList()
	{
		// Clear beacon list.
		$$('#found-beacons').html('');

		var timeNow = Date.now();

		// Update beacon list.
		$$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Map the RSSI value to a width in percent for the indicator.
				var rssiWidth = 1; // Used when RSSI is zero or greater.
				if (beacon.rssi < -100) { rssiWidth = 100; }
				else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

				// Create tag to display beacon data.
				var element = $$(
					'<li>'
					+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	'Proximity: ' + beacon.proximity + '<br />'
					+	'RSSI: ' + beacon.rssi + '<br />'
					+	'TX: ' + beacon.tx + '<br />'
					+	'Accuracy: ' + beacon.accuracy + '<br />'
					+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
					+ 		rssiWidth + '%;"></div>'
					+ '</li>'
				);

				//$$('#warning').remove();
				$$('#found-beacons').append(element);
			}
		});
}
/**
 * Function that creates a BeaconRegion data transfer object.
 * 
 * @throws Error if the BeaconRegion parameters are not valid.
 */
function createBeacon() {
//    var uuid = '00000000-0000-0000-0000-000000000000'; // mandatory
	var uuid = 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'; // mandatory
    var identifier = 'myiBeacon'; // mandatory
   // var minor = 10001; // optional, defaults to wildcard if left empty
    //var major = 23366; // optional, defaults to wildcard if left empty

    // throws an error if the parameters are not valid
    //var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);
	var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);
   
    return beaconRegion;   
} 

/*
//////////////////////////////iBeacon Start Monitoring/////////////////////
//not used
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

	//var uuid = 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825';
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
//not used
function stopMonitoring() {
	var beaconRegion = createBeacon();
	
	//Stop monitoring a single iBeacon	
	cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();
	
}
*/
//////////////////////////////iBeacon Start Ranging/////////////////////
function startRanging() {
	clearLog();
	var delegate = new cordova.plugins.locationManager.Delegate();
	
	delegate.didDetermineStateForRegion = function (pluginResult) {
		logToDom('['+eventCnt+'] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
		//cordova.plugins.locationManager.appendToDeviceLog('[DOM] didDetermineStateForRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;		
		if (pluginResult.region.typeName == 'BeaconRegion' &&
					pluginResult.state == 'CLRegionStateInside')
				{
					cordova.plugins.notification.local.schedule(
					{
						id: ++notificationID,
						title: 'Beacon in range',
						text: 'iBeacon Scan detected a beacon, tap here to open app.'
					});
		}
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
	//	logToDom('['+eventCnt+'] didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult));
		eventCnt++;
		for (var i in pluginResult.beacons)
		{
			// Insert beacon into table of found beacons.
			var beacon = pluginResult.beacons[i];
			beacon.timeStamp = Date.now();
			var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
			beacons[key] = beacon;
		}
	};

	//var uuid = 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825';
	//var identifier = 'myiBeacon';
	//var minor = 10001;
	//var major = 23366;
	//var beaconRegion = createBeacon();//new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);

	cordova.plugins.locationManager.setDelegate(delegate);

	// required in iOS 8+
	cordova.plugins.locationManager.requestWhenInUseAuthorization(); 
	// or cordova.plugins.locationManager.requestAlwaysAuthorization()
	
		
	for (var i in regions)
	{
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			i + 1,
			regions[i].uuid);

		//Start monitoring a single iBeacon
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
		.fail()
		.done();
		
		
		//Start ranging a single iBeacon
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail()
			.done();
	}
/*
	//Start monitoring a single iBeacon
	cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e);logToDom('startMonitoringForRegion fail:' + e.message);myApp.alert(e.message);})
	.done();
	
	
	//Start ranging a single iBeacon
	cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
		.fail(function(e) { console.error(e);logToDom('startRangingBeaconsInRegion fail:' + e.message);myApp.alert(e.message,'Error');})
		.done();	
		*/
}
//////////////////////////////iBeacon Stop Ranging/////////////////////
function stopRanging() {
	for (var i in regions)
	{
		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			i + 1,
			regions[i].uuid);

		//Stop monitoring a single iBeacon	
		cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
		.fail()
		.done();
		
		
		//Stop ranging a single iBeacon	
		cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
		.fail()
		.done();
	}
	/*
	var beaconRegion = createBeacon();
	
	//Stop monitoring a single iBeacon	
	cordova.plugins.locationManager.stopMonitoringForRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();
	
	
	//Stop ranging a single iBeacon	
	cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion)
	.fail(function(e) { console.error(e); })
	.done();*/
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
		clearInterval(updateTimer);
		myApp.alert("Monitoring Stopped!",'ShakeZb');
   }
   else {
		startMonitoring(); 		
		isMonitorRunning = true;		
		this.innerText = 'Stop Monitoring';
		this.style.color='red';
		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 500);
   }     
});


$$('.range .button').on('click', function () {
   if(isRangeRunning) {
		stopRanging();
		isRangeRunning = false;
		this.innerText = 'Start Ranging';
		this.style.color='blue';
		clearInterval(updateTimer);
		myApp.alert("Ranging Stopped!",'ShakeZb');
   }
   else {
		startRanging(); 		
		isRangeRunning = true;		
		this.innerText = 'Stop Ranging';
		this.style.color='red';
		// Display refresh timer.
		updateTimer = setInterval(displayBeaconList, 500);
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