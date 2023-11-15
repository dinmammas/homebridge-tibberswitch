var Service, Characteristic;

const fetch = require('node-fetch');
const cron = require('node-cron');
const url = require('url');
var hbapi;
var nodever = process.versions.node;
var tibsw_version = "0.3.3";
let setupOK = false;
let firstrun = true;

module.exports = function (homebridge){
  Service = homebridge.hap.Service;
  hbapi = homebridge;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-tibberswitch", "HomebridgeTibberswitch", myTS);
};

function myTS(log, config){
  this.config = config;
  this.log = log;

  this.priceThreshold = config.threshold || 0;
  this.percentageTheshold = config.percentage || 0;

  if(typeof config.token === 'string' && config.token != ''){
    setupOK = true;
  }else{
    this.log(`Token error - please check your config`);
  }

  /* Static config values */
  this.token = config.token 
  this.homeNumber = config.home || 0;
  this.GQLbody = {
    "query": "{ \
      viewer { \
        homes { \
          currentSubscription { \
            priceInfo { \
              today { \
                total \
                level \
                startsAt\
              } \
            } \
          } \
        } \
      } \
    }"
  }
  /* Dynamic values based on config */
  this.levels = [];
  this.runAverage = true;
  this.tbjson = {};

  if((this.priceThreshold > 0 && this.percentageTheshold == 0)){
    this.runAverage = false;
    if(this.priceThreshold === 1){
      this.levels.push('VERY_CHEAP');
    }else if(this.priceThreshold === 2){
      this.levels.push('VERY_CHEAP','CHEAP');
    }else if(this.priceThreshold ===3){
      this.levels.push('VERY_CHEAP','CHEAP','NORMAL');
    }else if(this.priceThreshold === 4){
      this.levels.push('VERY_CHEAP','CHEAP','NORMAL','EXPENSIVE');
    }
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
            "Content-Type": "application/json",
            "User-Agent": "Homebridge/"+hbapi.serverVersion+" homebridge-tibberswitch/" + tibsw_version + " node/"+nodever
          },
          body:JSON.stringify(me.GQLbody)
        })
        me.tbjson = await responses.json()
        await updateDevices(me, me.tbjson,true);
      }catch(err){
        me.log(`Could not fetch tibber values -  ${err}`);
      }
    }

    function updateDevices(me, priceJson,daily){
      
      let allPrices = priceJson['data']['viewer']['homes'][me.homeNumber]['currentSubscription']['priceInfo']['today'];
      if (allPrices === undefined){
        allPrices = priceJson['data']['viewer']['homes'][0]['currentSubscription']['priceInfo']['today'];
        me.log(`Home with number ${me.homeNumber} not found. Using default home.`);
      }
      let currentHour = new Date().getHours();
      let price = allPrices[currentHour].total;
      let priceLevel = allPrices[currentHour].level;

      let lowprice = false;
      let priceOre = Math.round(price * 100);
      let percentPrice = 0;
      if(me.runAverage){
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
        percentPrice = Math.round((priceOre / avgPrice) * 100);
        if(daily){
          me.log(`Daily prices fetched. Daily average is: ${Math.round(avgPrice)} cents`);
        }
        if(priceOre < avgPrice){
          lowprice = true;
        }
        if (percentPrice < me.percentageTheshold) {
          lowprice = true;

        }

      

      }else{
        if(me.levels.includes(priceLevel)){
          lowprice = true;
        }
        me.log(`Current price level rating: ${priceLevel}`);
      }
      me.motionService.getCharacteristic(Characteristic.MotionDetected).updateValue(lowprice);
      
      me.log(`Current electricity price is ${priceOre} cents.`);
      me.log(`Current price percentage is ${percentPrice}% of daily average`)
      if(lowprice){ 
        me.log("Price is below your desired threshold.");
      }else{
        me.log("Price is over your desired threshold.");
      }
    }
    if(setupOK){
      populateJson(this);

      cron.schedule('5 0 1-23 * * *', () =>{
        updateDevices(this, this.tbjson,false);
      });

      cron.schedule('0 0 * * *', () =>{
        populateJson(this);
      });
    }
    
    this.services = [];

    /* Information Service */
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Tibber")
      .setCharacteristic(Characteristic.Model, "Production")
      .setCharacteristic(Characteristic.SerialNumber, tibsw_version);
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