# Homebridge-Tibberswitch

WIP - not sure if it works at all yet :D 

**This plugin will:**
* Fetch current energy price from the tibber api.
* Activate a motion sensor if the price is lower than the day's average. 

Use the motion sensor to trigger autmations, for instance activate thermostats/fans etc.


## Usage

`npm install -g homebridge-tibberswitch`   


	{  
		"accessory": "HomebridgeTibberswitch",
		"name": "TibberSwitch",    
		"token": "YOUR_TIBBER_TOKEN"  
	}  


Greatly inspired by [iOSTibberWidget.](https://github.com/svenove/iOSTibberWidget)