const request = require('supertest');

const {mongoConnect, mongoDisconnect} = require('../../services/mongo');
const app = require('../../app');

describe('Launches API', () => {
	beforeAll(async ()=> {
		await mongoConnect();
	});

	afterAll(async () => {
		await mongoDisconnect();
	});

	describe('Test GET /launches', () => {
		test('Should respond with 200', async () => {
			const response = await request(app)
				.get('/v1/launches')
				.expect('Content-Type', /json/)
				.expect(200);
		});
	});
	
	describe('Test POST /launches', () => {
		const completeLaunchData = {
			mission: 'mission',
			rocket: 'rocket',
			target: 'Kepler-1652 b',
			launchDate: 'April 09, 1995',
		};
	
		const launchDataWithoutDate = {
			mission: 'mission',
			rocket: 'rocket',
			target: 'Kepler-1652 b',
		};
	
		const launchDataWithoutInvalidDate = {
			mission: 'mission',
			rocket: 'rocket',
			target: 'Kepler-1652 b',
			launchDate: 'Hello',
		};
	
		test('Should respond with 201', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(completeLaunchData)
				.expect('Content-Type', /json/)
				.expect(201);
	
			const requestDate = new Date(
				completeLaunchData.launchDate
			).valueOf();
			const responseDate = new Date(response.body.launchDate).valueOf();
			expect(responseDate).toBe(requestDate);
	
			expect(response.body).toMatchObject(launchDataWithoutDate);
		});
	
		test('Should catch missing required properties', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(launchDataWithoutDate)
				.expect('Content-Type', /json/)
				.expect(400);
	
			expect(response.body).toStrictEqual({
				error: 'Missing required launch property',
			});
		});
	
		test('Should catch invailed dates', async () => {
			const response = await request(app)
				.post('/v1/launches')
				.send(launchDataWithoutInvalidDate)
				.expect('Content-Type', /json/)
				.expect(400);
	
			expect(response.body).toStrictEqual({
				error: 'Invalud launch date',
			});
		});
	});
});

