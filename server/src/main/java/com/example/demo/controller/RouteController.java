package com.example.demo.controller;

import com.example.demo.DTOs.RouteRequest;
import com.example.demo.DTOs.RouteResponse;
import com.example.demo.service.GeoService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // allow frontend access
public class RouteController {

    private final GeoService geo;

    public RouteController(GeoService geo) {
        this.geo = geo;
    }

    @PostMapping("/route")
    public RouteResponse route(@RequestBody RouteRequest req) throws Exception {

        double[] s = geo.geocode(req.start);
        double[] e = geo.geocode(req.end);

        double dist = geo.haversine(s[0], s[1], e[0], e[1]);

        RouteResponse res = new RouteResponse();
        res.startLat = s[0];
        res.startLng = s[1];
        res.endLat = e[0];
        res.endLng = e[1];
        res.distance = Math.round(dist * 100.0) / 100.0;
        res.eta = (int) (dist / 0.5); // avg speed ~30 km/h

        return res;
    }
}
