import express, {Request, Response, NextFunction} from "express";
import axios from "axios";
import {createClient, RedisClientType} from "redis";

export const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({message:"hey shubham"})
})


async function fetchWeatherApi(city: string){
  const weather = await axios.get(`http://api.weatherstack.com/current?access_key=401f57d208c40b0695d0e954be6873eb&query=${city}`);
  const weatherData = weather.data;
  return (weatherData)
}

let redisClient: RedisClientType;

(async () => {
  redisClient = createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

async function redisCacheMiddleware(req: Request, res: Response, next:NextFunction ) {
  const {city} = req.body;
  
  if (!city){
    res.status(400).json({error: "city parameter in body is required"});
  }

  let results;
  let isCached = true;

  try {
    const cachedResults = await redisClient.get(city);
    if (cachedResults){
      results = JSON.parse(cachedResults);
      res.json({
        isCached, 
        results,
      })
    } else {
      next();
    }    
  } catch (error){
    console.error("error fetching key from redis");
    res.status(404).json({error: "error fetching data from redis"})
  }
}

async function getWeatherData(req: Request, res: Response) {
  const {city} = req.body;

  let results;
  let isCached = false;

  try{
      results = await fetchWeatherApi(city); 
      if (results.length === 0) {
        throw new Error("API returned an empty array.");
      }
      await redisClient.set(city, JSON.stringify(results), {
        EX: 30,  // no. of seconds for cacheResults
        NX: true, // when set to true, ensures set() method only set a key that doesnt already exist in Redis
      });

    res.send({
      fromCache: isCached, 
      data: results,
    })
    return;
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable")
  }
}

app.post("/weather",redisCacheMiddleware, getWeatherData);
