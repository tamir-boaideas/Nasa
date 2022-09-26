const axios = require('axios');

const launches = require('./launches.mongo.js');
const planets = require('./planets.mongo.js');
const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';
async function papulateLaunches() {
	const response = await axios.post(SPACEX_API_URL, {
		query: {},
		options: {
			pagination: false,
			populate: [
				{
					path: 'rocket',
					select: {
						name: 1
					}
				},
				{
					path: 'payloads',
					select: {
						customers: 1
					}
				}
			]
		}
	});

	if(response.status != 200) {
		console.log('Problem downloading launch data');
		throw new Error('Launch data download failed');
	}

	const launchDocs = response.data.docs;
	for (const launchDoc of launchDocs) {
		const payloads = launchDoc['payloads'];
		const customers = payloads.flatMap((payload) => {
			return payload['customers'];
		});
		const launch = {
			flightNumber: launchDoc['flight_number'],
			mission: launchDoc['name'],
			rocket: launchDoc['rocket']['name'],
			launchDate: launchDoc['date_local'],
			target: 'Kepler-442 b',
			customers,
			upcoming: launchDoc['upcoming'],
			success: launchDoc['success']
		};
		await saveLaunch(launch);
	}
}
async function loadLaunchData() {
	const firstLaunch = await findLaunch({
		flightNumber: 1,
		rocket: 'Falcon 1',
		mission: 'FalconSat'
	});
	if(firstLaunch) {
		console.log('Launch data already loaded');
		return;
	}
	await papulateLaunches()
}

async function getLatestFlightNumber() {
	const latestLaunch = await launches.findOne().sort('-flightNumber');
	if(!latestLaunch) {
		return DEFAULT_FLIGHT_NUMBER;
	}
	return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
	return launches.find({},{
		'_id': 0,
		'__v': 0
	})
	.sort({flightNumber: 1})
	.skip(skip)
	.limit(limit);
}

async function saveLaunch(launch) {
	await launches.findOneAndUpdate({
		flightNumber: launch.flightNumber
	}, launch, {
		upsert: true
	});
}

async function scheduleNewLaunch(launch) {
	const planet = await planets.findOne({keplerName: launch.target});
	if(!planet) {
		throw new Error('No matching planet found');
	}
	const newFlightNumber = await getLatestFlightNumber() + 1;
	const newLaunch = Object.assign(launch,
		{
			success: true,
			upcoming: true,
			customers: ['Tamir'],
			flightNumber: newFlightNumber
		});
		await saveLaunch(newLaunch);
}

async function findLaunch(filter){
	return launches.findOne(filter);
}

async function existsLaunchWithId(launchId) {
	return findLaunch({
		flightNumber: launchId
	});
}

async function abortLaunchById(launchId) {
	const aborted = await launches.updateOne({
		flightNumber: launchId
	}, {
		upcoming: false,
		success: false
	});
	return aborted.modifiedCount === 1;
}

module.exports = {
	loadLaunchData,
	getAllLaunches,
	scheduleNewLaunch,
	existsLaunchWithId,
	abortLaunchById,
};
