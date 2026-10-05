$content = @'
package com.primeroute.logistics.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final RestTemplate restTemplate;

    @Value("${google.maps.api-key:}")
    private String googleMapsApiKey;

    public static class Coordinates {
        private final double latitude;
        private final double longitude;

        public Coordinates(double latitude, double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public double getLatitude() {
            return latitude;
        }

        public double getLongitude() {
            return longitude;
        }
    }

    public GeocodingService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(4).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(4).toMillis());
        this.restTemplate = new RestTemplate(factory);
    }

    public Coordinates geocode(String addressLine1, String city, String state, String postalCode, String country) {
        // 1. Try Google Maps Geocoding if API key is provided
        if (googleMapsApiKey != null && !googleMapsApiKey.isBlank()) {
            Coordinates googleCoords = geocodeWithGoogle((addressLine1 != null ? addressLine1 + ", " : "") + city + ", " + state + " " + postalCode + ", " + country);
            if (googleCoords != null) {
                return googleCoords;
            }
        }

        // 2. Try Nominatim with full address
        String fullQuery = (addressLine1 != null && !addressLine1.isBlank() ? addressLine1 + ", " : "") +
                city + ", " + state + " " + (postalCode != null ? postalCode : "") + ", " + country;
        Coordinates coords = geocodeWithNominatim(fullQuery);
        if (coords != null) {
            return coords;
        }

        // 3. Fallback: Try Nominatim with city, state, country
        String cityQuery = city + ", " + state + ", " + country;
        coords = geocodeWithNominatim(cityQuery);
        if (coords != null) {
            return coords;
        }

        // 4. Default baseline coordinates for common Indian hubs if network is offline
        return getBaselineCoordinates(city, state, postalCode);
    }

    private Coordinates geocodeWithNominatim(String query) {
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://nominatim.openstreetmap.org/search?q=" + encoded + "&format=json&limit=1";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "PrimeRouteLogistics/1.0 (support@primeroute.com)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                Map<?, ?> firstResult = (Map<?, ?>) response.getBody().get(0);
                if (firstResult.containsKey("lat") && firstResult.containsKey("lon")) {
                    double lat = Double.parseDouble(firstResult.get("lat").toString());
                    double lon = Double.parseDouble(firstResult.get("lon").toString());
                    log.info("Nominatim geocoded '{}' -> ({}, {})", query, lat, lon);
                    return new Coordinates(lat, lon);
                }
            }
        } catch (Exception ex) {
            log.warn("Nominatim geocoding failed for '{}': {}", query, ex.getMessage());
        }
        return null;
    }

    private Coordinates geocodeWithGoogle(String address) {
        try {
            String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encoded + "&key=" + googleMapsApiKey;
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "OK".equals(response.get("status"))) {
                List<?> results = (List<?>) response.get("results");
                if (results != null && !results.isEmpty()) {
                    Map<?, ?> first = (Map<?, ?>) results.get(0);
                    Map<?, ?> geometry = (Map<?, ?>) first.get("geometry");
                    Map<?, ?> location = (Map<?, ?>) geometry.get("location");
                    double lat = Double.parseDouble(location.get("lat").toString());
                    double lng = Double.parseDouble(location.get("lng").toString());
                    log.info("Google Maps geocoded '{}' -> ({}, {})", address, lat, lng);
                    return new Coordinates(lat, lng);
                }
            }
        } catch (Exception ex) {
            log.warn("Google geocoding error: {}", ex.getMessage());
        }
        return null;
    }

    public Coordinates getBaselineCoordinates(String city, String state, String postalCode) {
        String combined = ((city != null ? city : "") + " " + (state != null ? state : "") + " " + (postalCode != null ? postalCode : "")).trim().toLowerCase();

        if (combined.contains("kolkata") || combined.contains("calcutta") || combined.contains("west bengal") || combined.contains("westbengal") || combined.startsWith("700") || combined.startsWith("711") || combined.startsWith("712")) {
            return new Coordinates(22.5726, 88.3639);
        }
        if (combined.contains("bangalore") || combined.contains("bengaluru") || combined.contains("karnataka") || combined.startsWith("560")) {
            return new Coordinates(12.9716, 77.5946);
        }
        if (combined.contains("mumbai") || combined.contains("bombay") || combined.contains("maharashtra") || combined.startsWith("400")) {
            return new Coordinates(19.0760, 72.8777);
        }
        if (combined.contains("delhi") || combined.contains("new delhi") || combined.startsWith("110")) {
            return new Coordinates(28.6139, 77.2090);
        }
        if (combined.contains("chennai") || combined.contains("madras") || combined.contains("tamil nadu") || combined.contains("tamilnadu") || combined.startsWith("600")) {
            return new Coordinates(13.0827, 80.2707);
        }
        if (combined.contains("hyderabad") || combined.contains("telangana") || combined.startsWith("500")) {
            return new Coordinates(17.3850, 78.4867);
        }
        if (combined.contains("pune") || combined.startsWith("411")) {
            return new Coordinates(18.5204, 73.8567);
        }
        if (combined.contains("cuttack") || combined.startsWith("753")) {
            return new Coordinates(20.4625, 85.8830);
        }
        if (combined.contains("bhubaneswar") || combined.contains("odisha") || combined.startsWith("751")) {
            return new Coordinates(20.2961, 85.8245);
        }
        return new Coordinates(20.2961, 85.8245);
    }
}
'@

[System.IO.File]::WriteAllText('C:\Users\shrut\Documents\workspace-spring-tools-for-eclipse-5.0.0.RELEASE\Logistics-management\src\main\java\com\primeroute\logistics\service\GeocodingService.java', $content, [System.Text.Encoding]::UTF8)
Write-Host "GeocodingService.java updated successfully."
