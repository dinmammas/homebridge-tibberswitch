
# Homebridge-Tibberswitch
[![Downloads](https://img.shields.io/npm/dt/homebridge-tibberswitch.svg?color=critical)](https://www.npmjs.com/package/homebridge-tibberswitch)
[![Version](https://img.shields.io/npm/v/homebridge-tibberswitch)](https://www.npmjs.com/package/homebridge-tibberswitch)
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)

**This plugin will:**  
* Fetch current energy price from the tibber api.  
* Activate a motion sensor if the current electricity price is lower than the desired threshold value.  

Use the motion sensor to trigger automations, for instance activate thermostats/fans etc.


## Usage

`npm install -g homebridge-tibberswitch`   


	{  
		"accessory": "HomebridgeTibberswitch",
		"name": "TibberSwitch",
		"token": "YOUR_TIBBER_TOKEN",
		"threshold": 2,
		"percentage": 115,
		"home": 1,
		"currency": "öre"
	}  

Threshold can be any of the following:

|Value|Effect  |
|:--:|:--|
|0 |*DEFAULT* - This will activate the motion sensor if the current price level is below the **daily average**.  |
| 1 |This will activate the motion sensor if the current price level rating is **VERY_CHEAP**  |
| 2 |This will activate the motion sensor if the current price level rating is **CHEAP** or lower  |
| 3 |This will activate the motion sensor if the current price level rating is **NORMAL** or lower  |
| 4 |This will activate the motion sensor if the current price level rating is **EXPENSIVE** or lower  |

Percentage can be omitted. When used, it activates the the motion sensor when the current price is within the percentage range of **daily average**. Default is 0.

Home can be omitted, or used to select which home you'd like to fetch data for. Default is 0.

Currency can be omitted. Defaults to cents.

The price level ratings (VERY_CHEAP, CHEAP, NORMAL and EXPENSIVE) are calculated by Tibber, based on prices from the last three days.
  

**You need to be a Tibber customer and obtain an API token from their [dev page](https://developer.tibber.com) to make this plugin work.**  
If you want to become a customer, you can do so by [signing up here](https://invite.tibber.com/k1glk9tr).
  
  
Greatly inspired by [iOSTibberWidget.](https://github.com/svenove/iOSTibberWidget)
