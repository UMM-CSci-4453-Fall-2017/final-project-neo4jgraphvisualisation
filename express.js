var express=require('express'),
app = express(),
port = process.env.PORT || 1917;
app.use(express.static(__dirname + '/public'));

const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver("bolt://127.0.0.1:7687", neo4j.auth.basic("neo4j", "password"));
const session = driver.session();


app.get("/getWinners",function(req,res){ // handles the /getWinners API. Gets Individuals whose TotalError is 0
  const actorPromise = session.run(
    "MATCH(n: Individual) - [HasTotalError] -> (x: TotalError {TotalError:  0 }) RETURN n LIMIT 100;"
  ).then(function(result) {
    var fields = packageFields(result);
    res.send(fields);
    session.close();
    driver.close();
  });
});


function packageFields(result) {
  var fields = [];
  for(i = 0; i < result.records.length; i++) {
    var individual = result.records[i]._fields[0];
    var transformedIndividual = transform(individual);
    console.log(transformedIndividual);
    fields[i] = transformedIndividual;
  }
  console.log(fields);
  return fields;
}

function transform(individual){
  var transformedIndividual = {};
  transformedIndividual.identity = individual.identity.low;
  transformedIndividual.label = individual.labels[0];
  transformedIndividual.generation = individual.properties.generation.low;
  transformedIndividual.location = individual.properties.location.low;
  transformedIndividual.uuid = individual.properties.uuid;
  return transformedIndividual;
}

app.listen(port);
