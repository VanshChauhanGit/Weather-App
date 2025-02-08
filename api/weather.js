import axios from "axios";
import { apiKey } from "../constants";

const forecastEndpoint = (param) =>
  `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${param.cityName}&days=${param.days}&aqi=no&alerts=no`;

const locationsEndpoint = (param) =>
  `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${param.cityName}`;

const apiCall = async (endpoint) => {
  const options = {
    method: "GET",
    url: endpoint,
  };
  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.log("Error : ", error);
    return null;
  }
};

export const fetchWeatherForcast = async (param) => {
  const endpoint = forecastEndpoint(param);
  return apiCall(endpoint);
};

export const fetchLocations = async (param) => {
  const endpoint = locationsEndpoint(param);
  return apiCall(endpoint);
};
