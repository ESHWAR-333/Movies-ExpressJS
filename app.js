const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
const initializerDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e}`);
  }
};
initializerDBAndServer();

const convertObjectToList = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertObjectToListDirectors = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const GetQuery = `select movie_name from movie`;
  const dbResponse = await db.all(GetQuery);
  response.send(dbResponse.map((eachMovie) => convertObjectToList(eachMovie)));
  //   response.send(dbResponse);
});

//API 2

app.post("/movies/", async (request, response) => {
  const BodyDetails = request.body;
  const { directorId, movieName, leadActor } = BodyDetails;
  const postQuery = `insert into movie(director_id, movie_name, lead_actor) values (
        '${directorId}','${movieName}','${leadActor}'
    )`;
  await db.run(postQuery);
  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  //   const movieBody = request.body;
  const getMovieQuery = `select * from movie where movie_id='${movieId}'`;
  const dbResponse = await db.get(getMovieQuery);
  //   response.send(dbResponse.map((each) => convertObjectToList(each)));
  response.send(convertObjectToList(dbResponse));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const BodyDetails = request.body;
  const { directorId, movieName, leadActor } = BodyDetails;
  const putQuery = `update  movie set director_id='${directorId}', movie_name='${movieName}', lead_actor='${leadActor}' where movie_id=${movieId}`;
  await db.run(putQuery);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `delete from movie where
  movie_id=${movieId}`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const GetQuery = `select * from director`;
  const dbResponse = await db.all(GetQuery);
  response.send(dbResponse.map((each) => convertObjectToListDirectors(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  //   const directorBody = request.body;
  const getMovieQuery = `select movie_name from movie where director_id=${directorId}`;
  const dbResponse = await db.all(getMovieQuery);
  response.send(dbResponse.map((each) => convertObjectToList(each)));
});

module.exports = app;
