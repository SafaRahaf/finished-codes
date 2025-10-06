"use client";
import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, MarkerF } from "@react-google-maps/api";
import siteConfig from "@/config";
import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import useGoogleLocation from "@/hooks/useGoogleLocation";

const GooleMapExampleFeature = () => {
  /**
   * ===== Google Map Location Logic =====
   * 1. map states and radius state @const maplocation, mapAddress, radius
   * 2. handlers @func mapAddressHandler, radiusHandler
   * 3. initlize hook @func useGoogleLocation
   * 4.refs for map and single circle instance @ref mapRef, circleRef
   * 5. google map instance handler @func handleMapLoad
   * 6. effect to create/update/remove single google.maps.Circle when marker/ radius/flag change @func useEffect
   * 7. cleanup on unmount @func useEffect
   */

  // 1. map states
  const [mapLocation, setMapLocation] = useState(null);
  const [mapAddress, setMapAddress] = useState(null);

  // 1. radius state (in meters) — local and passed to hook
  const [radius, setRadius] = useState(0);

  // 2. handlers
  const mapAddressHandler = (value) => setMapAddress(value);
  const radiusHandler = (value) => setRadius(value);

  // 3. hook
  const {
    isLoaded: mapIsLoaded,
    markerPosition,
    mapCenter,
    currentRadius, // radius controlled by hook (synced from prop)
    hasUserSelectedLocation,
    onMapClick,
    onMarkerDragEnd,
    handleSearchInputChange,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handlePredictionSelect,
    handleSimpleInputChange,
    handleRadiusChange,
    inputRef,
    predictions,
    showPredictions,
  } = useGoogleLocation({
    searchInputHandler: mapAddressHandler || (() => {}),
    locationHandler: setMapLocation || (() => {}),
    location: mapLocation,
    mapKey: siteConfig.MAP_KEY,
    mapStatus: Number(siteConfig.MAP_STATUS),
    radius: radius,
    radiusHandler: radiusHandler,
  });

  // 4. refs for map and single circle instance
  const mapRef = useRef(null);
  const circleRef = useRef(null);

  // 5. Capture google.maps.Map instance on load
  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // 6. Effect: create/update/remove single google.maps.Circle when marker/ radius/flag change
  useEffect(() => {
    // ensure google maps is available and map instance exists
    if (!window.google || !mapRef.current) return;

    const hasValidMarker =
      markerPosition &&
      typeof markerPosition.lat === "number" &&
      typeof markerPosition.lng === "number";

    const positiveRadius = Number(currentRadius) > 0;

    if (hasValidMarker && positiveRadius && hasUserSelectedLocation) {
      // create circle if not exists
      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
          strokeColor: "#7F669D",
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: "#7F669D",
          fillOpacity: 0.1,
          map: mapRef.current,
          center: markerPosition,
          radius: Number(currentRadius) || 0,
        });
      } else {
        // update existing
        circleRef.current.setCenter(markerPosition);
        circleRef.current.setRadius(Number(currentRadius) || 0);
        // ensure it's attached to map (in case map changed)
        circleRef.current.setMap(mapRef.current);
      }
    } else {
      // no circle should be shown — remove if exists
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    }
  }, [markerPosition, currentRadius, hasUserSelectedLocation]);

  // 7. Cleanup on unmount
  useEffect(() => {
    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
      mapRef.current = null;
    };
  }, []);

  /* ===== end of google map location logic ===== */

  if (!mapIsLoaded) return <div>Loading...</div>;

  return (
    <div className="max-w-[752px] mx-auto">
      <div className="w-full grid grid-cols-2 gap-8">
        <div className="w-full h-[312px]">
          {/* Google Map */}
          {Number(siteConfig.MAP_STATUS) === 1 && mapCenter && (
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={15}
              onClick={onMapClick}
              onLoad={handleMapLoad}
              options={{
                mapTypeControl: false,
                streetViewControl: false,
              }}
            >
              {markerPosition && (
                <MarkerF
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={onMarkerDragEnd}
                />
              )}
            </GoogleMap>
          )}
        </div>

        <div className="w-full">
          {/* Address Input */}
          {Number(siteConfig.MAP_STATUS) === 1 ? (
            <div className="relative">
              <div>
                <InputWithLabel
                  ref={inputRef}
                  value={mapAddress}
                  handler={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onBlur={handleSearchInputBlur}
                  label="Address"
                  placeholder="Your Address here"
                  error={
                    mapAddress &&
                    Object.hasOwn(mapAddress, "address") &&
                    mapAddress.address[0]
                  }
                />
                {mapAddress &&
                Object.hasOwn(mapAddress, "address") &&
                mapAddress.address[0] ? (
                  <span className="text-sm mt-1 text-qred">
                    {mapAddress.address[0]}
                  </span>
                ) : (
                  ""
                )}
              </div>

              {showPredictions && predictions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                      onClick={() =>
                        handlePredictionSelect(prediction.place_id)
                      }
                    >
                      <div className="text-sm text-gray-900">
                        {prediction.structured_formatting?.main_text ||
                          prediction.description}
                      </div>
                      {prediction.structured_formatting?.secondary_text && (
                        <div className="text-xs text-gray-500">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <InputWithLabel
                value={mapAddress}
                handler={handleSimpleInputChange}
                label="Address"
                placeholder="Your Address here"
                error={
                  mapAddress &&
                  Object.hasOwn(mapAddress, "address") &&
                  mapAddress.address[0]
                }
              />
              {mapAddress &&
              Object.hasOwn(mapAddress, "address") &&
              mapAddress.address[0] ? (
                <span className="text-sm mt-1 text-qred">
                  {mapAddress.address[0]}
                </span>
              ) : (
                ""
              )}
            </div>
          )}

          {/* Radius Input */}
          <div className="w-full mt-4">
            <InputWithLabel
              value={radius}
              handler={(e) => handleRadiusChange(e.target.value)}
              label="Radius (m)"
              placeholder="Enter radius in meters"
              type="number"
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GooleMapExampleFeature;
