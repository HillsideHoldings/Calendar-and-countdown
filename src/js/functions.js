/**
COMMON FUNCTIONS AND VARIABLES FOR ALL PARTS OF THE APPLICATION. 
*/

//Data store
var dataStore = chrome.storage.sync;

//Debug object. If true, we are in debug mode. Checks if ID is the official Google ID or not.
var debug = (chrome.runtime.id == "caplfhpahpkhhckglldpmdmjclabckhc") ? false : true;
var version = getVersion();

//New date and settings objects to persist to synced storage
var settings = {}; //new Object();
var dates = {}; //new Object();

var ccDates = [];

/**
 * Output to log if "debug" is true
 * 
 * @param cat Logging category
 * @param text Text to log
 */
function log(cat, text)
{
    logger("old", cat, text);
}

//Custom timer function to track various timers to google.
function timer(name)
{
	try
	{
		this.name = "Not set";
		if(typeof(this.name)!== undefined) this.name = name;

		this.start = function(){
			this.beginTime = new Date();
			this.spent = null;
		};

		this.stop = function() {
			this.stopTime = new Date();
			this.spent = this.stopTime - this.beginTime;
			trackTiming(this.name, this.spent);
		};

		this.start();
	}
	catch(e)
	{

	}

}

function logger(type, cat, text)
{
    var time = new Date();
    
   // debug = true;

    switch(type)
    {
        case "debug":
            if(debug) console.log(time.toLocaleTimeString(), "(debug)", cat, ":", text);
        break;
        
        case "info":
            if(debug) console.log(time.toLocaleTimeString(),"(info) ", cat, ":", text);
        break;
        
        case "old": 
			if(debug) console.log(time.toLocaleTimeString(),"(old)  ", cat, ":", text);
        break;
        
        default: 
            if(debug) console.log(time.toLocaleTimeString(), "(?)    ", cat, ":", text);
        break;
    }
    
}

function handleError(where, e)
{
    var time = new Date();
    console.error(time.toLocaleTimeString(), where, e.name, e.message);
	trackError(where, e.name, e.message);
}


/**
Get version of extension. 
*/
function getVersion() {

    try {
		var manifest = chrome.runtime.getManifest();
		var version = manifest.version;
		
		//Create and set up object for returning
		var returnObject = {}; //new Object();
		
		returnObject.currVersion = manifest.version;
		returnObject.manifest = manifest;
		
		return returnObject;
	}
	catch(e)
	{
		handleError("getVersion", e);
	}	
}

/**
Return the default set of settings
*/
function getDefaultSettings()
{
	tmpSettings = {};
	
	tmpSettings.iconTopColor = "#1B8CA0";
	tmpSettings.iconTextColor = "#323232";
	tmpSettings.iconShowText = 0;
	
	tmpSettings.showBadge = "1";
	tmpSettings.badgeColor = "#18CD32";
	tmpSettings.popup = "12";
	tmpSettings.showWeek = "1";
	tmpSettings.firstDay = "1";
	tmpSettings.dateFormatShort = "dd.mm.yy"; //Also look for d/m/y due to my stupidity
	tmpSettings.showBubbleOnStart = true;
	tmpSettings.showWorkDays = false;
	tmpSettings.showPastDays = true;
	tmpSettings.easyRead = 0;
	tmpSettings.countStringType = 1;
	
	tmpSettings.maxNumberOfSecondaryDaysInPopup = 15;
	
	tmpSettings.showFrom = 1; //1 = january, 2 = current third, 3 = current month
	
	return tmpSettings;
}

/**
Persist the given settings object
*/
function persistSettingsToStorage(tmpSettings) {
	
	try {
		if(tmpSettings.popup)
		{
			dataStore.set({"settings": tmpSettings}, function(items){
			
				logger("info", "Settings", "Settings has been written to storage");
		
			});
		}
	}
	catch(e)
	{
		handleError("persistSettingsToStorage", e);
	}
}

/**
Persist the given dates object
*/
function persistDatesToStorage(dateSet) {
	
	try {
		if(dateSet.mainDateArray && dateSet.subDateArray && dateSet.dateNoteArray && dateSet.dateColorArray)
		{
			dataStore.set({"dates": dateSet}, function(items){
				logger("info", "Stored dates", dateSet);
			});
		}
		else
		{
			throw new Error("Date object malformed");
		}
	}
	catch(e)
	{
		handleError("persistDatesToStorage", e);
	}
}

/**
Get settings from storage. Assumes a "settings" object and jWorkorder already exists on page. 
*/
function readSettingsFromStorage(previous, baton)
{

	try {
	
		if(typeof(settings) === "undefined")
		{
			settings = getDefaultSettings();
			throw new Error("Settings object does not exist");
		}
	
		var tmpSettings = getDefaultSettings();
			
			baton.take();
			
			dataStore.get("settings", function(items){
			
				//Overwrite default settings with stored ones where applicable.
				for (var i in items.settings)
				{
					tmpSettings[i] = items.settings[i];
				}
				
				settings = tmpSettings; 
				
				logger("info", "Settings", "Settings has been read");
				
				baton.pass(); //OK, pass the baton along

			});
	}
	catch(err)
	{
		handleError("readSettingsFromStorage", err);
	}

}

/**
Get dates from storage. Assumes a "dates" object and jWorkorder already exists. Initialize storage if it does nt exist.
*/
function readDatesFromStorage(previous, baton)
{
		var tmpDates = {mainDateArray: [], subDateArray: [],dateNoteArray: [], dateColorArray: []}; 
			
		baton.take();
		
		dataStore.get("dates", function(items){
		
			if(typeof(items.dates) !== "undefined") //There are dates in the datastore!
			{

				for (var i in items.dates)
				{
					//console.log(i);
					tmpDates[i] = items.dates[i];
					
				}
				
				dates = tmpDates;
				
				ccDates = convertToDateObjects();
				
				logger("info", "Dates", "Dates has been read");

				baton.pass(); //OK, pass the baton along

			}
			else //No dates stored, create new
			{
				var dateObject= {mainDateArray: [], subDateArray: [], dateNoteArray: [], dateColorArray: []};
				persistDatesToStorage(dateObject);
				logger("info", "Dates", "Dates has been initialized");
				baton.pass(); //OK, pass the baton along
			}
			
		});
}

/**
Persist the given settings object
*/
function persistSettingsToStorage(tmpSettings) {
	
	try {
	
		var popupSet = false;
		if(typeof(tmpSettings.popup) !== 'undefined') 
		{	
			popupSet = true;
		}
		else {
			throw new Error("Settings persisted without being set.");
		}
	
		if(popupSet === true)
		{
			dataStore.set({"settings": tmpSettings}, function(items){
			
				logger("info", "Settings", "Settings has been written to storage");
		
			});
		}
	}
	catch(e)
	{
		handleError("persistSettingsToStorage", e);
	}
}

/**
Persist the given dates object
*/
function persistDatesToStorage(dateSet) {
	
	try {
		if(dateSet.mainDateArray && dateSet.subDateArray && dateSet.dateNoteArray && dateSet.dateColorArray)
		{
			dataStore.set({"dates": dateSet}, function(items){
				logger("storage", "Stored dates", dateSet);
			});
		}
		else
		{
			throw new Error("Date object malformed");
		}
	}
	catch(e)
	{
		handleError("persistDatesToStorage", e);
	}
}

/**
Toggle dates. "nocount" means secondary dates if true.
*/
function toggleDate(timestamp, noCount)
{
	try {

		if(noCount)
		{
			var noCountDateArray = getSubDates();
		
			//Secondary dates. Store many hooray
			var sidx = noCountDateArray.indexOf(timestamp);
		
			if(sidx != -1)
			{
				noCountDateArray.splice(sidx, 1); //Remove if found
			}
			else
			{
				//...add if not found.
				noCountDateArray.push(timestamp);
			}
			
			noCountDateArray.sort();
			
            //trackEvent("Interaction", "Sub date changed", timestamp);
			
			//This is the new solution!
			dates.subDateArray = noCountDateArray;
			persistDatesToStorage(dates);
						
			log("Sub date array changed", noCountDateArray);
				
			
		}
		else //The main one. Store just that.
		{
			var dateArray = getDates();
			
			var idx = dateArray.indexOf(timestamp);
			
			if(idx != -1)
			{
				dateArray = []; // Clear out
			}
			else
			{
				dateArray = [timestamp]; //Set
			}
			
			//This is the new solution!
			dates.mainDateArray = dateArray;
			persistDatesToStorage(dates);
			
			
			log("Date array changed", dateArray); //Log it	
		}
			
	}
	catch(e)
	{
		handleError("Functions toggleDate", e);
	}
	
}


function getDates()
{
	try {
		//dateArray = JSON.parse(getItem("dateArray"));
		return dates.mainDateArray;
	}
	catch(e)
	{
		handleError("Functions getDates", e);
	}
}

/**
Get sub dates
*/
function getSubDates()
{
	try{
		//subDateArray = JSON.parse(getItem("noCountDateArray"));
		return dates.subDateArray;
	}
	catch(e)
	{
		handleError("Functions getSubDates", e);
	}
}


/**
Generic error handling for all errors
*/
window.onerror = function(message, url, linenumber) {
	try {
		var whereA = url.split("/");
		var where = whereA[whereA.length-1];
		trackError("window.onerror", where + ":" + linenumber, message);
	}
	catch(e)
	{
		handleError("Functions window.onerror", e);
	}
};

//Object to hold date. Shall be extended wildly.
function ccDate(timestamp)
{
	this.timestamp = timestamp;
	
	this.color = null;
	this.note = null;
	this.isPrimary = false;
	this.isSecondary = false;
	
}

//Get full set of dates 
function convertToDateObjects()
{
	
	var m = dates.mainDateArray;
	var s = dates.subDateArray;
	var n = dates.dateNoteArray;
	var c = dates.dateColorArray;
	
	var datesTmp = {};
	var out = {};
	
	//Add primary date to array		
	for(i=0;i<m.length;i++)
	{
		datesTmp[m[i]] = "main";
	}
	
	//Add secondary dates to array
	for(i=0;i<s.length;i++)
	{
		datesTmp[s[i]] += "sub";
	}
	
	//Add notes dates to array
	for(i=0;i<n.length;i++)
	{
		datesTmp[n[i].timestamp] += "note";
	}
	
	//Add notes dates to array
	for(i=0;i<c.length;i++)
	{
		datesTmp[c[i].timestamp] += "color";
	}
		
	//Get additional data
	for (var d in datesTmp)
	{
		var tm = new ccDateConv(d);
		tm.init();
		delete tm.init;
		out[d] = tm;
	}
		
	for (d in out)
	{
		var tmpCC = new ccDate(out[d].timestamp);
		tmpCC.color = out[d].color;
		tmpCC.note = out[d].note;
		tmpCC.isPrimary =  out[d].isPrimary;
		tmpCC.isSecondary = out[d].isSecondary;
		//tmpCC.date = new Date(tmpCC.timestamp).toUTCString();
		out[d] = tmpCC;
	}
	
	out = sortObjectByKey(out);
	
	return out;
}

//Date holding object for new date handling functionality conversion. Should not be used directly, use ccDate instead.
function ccDateConv(timestamp)
{
	this.timestamp = timestamp;
	
	this.color = null;
	this.note = null;
	this.isPrimary = false;
	this.isSecondary = false;
	
	this.init = function() {
		
		try 
		{
			if(typeof(dates.dateNoteArray) !== "undefined")
			{
				for(xi=0; xi < dates.dateNoteArray.length; xi++)
				{
					if(dates.dateNoteArray[xi].timestamp == this.timestamp)
					{
						if(typeof(dates.dateNoteArray[xi].note) !== "undefined")
						{
							this.note = dates.dateNoteArray[xi].note.toString();
						}
					}
				}
			}
		}
		catch(e)
		{
			handleError("Functions ccDate init note", e);
		}
		
		try 
		{
			if(typeof(dates.dateColorArray) !== "undefined")
			{
				for(yi=0; yi < dates.dateColorArray.length; yi++)
				{
					if(dates.dateColorArray[yi].timestamp == this.timestamp)
					{
						if(typeof(dates.dateColorArray[yi].color) !== "undefined")
						{
							this.color = dates.dateColorArray[yi].color.toString();
						}
					}
				}
			}
		}
		catch(e)
		{
			handleError("Functions ccDate init color", e);
		}
		
		try {
			if(typeof(dates.mainDateArray) !== "undefined")
			{
				for(yi=0; yi < dates.mainDateArray.length; yi++)
				{
					if(dates.mainDateArray[yi] == this.timestamp)
					{
						this.isPrimary = true;
					}
				}
			}
		}
		catch(e)
		{
			handleError("Functions ccDate init maindate", e);
		}
		
		try {
			if(typeof(dates.subDateArray) !== "undefined")
			{
				for(yi=0; yi < dates.subDateArray.length; yi++)
				{
					if(dates.subDateArray[yi] == this.timestamp)
					{
						this.isSecondary = true;
					}
				}
			}
		}
		catch(e)
		{
			handleError("Functions ccDate init maindate", e);
		}
		
	};
	
	return this;
}

/** New function for deleting any info from a date. So simple it's embarrasing the way it was done before. **/

function deleteDateInfoAll(timestamp)
{
	deleteDateInfo(timestamp, true, true, true, true);
}

function deleteDateInfo(timestamp, pri, sec, note, color)
{

	var tmpDates = dates;

	//Clunky. Some day the main date storage format must be refactored to something sane. 
	if(pri === true)
	{
		for(i=0;i<tmpDates.mainDateArray.length;i++)
		{
			if(tmpDates.mainDateArray[i]*1 == timestamp*1)
			{
				tmpDates.mainDateArray.splice(i,1);
			}
		}
	}
	if(sec === true)
	{
		for(i=0;i<tmpDates.subDateArray.length;i++)
		{
			if(tmpDates.subDateArray[i]*1 == timestamp*1)
			{
				tmpDates.subDateArray.splice(i,1);
			}
		}
	}
	if(note === true)
	{
		for(i=0;i<tmpDates.dateNoteArray.length;i++)
		{
			if(tmpDates.dateNoteArray[i].timestamp*1 == timestamp*1)
			{
				tmpDates.dateNoteArray.splice(i,1);
			}
		}
	}
	if(color === true)
	{
		for(i=0;i<tmpDates.dateColorArray.length;i++)
		{
			if(tmpDates.dateColorArray[i].timestamp*1 == timestamp*1)
			{
				tmpDates.dateColorArray.splice(i,1);
			}
		}
	}

	persistDatesToStorage(dates);

}

/**
Return date as a localised string
*/
function getDateString(timestamp, long)
{
	try {

		date = new Date(timestamp*1);
		
		//console.log(timestamp, date);

		var day = date.getUTCDay();
		var month = date.getUTCMonth();
		var mDay = date.getUTCDate();
		var year = date.getUTCFullYear();
	
		//Get correct suffix
		lDay = (mDay%10);
		switch(lDay)
		{
		case 1:
			if(mDay > 20 || mDay < 10) sFix = chrome.i18n.getMessage("numberSt");
			else sFix = chrome.i18n.getMessage("numberTh");
			break;
		case 2:
			if(mDay > 20 || mDay < 10) sFix = chrome.i18n.getMessage("numberNd");
			else sFix = chrome.i18n.getMessage("numberTh");
			break;
		case 3:
			if(mDay > 20 || mDay < 10) sFix = chrome.i18n.getMessage("numberRd");
			else sFix = chrome.i18n.getMessage("numberTh");
			break;
		default:
			sFix = chrome.i18n.getMessage("numberTh");
		}
	
		var monthName = chrome.i18n.getMessage("mon"+(month+1)); 
	
		var dateString = "";
	
		if(long)
		{
			dateString = chrome.i18n.getMessage("fullDate", [ucFirst(chrome.i18n.getMessage("lday"+day)), monthName, mDay, sFix]);
		}
		else {
			
			var dateTemplate = settings.dateFormatShort;
			
			var padding = true;
			
			month++;
			if(month < 10 && padding) month = "0" + month;
			if(mDay < 10 && padding) mDay = "0" + mDay;
			
			dateString = dateTemplate.replace("mm", month);
			
			dateString = dateString.replace("yy", year);
			dateString = dateString.replace("dd", mDay);
		}
	
		return dateString;
		
	}
	catch(e)
	{
		handleError("functions.js getDateString", e);
	}
}

function loadGoogleAPIClient()
{
	//Inject Google APIs
	//inject("https://apis.google.com/js/client.js?onload=handleGoogleAPIClientLoad");
}
