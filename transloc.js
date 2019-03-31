let ruLocate = require('./ruLocate.js');

import { AsyncStorage } from "react-native";

class transloc{

	constructor(key) {
		this.key = key;
		this.agency = '1323';

		this.data = {
			routes: {},
			stops: []
		};
	}


	load(callback) {
		let finished = false,
            tryFinish = () => {
            	let routesLoaded = Object.keys(this.data['routes']).length > 0;
            	let stopsLoaded = this.data['stops'].length > 0;
                if(!finished && routesLoaded && stopsLoaded){
                	callback();
                	finished = true;
                } 
            }

        let loadStorage = (key, next) => {
        	 AsyncStorage.getItem(key)
	        .then(data => {
	            if(Object.keys(this.data[key]).length == 0){
	                try{
	                	data = JSON.parse(data);
	                	// make sure data from storage
	                	// is not empty before loading
	                	if(data.length > 0 || Object.keys(data).length > 0){
	                		this.data[key] = data;
	                    	next();
	                	}
	                } catch(e) {};
	                
	            }
	        });
        }

        // try to load data from
        // storage before using api
        loadStorage('stops', () => {
        	tryFinish();
	    });
	    loadStorage('routes', () => {
    		tryFinish();
    	});

       	// get data from transloc api
		this.get('routes', {}, (data) => {
			let routes = {};

			data[this.agency].forEach(route => {
				routes[route.route_id] = route.long_name.replace(/Route\s+/,'');
			});

			AsyncStorage.setItem('routes', JSON.stringify(routes));
			this.data.routes = routes;
			tryFinish();
		});
		this.get('stops', {}, (data) => {
			AsyncStorage.setItem('stops', JSON.stringify(data));
			this.data.stops = data;
			tryFinish();
		});
	}


	get(page, query, callback) {

		let queryString = Object.keys(query).map(key => {
			return `${key}=${query[key]}`;
		}).join('&');

		let api = 'https://transloc-api-1-2.p.rapidapi.com/';

		let ffetch = (url) => {
		    const options = {
		        method: 'get',
		        headers: new Headers({
		        	'X-RapidAPI-Key': this.key,
		        	'Content-Type': 'application/x-www-form-urlencoded'
		        })
		    };
		    return fetch(url, options);
		}

		ffetch(`${api}${page}.json?callback=call&agencies=1323&${queryString}`)
		.then(function(response) {
		    return response.json();
		})
		.then(function(result) {
		   callback(result.data);
		});
	}

	stop(stopId) {
		return this.data.stops.filter(s => {
			return s.stop_id == stopId;
		})[0];
	}


	closestStop(lat, lng) {
        let stopArray = [];

        Object.keys(this.data.stops).forEach(s => {
            stopArray.push(this.data.stops[s]);
        });

        stopArray = stopArray.map(stop => {
        	let stopLoc = stop.location;
        	stop.distance = ruLocate.distance(lat, lng, stopLoc.lat, stopLoc.lng);
        	return stop;
        })

        stopArray.sort((a, b) => {
            return a.distance > b.distance ? 1 : -1;
        });

        let stop = stopArray[0];
        stop.campus = ruLocate.closestCampus(stop.location.lat, stop.location.lng);
        return stop;
    }


	routeName(routeId) {
		return this.data.routes[routeId];
	}


	arrivalEstimates(stopId, callback) {

		let dests = {
			'A': ['College Ave', 'Busch'],
			'B': ['Livingston', 'Busch'],
			'C': ['Loop'],
			'EE': ['College Ave', 'Cook/Douglass'],
			'F': ['College Ave', 'Cook/Douglass'],
			'H': ['College Ave', 'Busch'],
			'LX': ['College Ave', 'Livingston'],
			'REXL': ['Cook/Douglass', 'Livingston'],
			'REXB': ['Cook/Douglass', 'Busch'],
			'Weekend 1': ['All Campuses'],
			'Weekend 2': ['All Campuses'],
			'New BrunsQuick 1 Shuttle': ['College Ave', 'New Brunswick'],
			'New BrunsQuick 2 Shuttle': ['College Ave', 'New Brunswick'],
			
		}

		let stop = this.stop(stopId);
		this.get('arrival-estimates', {
			stops: stopId
		}, (data) => {
			let arrivals = {};

			if(data.length > 0){
				data[0].arrivals.forEach(a => {
					let key = a.route_id;
					if(typeof arrivals[key] == 'undefined'){

						let name = this.routeName(a.route_id);
						let dest = dests[name].filter(d => {
							return d != stop.campus;
						})[0];

						arrivals[key] = {
							estimates: [],
							name: name,
							destination: `To ${dest}`
						};
					}
					let time = Date.parse(a.arrival_at) - Date.now();
					arrivals[key].estimates.push(time);
				});
			}

			callback(arrivals);
		});
	}



}



module.exports = transloc;