//Various snippets found around the internets
function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}

//Clean up array
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

//Hex to rgb
function HexToRGB(hex)
{
	var r = HexToR(hex);
	var g = HexToG(hex);
	var b = HexToB(hex);
	var a = 100;
	var ret = [r,g,b,a];
	return ret;
}

function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16);}
function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16);}
function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16);}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h;}

function colorToHex(c) {
var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
return m ? "#" + (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : c;
}

function days_between_timestamps(ts1, ts2)
{
	// The number of milliseconds in one day
	var ONE_DAY = 86400000;
	
	// Calculate the difference in milliseconds
	var difference_ms = Math.abs(ts1 - ts2);
	
	// Convert back to days and return
	return Math.round(difference_ms/ONE_DAY);
}

function days_between(date1, date2) {

	// Convert both dates to milliseconds
	var date1_ms = date1.getTime();
	var date2_ms = date2.getTime();

	return days_between_timestamps(date1_ms, date2_ms);


}

//Capitalize first letter
function ucFirst(str) {
	var firstLetter = str.substr(0, 1);
	return firstLetter.toUpperCase() + str.substr(1);
}

//version is populated after an indeterminate amount of time

/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 */
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

//	The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];

			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
} 

//sets the item in the localstorage
function setItem(key, value) {
	try {
        logger("info", "Set old storage", key);
		window.localStorage.removeItem(key);
		window.localStorage.setItem(key, value);
	}catch(e) {
		log("Ajax","Error inside setItem");
		log(e);
	}
}

function getItem(key) {
	var value;
	
	logger("info", "Get old storage", key);
	
	try {
		value = window.localStorage.getItem(key);
		//log('Get Item', key + ": "+value);
	}catch(e) {
		log("Error inside getItem() for key:" + key);
		log(e);
		value = "null";
	}

	return value;
}



//Clears all the key value pairs in the local storage
function clearStrg() {
	log('about to clear local storage');
	window.localStorage.clear();
	log('cleared');
}

//remove an item from localstorage
function removeItem(itemName)
{
	window.localStorage.removeItem(itemName);
}

// Return 1 if a > b
// Return -1 if a < b
// Return 0 if a == b
function compareVersions(a, b)
{
    if (a === b)
    {
       return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++)
    {
        // A bigger than B
        if (parseInt(a_components[i]) > parseInt(b_components[i]))
        {
            return 1;
        }

        // B bigger than A
        if (parseInt(a_components[i]) < parseInt(b_components[i]))
        {
            return -1;
        }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length)
    {
        return 1;
    }

    if (a_components.length < b_components.length)
    {
        return -1;
    }

    // Otherwise they are the same.
    return 0;
}

/**
 * Return an Object sorted by its Key
 */
var sortObjectByKey = function(obj){
    var keys = [];
    var sorted_obj = {};

    for(var key in obj){
        if(obj.hasOwnProperty(key)){
            keys.push(key);
        }
    }

    // sort keys
    keys.sort();

    // create new array based on Sorted Keys
    jQuery.each(keys, function(i, key){
        sorted_obj[key] = obj[key];
    });

    return sorted_obj;
};

function ArrNoDupe(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}


//Testing injection
function inject(url) {
    var scriptElement = document.createElement('script');
    scriptElement.src = url;
    (document.body || document.head || document.documentElement).appendChild(scriptElement);
}