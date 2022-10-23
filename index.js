var Service, Characteristic;

const fetch = require('node-fetch');
const url = require('url');

let setupOK = false;

module.exports = function (homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-tibberswitch", "HomebridgeTibberswitch", myTS);
};

function myTS(log, config){
  this.config = config;
  this.log = log;
  this.pollingInterval = 600000;

  if(typeof config.token === 'string' && config.token != ""){
    setupOK = true;
  }else{
    this.log("Token error - please check your config");
  }

  /* Static config values */
  this.token = config.token 
  this.GQLbody = {
    "query": "{ \
      viewer { \
        homes { \
          currentSubscription { \
            priceInfo { \
              current { \
                total \
              } \
              today { \
                total \
              } \
            } \
          } \
        } \
      } \
    }"
  }
}

myTS.prototype = {

  getServices: function () {
    async function populateJson(me) {
      try{
        const responses = await fetch("https://api.tibber.com/v1-beta/gql",{
          method: "POST",
          headers: {
            "Authorization": "Bearer " + me.token,
            "Content-Type": "application/json"
          },
          body:JSON.stringify(me.GQLbody)
        })
        const tbjson = await responses.json()
        await updateDevices(me, tbjson);
      }catch(err){
        me.log("Could not fetch tibber values - " + err);
      }
    }

    function updateDevices(me, priceJson){
      
      let allPrices = priceJson['data']['viewer']['homes'][0]['currentSubscription']['priceInfo']['today'];
      let price = priceJson['data']['viewer']['homes'][0]['currentSubscription']['priceInfo']['current']['total'];

      let minPrice = 100000;
      let maxPrice = 0;
      let avgPrice = 0;

      for(var i = 0; i < allPrices.length; i++){
        if(allPrices[i].total * 100 < minPrice){
          minPrice = Math.round(allPrices[i].total * 100);
        }
        if(allPrices[i].total * 100 > maxPrice){
          maxPrice = Math.round(allPrices[i].total * 100);
        }
        avgPrice += allPrices[i].total;
      }
      avgPrice = avgPrice / allPrices.length * 100;
      
      let lowprice = false;
      let priceOre = Math.round(price * 100);
      
      if(priceOre < avgPrice){
        lowprice = true;
      }
      
      me.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(lowprice);

      me.log("Current electricity price is "+priceOre+" öre.");
      if(lowprice){
        me.log("Price is below average.");
      }else{
        me.log("Price is over average.");
      }
      
    }
    if(setupOK){
      populateJson(this);
      setInterval(() => { populateJson(this) }, this.pollingInterval);
    }

    this.services = [];

    /* Information Service */
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Tibber")
      .setCharacteristic(Characteristic.Model, "Beta")
      .setCharacteristic(Characteristic.SerialNumber, "0.1.6");
    this.services.push(informationService);

    /* Motion sensor Service */
    let motionService = new Service.MotionSensor("Electricity price low");
    this.services.push(motionService);

    this.informationService = informationService;
    this.motionService = motionService;
    motionService.setPrimaryService(true);
    return this.services;

  }
};