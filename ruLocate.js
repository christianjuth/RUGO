let data = require('./data');


let ruLocate = {
  distance(lat1,lon1,lat2,lon2) {
        function deg2rad(deg) {
          return deg * (Math.PI/180)
        }

      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      // convert to feet
      d = d * 3280.839895;
      return d;
    },

    closestLots(pass, lat, lng) {
      let campuses = ruLocate.closestCampus(lat, lng);

      if(typeof data.parkingPasses[pass] == 'undefined'){
        return null;
      }

      let lots = data.parkingPasses[pass][campuses];
      let validTimes = Object.keys(lots).filter(key => {
        // key is time eg 10-2 where
        // 10 is start and 2 is end.
        // Split divides these into
        // start and finish times.
        let range = key.split('-'),
            date = new Date(),
            hour = date.getHours() + date.getMinutes()/60,
            isWeekend = !(date.getDay() % 6);
        return isWeekend || hour > range[0] || hour < range[1];
      });

      // put everything into 1D array
      let squashed = [];
      validTimes.forEach(time => {
        lots[time].forEach(lotName => {
          let lot = data.parkingLots[lotName];
          if(lot != null){
            lot.name = lotName;
            lot.distance = this.distance(lat, lng, lot.lat, lot.lng);
            squashed.push(lot);
          } else{
            console.log('missing '+lotName);
          }
        });
      });

      lots = squashed;

      lots.sort((a, b) => {
          return a.distance > b.distance ? 1 : -1;
      });

      return lots;
    },

    closestCampus(lat, lng) {
      data.campuses.sort((a, b) => {
          return this.distance(lat, lng, a.lat, a.lng) > this.distance(lat, lng, b.lat, b.lng) ? 1 : -1;
      });

      return data.campuses[0].name;
    }
}


module.exports = ruLocate;