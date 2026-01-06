package com.mealmitra.server.service;

import com.mealmitra.server.exception.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class LocationNormalizerService {

    private static final Map<String, CityCoordinates> CITY_COORDINATES = new HashMap<>();

    static {
        CITY_COORDINATES.put("hyderabad", new CityCoordinates(17.3850, 78.4867, "Hyderabad"));
        CITY_COORDINATES.put("bengaluru", new CityCoordinates(12.9716, 77.5946, "Bengaluru"));
        CITY_COORDINATES.put("bangalore", new CityCoordinates(12.9716, 77.5946, "Bangalore"));
        CITY_COORDINATES.put("chennai", new CityCoordinates(13.0827, 80.2707, "Chennai"));
        CITY_COORDINATES.put("mumbai", new CityCoordinates(19.0760, 72.8777, "Mumbai"));
        CITY_COORDINATES.put("delhi", new CityCoordinates(28.6139, 77.2090, "Delhi"));
        CITY_COORDINATES.put("kolkata", new CityCoordinates(22.5726, 88.3639, "Kolkata"));
        CITY_COORDINATES.put("pune", new CityCoordinates(18.5204, 73.8567, "Pune"));
        CITY_COORDINATES.put("ahmedabad", new CityCoordinates(23.0225, 72.5714, "Ahmedabad"));
    }

    public LocationData normalizeLocation(LocationInput input) {
        if (input == null) {
            throw new BadRequestException("Location input must be provided");
        }

        // Case 1: Direct coordinates provided
        if (input.getLatitude() != null && input.getLongitude() != null) {
            validateCoordinates(input.getLatitude(), input.getLongitude());

            String city = input.getCity() != null ? input.getCity().trim() : "";

            return new LocationData(input.getLatitude(), input.getLongitude(), city);
        }

        // Case 2: City name provided (lookup coordinates)
        if (input.getCity() != null && !input.getCity().trim().isEmpty()) {
            String cityName = input.getCity().trim().toLowerCase();

            CityCoordinates coords = CITY_COORDINATES.get(cityName);
            if (coords == null) {
                throw new BadRequestException(
                        String.format("City \"%s\" not found in supported cities. Supported: %s",
                                input.getCity(), String.join(", ", CITY_COORDINATES.keySet())));
            }

            return new LocationData(coords.getLatitude(), coords.getLongitude(), coords.getName());
        }

        // Case 3: Invalid input
        throw new BadRequestException("Location input must include either (latitude, longitude) or city name");
    }

    public void validateLocation(LocationData location) {
        if (location == null) {
            throw new BadRequestException("Location must be provided");
        }

        if (location.getLatitude() == null || location.getLongitude() == null) {
            throw new BadRequestException("Location must include latitude and longitude");
        }

        validateCoordinates(location.getLatitude(), location.getLongitude());
    }

    private void validateCoordinates(Double latitude, Double longitude) {
        if (latitude == null || latitude < -90 || latitude > 90) {
            throw new BadRequestException("Invalid latitude. Must be a number between -90 and 90");
        }

        if (longitude == null || longitude < -180 || longitude > 180) {
            throw new BadRequestException("Invalid longitude. Must be a number between -180 and 180");
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationInput {
        private Double latitude;
        private Double longitude;
        private String city;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationData {
        private Double latitude;
        private Double longitude;
        private String city;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class CityCoordinates {
        private Double latitude;
        private Double longitude;
        private String name;
    }
}
