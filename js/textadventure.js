function TextAdventure() {
	this.locationsData; 		// json locations data
	this.unkownMessages;	  // Array containing possible responses to input we can't handle
	this.currentLocation; 	// Name of current location

	this.data = {};				 	// Data container for commands in data
	
	// Events
	TextAdventure.OUTPUT_EVENT = "output";
	
	// PUBLIC
	this.input = function(text) {
		console.log('TextAdventure:input: ',text);
		var currentLocationData = this.locationsData[this.currentLocation];

		// check exits
		var validExit;
		if(currentLocationData.exits != undefined) {
			var self = this;
			$.each(currentLocationData.exits,function(exit,inputs) {
				console.log("  checking exit: ",exit);
				if(self.isMatch(text,inputs)) {
					validExit = exit;
		  		return false;
				}
			});
		}
		if(validExit) {
			this.goto(validExit);
			return;
		}
		
		// check cmds
		var validCmd;
		if(currentLocationData.commands != undefined) {
			var self = this;
			$.each(currentLocationData.commands,function(index,cmdObj) {
				console.log("  checking cmd: ",index);
				if(self.isMatch(text,cmdObj.inputs)) {
					validCmd = cmdObj.content;
		  		return false;
				}
			});
		}
		if(validCmd) {
			this.execute(validCmd);
			return;
		}
		
		// check objects pickups on location
		
		// check objects releases from inventory
		
		// check general commands
		
		this.outputUnknown();
	}
	
	// PRIVATE
	this.goto = function(location) {
		console.log("goto location: ",location);
		if(this.locationsData[location] == undefined) {
	  	this.outputError("There is no location called '"+location+"'");
		} else {
	    var currentLocationData = this.locationsData[location];
	    
	  	console.log("  data: ",currentLocationData);
	  	if(currentLocationData.output == undefined)
	  		currentLocationData.output = "";
	  	this.output(currentLocationData.output);
	  	
	  	if(currentLocationData.onEnter != undefined) {
	  		this.execute(currentLocationData.onEnter);
	  	}
	  	
	    this.currentLocation = location;
	  }
	}
	this.outputUnknown = function() {
		console.log("outputUnknown");
		var randomIndex = Math.round(Math.random()*(this.unkownMessages.length-1));
		var randomUnknown = this.unkownMessages[randomIndex];
		console.log("randomUnknown: ",randomUnknown);
		this.output(randomUnknown);
	}
	this.outputError = function(text) {
		this.output('Error: '+text);
	}
	this.output = function(text) {
		$(document).trigger(TextAdventure.OUTPUT_EVENT,text);
	}
	
	this.isMatch = function(input,options) {
		if(typeof options == "string") {
			options = [options];
		}
		// match input against every option
		var match = false;
		$.each(options,function(index,option) {
	  	console.log("    checking option: ",option);
	  	// use input option as regular expression. 
	  	// ^ and $ make sure that the option matches completly. 
	  	//   A input like "goto lake" should not match against 
	  	//   an option like "lake" but shoud match ".*?lake.*?"
	  	var regExp = new RegExp('^'+option+'$','i');
	  	match = regExp.test(input);
	  	if(match) return false;
		});	
		return match;
	}
	this.execute = function(codeStr) {
	  new Function("data","msg",codeStr) (this.data,this.output);
	}
}