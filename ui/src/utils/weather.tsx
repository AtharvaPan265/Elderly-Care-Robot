import { 
    TiWeatherCloudy, TiWeatherDownpour, TiWeatherNight, 
    TiWeatherPartlySunny, TiWeatherShower, TiWeatherSnow, 
    TiWeatherStormy, TiWeatherSunny, TiWeatherWindy, TiWeatherWindyCloudy } from "react-icons/ti";
    
import { IconType } from "react-icons";
import { useEffect, useState } from "react";

export interface WeatherData {
    main: string;
    temp: number;
    error: string | null;
    loading: boolean;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export const mapWeatherToIcon = (description: string, isDaytime: boolean): IconType => {
    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes("rain") || lowerDesc.includes("shower") || lowerDesc.includes("drizzle")) {
        return TiWeatherShower;
    }
    if (lowerDesc.includes("thunder") || lowerDesc.includes("storm")) {
        return TiWeatherStormy;
    }
    if (lowerDesc.includes("snow") || lowerDesc.includes("sleet") || lowerDesc.includes("ice")) {
        return TiWeatherSnow;
    }
    if (lowerDesc.includes("windy")) {
        if (lowerDesc.includes("cloud")) return TiWeatherWindyCloudy;
        return TiWeatherWindy;
    }
    if (lowerDesc.includes("cloud") || lowerDesc.includes("overcast")) {
        if (lowerDesc.includes("partly")) return TiWeatherPartlySunny;
        return TiWeatherCloudy;
    }
    if (lowerDesc.includes("fog") || lowerDesc.includes("mist")) {
        return TiWeatherCloudy;
    }
    if (lowerDesc.includes("clear") || lowerDesc.includes("sunny")) {
        return isDaytime ? TiWeatherSunny : TiWeatherNight;
    }
    return isDaytime ? TiWeatherSunny : TiWeatherNight;
};

const fetchNWSForecast = async (lat: number, lon: number): Promise<{ forecast: string, temp: number } | null> => {
    try {
        const headers = {
            'User-Agent': 'My Simple Dashboard (contact@example.com)',
            'Accept': 'application/geo+json'
        };

        const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
        const pointsData = await pointsResponse.json();

        if (!pointsResponse.ok || !pointsData.properties?.forecastHourly) {
            console.error("NWS Error: Could not find forecast grid point.");
            return null;
        }

        const forecastUrl = pointsData.properties.forecastHourly;
        const forecastResponse = await fetch(forecastUrl, { headers });
        const forecastData = await forecastResponse.json();
        
        if (!forecastResponse.ok) {
            console.error("NWS Error: Failed to fetch forecast data.");
            return null;
        }

        const currentPeriod = forecastData.properties.periods[0];
        
        return {
            forecast: currentPeriod.shortForecast,
            temp: currentPeriod.temperature,
        };

    } catch (err) {
        console.error("Critical NWS Fetch Error:", err);
        return null;
    }
};

export const useUserWeather = () => {
    const [weatherState, setWeatherState] = useState<WeatherData>({ 
        main: 'N/A', temp: 0, error: null, loading: true 
    });
    const [isDaytime, setIsDaytime] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hour = new Date().getHours();
        setIsDaytime(hour > 6 && hour < 20);

        if (!navigator.geolocation) {
            setWeatherState(s => ({ ...s, error: "Geolocation not supported.", loading: false }));
            return;
        }

        const successCallback = (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords;

            fetchNWSForecast(latitude, longitude)
                .then(result => {
                    if (result) {
                        setWeatherState({
                            main: result.forecast,
                            temp: result.temp,
                            error: null,
                            loading: false,
                        });
                    } else {
                         setWeatherState(s => ({ ...s, error: "Could not retrieve weather.", loading: false }));
                    }
                });
        };

        const errorCallback = (err: GeolocationPositionError) => {
            setWeatherState(s => ({ ...s, error: `Location denied: ${err.message}`, loading: false }));
        };
        
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 5000,
        });

    }, []);

    const CurrentIcon = mapWeatherToIcon(weatherState.main, isDaytime);
    
    return { 
        ...weatherState, 
        CurrentIcon
    };
};