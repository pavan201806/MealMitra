package com.example.Vibe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URL;

@Service
public class GeoService {

    public double[] geocode(String place) throws Exception {

        String url =
                "https://nominatim.openstreetmap.org/search" +
                        "?format=json&q=" + place.replace(" ", "%20");

        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(new URL(url));

        if (node.isEmpty()) {
            throw new RuntimeException("Location not found: " + place);
        }

        return new double[]{
                node.get(0).get("lat").asDouble(),
                node.get(0).get("lon").asDouble()
        };
    }

    public double haversine(double lat1, double lon1,
                            double lat2, double lon2) {

        final double R = 6371;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
