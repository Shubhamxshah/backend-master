import express from "express";
import axios from "axios";

export const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({message:"hey shubham"})
})

app.get("/weather", async (req, res) => {

  const {city} = req.body;

  const weather = await axios.get(`http://api.weatherstack.com/current?access_key=401f57d208c40b0695d0e954be6873eb&query=${city}`);

  const weatherData = weather.data;
  res.json(weatherData);

})
