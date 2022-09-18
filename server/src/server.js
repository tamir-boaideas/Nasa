const http = require('http');

const {mongoConnect} = require('./services/mongo');
const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

(async function() {
    await mongoConnect();
    await loadPlanetsData();
    
    server.listen(PORT, ()=>console.log('Listening on port ' + PORT));
})();

//E15XFZdbj6GsfZJJ