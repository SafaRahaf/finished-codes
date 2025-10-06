import { useLoadScript } from "@react-google-maps/api";
import { useState, useCallback, useEffect, useRef } from "react";

const libraries = ["places"];

export default function useGoogleLocation({
  searchInputHandler,
  locationHandler,
  location,
  mapKey,
  mapStatus,
  radius = 10, // Default radius in meters
  radiusHandler,
}) {
  // == == == all references
  const inputRef = useRef(null);
  const hasCalledGetUserLocation = useRef(false);

  // == == == all state store
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [hasUserSelectedLocation, setHasUserSelectedLocation] = useState(false);
  const [isUserEditingAddress, setIsUserEditingAddress] = useState(false);
  const [currentRadius, setCurrentRadius] = useState(radius);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: mapKey, // Use environment variable for API key
    libraries: libraries,
  });

  // permission
  const getUserLocation = useCallback(() => {
    // Don't get user location if user has manually selected a location or if we've already called it
    if (hasUserSelectedLocation || hasCalledGetUserLocation.current) {
      return;
    }

    hasCalledGetUserLocation.current = true;

    // If location props are provided, use them directly
    if (location && location.lat && location.lng) {
      setMarkerPosition(location);
      setMapCenter(location);
      // Call getPlaceName directly without dependency
      if (!isUserEditingAddress && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: location.lat, lng: location.lng } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const placeName = results[0].formatted_address;
              searchInputHandler(placeName);
            } else {
              console.error("Geocoder failed due to: " + status);
            }
          }
        );
      }
      return;
    }

    // If no location props, try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPosition({ lat: latitude, lng: longitude });
          setMapCenter({ lat: latitude, lng: longitude });
          locationHandler({
            lat: latitude,
            lng: longitude,
          });
          // Call getPlaceName directly without dependency
          if (!isUserEditingAddress && window.google?.maps?.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === "OK" && results[0]) {
                  const placeName = results[0].formatted_address;
                  searchInputHandler(placeName);
                } else {
                  console.error("Geocoder failed due to: " + status);
                }
              }
            );
          }
        },
        (error) => {
          // Handle different types of geolocation errors
          let userMessage = "";
          let isUserChoice = false;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userMessage =
                "Location access was not granted. You can manually select your location on the map below.";
              isUserChoice = true;
              break;
            case error.POSITION_UNAVAILABLE:
              userMessage =
                "Location information is currently unavailable. You can manually select your location on the map below.";
              break;
            case error.TIMEOUT:
              userMessage =
                "Location request timed out. You can manually select your location on the map below.";
              break;
            default:
              userMessage =
                "Unable to get your location. You can manually select your location on the map below.";
          }

          // Store the message for UI display
          if (isUserChoice) {
            setLocationInfo(userMessage);
          } else {
            setLocationError(userMessage);
          }

          // Fallback to a default location
          setMapCenter({ lat: 37.7749, lng: -122.4194 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10 seconds
          maximumAge: 300000, // 5 minutes
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to a default location (optional)
      setMapCenter({ lat: 37.7749, lng: -122.4194 });
    }
  }, [
    hasUserSelectedLocation,
    location,
    locationHandler,
    searchInputHandler,
    isUserEditingAddress,
  ]);

  // == == == methods
  const getPlaceName = useCallback(
    (lat, lng) => {
      // Don't update the address input if user is actively editing it
      if (isUserEditingAddress) {
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          const placeName = results[0].formatted_address;
          searchInputHandler(placeName);
        } else {
          console.error("Geocoder failed due to: " + status);
        }
      });
    },
    [isUserEditingAddress, searchInputHandler]
  );

  const getPlacePredictions = useCallback(async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      // Check if modern API is available
      if (
        window.google?.maps?.places?.AutocompleteSuggestion
          ?.findAutocompletePredictions
      ) {
        // Use the modern AutocompleteSuggestion API
        const suggestions =
          await window.google.maps.places.AutocompleteSuggestion.findAutocompletePredictions(
            {
              input: input,
              componentRestrictions: { country: [] },
              types: ["geocode", "establishment"],
            }
          );

        if (suggestions && suggestions.length > 0) {
          setPredictions(suggestions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } else {
        // Fallback to currently available AutocompleteService
        const autocompleteService =
          new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
          {
            input: input,
            componentRestrictions: { country: [] },
            types: ["geocode", "establishment"],
          },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setPredictions(predictions);
              setShowPredictions(true);
            } else {
              setPredictions([]);
              setShowPredictions(false);
            }
          }
        );
      }
    } catch (error) {
      console.error("Error getting place predictions:", error);
      setPredictions([]);
      setShowPredictions(false);
    }
  }, []);

  const selectPlace = useCallback(
    async (placeId) => {
      console.log("selectPlace called with placeId:", placeId);
      try {
        // Check if modern API is available
        if (window.google?.maps?.places?.Place?.findByPlaceId) {
          // Use the modern Place API
          const place = await window.google.maps.places.Place.findByPlaceId(
            placeId
          );

          if (place && place.geometry && place.geometry.location) {
            const location = place.geometry.location;
            const lat = location.lat;
            const lng = location.lng;

            setMapCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
            locationHandler({ lat, lng });
            setHasUserSelectedLocation(true); // Mark that user has selected a location
            setIsUserEditingAddress(false); // Reset editing state

            if (mapStatus) {
              searchInputHandler(place.formattedAddress || place.name);
            }

            setPredictions([]);
            setShowPredictions(false);
          }
        } else {
          // Fallback to currently available PlacesService
          const placesService = new window.google.maps.places.PlacesService(
            document.createElement("div")
          );

          placesService.getDetails(
            {
              placeId: placeId,
              fields: ["geometry", "formatted_address", "name"],
            },
            (place, status) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                place
              ) {
                const location = place.geometry.location;
                const lat = location.lat();
                const lng = location.lng();

                setMapCenter({ lat, lng });
                setMarkerPosition({ lat, lng });
                locationHandler({ lat, lng });
                setHasUserSelectedLocation(true); // Mark that user has selected a location
                setIsUserEditingAddress(false); // Reset editing state

                if (mapStatus) {
                  searchInputHandler(place.formatted_address || place.name);
                }

                setPredictions([]);
                setShowPredictions(false);
              } else {
                // Final fallback: use prediction data directly
                const prediction = predictions.find(
                  (p) => p.place_id === placeId
                );
                if (prediction) {
                  searchInputHandler(prediction.description);
                  setIsUserEditingAddress(false); // Reset editing state
                  setPredictions([]);
                  setShowPredictions(false);
                }
              }
            }
          );
        }
      } catch (error) {
        console.error("Error getting place details:", error);
        // Fallback: try to use the prediction data directly
        const prediction = predictions.find((p) => p.place_id === placeId);
        if (prediction) {
          searchInputHandler(prediction.description);
          setIsUserEditingAddress(false); // Reset editing state
          setPredictions([]);
          setShowPredictions(false);
        }
      }
    },
    [locationHandler, mapStatus, searchInputHandler, predictions]
  );

  const onMapClick = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({
        lat: lat,
        lng: lng,
      });
      locationHandler({
        lat: lat,
        lng: lng,
      });
      setHasUserSelectedLocation(true); // Mark that user has selected a location
      setIsUserEditingAddress(false); // Reset editing state to allow address update
      // Call geocoding directly to avoid circular dependency
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const placeName = results[0].formatted_address;
            searchInputHandler(placeName);
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        });
      }
    },
    [locationHandler, searchInputHandler]
  );

  // Handler when the marker is dragged to a new location
  const onMarkerDragEnd = useCallback(
    (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPosition({
        lat: lat,
        lng: lng,
      });
      locationHandler({
        lat: lat,
        lng: lng,
      });
      setHasUserSelectedLocation(true); // Mark that user has selected a location
      setIsUserEditingAddress(false); // Reset editing state to allow address update
      // Call geocoding directly to avoid circular dependency
      if (window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const placeName = results[0].formatted_address;
            searchInputHandler(placeName);
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        });
      }
    },
    [locationHandler, searchInputHandler]
  );

  // Handler for search input changes
  const handleSearchInputChange = useCallback(
    (e) => {
      const value = e.target.value;
      setIsUserEditingAddress(true); // Mark that user is editing
      searchInputHandler(value);
      getPlacePredictions(value);
    },
    [searchInputHandler, getPlacePredictions]
  );

  // Handler for search input focus
  const handleSearchInputFocus = useCallback(() => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  }, [predictions.length]);

  // Handler for search input blur
  const handleSearchInputBlur = useCallback(() => {
    // Delay hiding predictions to allow clicking on them
    setTimeout(() => setShowPredictions(false), 200);
  }, []);

  // Handler for prediction selection
  const handlePredictionSelect = useCallback(
    (placeId) => {
      selectPlace(placeId);
      setIsUserEditingAddress(false); // Reset editing state
    },
    [selectPlace]
  );

  // Handler for simple input change (when map is disabled)
  const handleSimpleInputChange = useCallback(
    (e) => {
      setIsUserEditingAddress(true); // Mark that user is editing
      searchInputHandler(e.target.value);
    },
    [searchInputHandler]
  );

  // Handler for retry location
  const handleRetryLocation = useCallback(() => {
    setLocationError(null);
    setHasUserSelectedLocation(false); // Reset user selection flag
    setIsUserEditingAddress(false); // Reset editing state
    hasCalledGetUserLocation.current = false; // Reset the ref to allow retry
    getUserLocation();
  }, [getUserLocation]);

  // Handler for radius change
  const handleRadiusChange = useCallback(
    (newRadius) => {
      const radiusValue = Number(newRadius) || 0;
      setCurrentRadius(radiusValue);
      if (radiusHandler) {
        radiusHandler(radiusValue);
      }
    },
    [radiusHandler]
  );

  // == == == effects
  useEffect(() => {
    // Get user's location when the component mounts - Only when map is enabled
    if (isLoaded && mapStatus === 1 && !hasCalledGetUserLocation.current) {
      getUserLocation();
    }
  }, [isLoaded, mapStatus, getUserLocation]);

  // Handle location prop changes - set map center and marker when location prop is provided
  useEffect(() => {
    if (location && location.lat && location.lng && isLoaded) {
      setMarkerPosition(location);
      setMapCenter(location);

      // Get place name if not editing address
      if (!isUserEditingAddress && window.google?.maps?.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: location.lat, lng: location.lng } },
          (results, status) => {
            if (status === "OK" && results[0]) {
              const placeName = results[0].formatted_address;
              searchInputHandler(placeName);
            } else {
              console.error("Geocoder failed due to: " + status);
            }
          }
        );
      }
    }
  }, [location, isLoaded, isUserEditingAddress, searchInputHandler]);

  // Sync radius prop with internal state
  useEffect(() => {
    if (radius !== currentRadius) {
      setCurrentRadius(Number(radius) || 0);
    }
  }, [radius, currentRadius]);

  return {
    // State
    isLoaded, // boolean - true when Google Maps API is loaded, false when loading
    markerPosition, // object - {lat: number, lng: number} or null
    mapCenter, // object - {lat: number, lng: number} or null
    locationError, // string - error message or null
    locationInfo, // string - location info message or null
    predictions, // array - Google Places autocomplete predictions []
    showPredictions, // boolean - true/false to show prediction dropdown
    hasUserSelectedLocation, // boolean - true if user manually selected location
    isUserEditingAddress, // boolean - true when user is typing in address input
    inputRef, // React ref - reference to input element
    currentRadius, // number - current radius value in meters

    // Methods
    onMapClick, // function - handles map click events
    onMarkerDragEnd, // function - handles marker drag events
    handleSearchInputChange, // function - handles address input changes
    handleSearchInputFocus, // function - handles input focus events
    handleSearchInputBlur, // function - handles input blur events
    handlePredictionSelect, // function - handles prediction selection
    handleSimpleInputChange, // function - handles simple input changes (no map)
    handleRetryLocation, // function - retry getting user location
    handleRadiusChange, // function - handles radius value changes

    // Internal methods (if needed externally)
    getUserLocation, // function - gets user's current location
    getPlaceName, // function - gets place name from coordinates
    getPlacePredictions, // function - gets Google Places predictions
    selectPlace, // function - selects a place by place ID
  };
}
