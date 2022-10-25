
# Homebridge-Tibberswitch


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
		"threshold": 2
	}  

Threshold can be any of the following:

|Value|Effect  |
|:--:|:--|
|0 |*DEFAULT* - This will activate the motion sensor if the current price level is below the **daily average**.  |
| 1 |This will activate the motion sensor if the current price level rating is **VERY_CHEAP**  |
| 2 |This will activate the motion sensor if the current price level rating is **CHEAP** or lower  |
| 3 |This will activate the motion sensor if the current price level rating is **NORMAL** or lower  |
| 4 |This will activate the motion sensor if the current price level rating is **EXPENSIVE** or lower  |

The price level ratings (VERY_CHEAP, CHEAP, NORMAL and EXPENSIVE) are calculated by Tibber, based on prices from the last three days.

Greatly inspired by [iOSTibberWidget.](https://github.com/svenove/iOSTibberWidget)
