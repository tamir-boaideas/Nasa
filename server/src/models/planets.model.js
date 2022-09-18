/* jshint ignore:start */
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const planets = require('./planets.mongo.js');

function isHabitablePlanet(planet) {
	return (
		planet['koi_disposition'] === 'CONFIRMED' &&
		planet['koi_insol'] > 0.36 &&
		planet['koi_insol'] < 1.11 &&
		planet['koi_prad'] < 1.6
	);
}

function loadPlanetsData() {
	return new Promise((resolve, reject) => {
		fs.createReadStream(
			path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
		)
			.pipe(
				parse({
					comment: '#',
					columns: true,
				})
			)
			.on('data', async (planet) => {
				if (isHabitablePlanet(planet)) {
					savePlanet(planet);
				}
			})
			.on('error', (err) => reject(err))
			.on('end', async () => {
				const countPlanetsFound = (await getAllPlanets()).length;
				console.log(`${countPlanetsFound} habitable plantes found`)
				resolve();
			});
	});
}

async function getAllPlanets() {
	return await planets.find({},{
		'_id': 0, '__v': 0
	});
}

async function savePlanet(planet) {
	try {
		return await planets.updateOne({
			keplerName: planet.kepler_name
		},{
			keplerName: planet.kepler_name
		}, {
			upsert: true
		});
	} catch (err) {
		console.error(err)
	}
}

module.exports = {
	getAllPlanets,
	loadPlanetsData,
};
