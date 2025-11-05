import { env } from "@/env";
import axios from "axios";

export const getWeather = async () => {
	const url = `https://api.weatherapi.com/v1/current.json?key=${env.NEXT_PUBLIC_WEATHER_API_KEY}&q=Hanoi&aqi=no`;
	const response = await axios.get(url);
	return response.data;
};
