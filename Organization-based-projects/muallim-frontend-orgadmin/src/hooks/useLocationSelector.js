import { useState, useEffect, useCallback } from "react";
import {
  useGetCountriesQuery,
  useLazyGetLocationLayersQuery,
} from "@/store/features/locations/apiSlice";
import { location_type_id_eighteen, location_type_id } from "@/static/static";

const useLocationSelector = () => {
  // State
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countries, setCountries] = useState(null);
  const [inputGroups, setInputGroups] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [locationTypesObjItems, setLocationTypesObjItems] = useState([]);
  const [formData, setFormData] = useState({ location_name: "" });
  const [errors, setErrors] = useState({});

  // API hooks
  const { data, isFetching } = useGetCountriesQuery();
  const [getLocationLayers, { data: getLayers, isLoading: isLoadingLayers }] =
    useLazyGetLocationLayersQuery();

  const resetLocationStates = () => {
    setInputGroups([]);
    setLocationTypes([]);
    setLocationTypesObjItems([]);
  };

  const updateInputGroupsToIndex = (targetIndex) => {
    setInputGroups((prev) => prev.slice(0, targetIndex + 1));
  };

  const addLocationTypeIfNew = (locationTypeName, option) => {
    const isExist = locationTypes.includes(locationTypeName);
    if (!isExist && locationTypeName !== "country") {
      setLocationTypes((prev) => [...prev, locationTypeName]);
      setLocationTypesObjItems((prev) => [...prev, option]);
    }
  };

  const handleSubLocationSelection = (option, clickCount) => {
    const targetTypeName = option?.location_type_id?.type_name;

    if (clickCount === 0 && option.itemIndex !== 0) {
      const targetIndex = inputGroups.findIndex(
        (group) => group.type_name === targetTypeName
      );
      updateInputGroupsToIndex(targetIndex);
    } else {
      const targetIndex = inputGroups.findIndex(
        (group) => group.type_name === targetTypeName
      );
      if (targetIndex !== -1) {
        updateInputGroupsToIndex(targetIndex);
      }
    }

    getLocationLayers(option.id);
  };

  const handleLocationSelection = (value, option, clickCount = false) => {
    const isCountrySelection =
      option?.location_type_id?.type_name === "country";

    if (isCountrySelection) {
      resetLocationStates();
      setSelectedCountry(option);
      getLocationLayers(option.id);
    } else {
      handleSubLocationSelection(option, clickCount);
    }

    const locationTypeName = option?.location_type_id?.type_name;
    if (locationTypeName) {
      addLocationTypeIfNew(locationTypeName, option);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setFormErrors = (errorObj) => {
    setErrors(errorObj);
  };

  const clearFormErrors = () => {
    setErrors({});
  };

  const resetLocationSelector = () => {
    resetLocationStates();
    setSelectedCountry(null);
    setFormData({ location_name: "" });
    setErrors({});
  };

  const getCountryOptions = useCallback(() => {
    return (
      countries?.map((country) => ({
        ...country,
        label: country.location_name,
        value: country.location_name,
      })) || []
    );
  }, [countries]);

  const getLocationOptions = useCallback((children) => {
    return children.map((child, index) => ({
      ...child,
      itemIndex: index,
      label: child.location_name,
      value: child.location_name,
    }));
  }, []);

  const getFilteredInputGroups = useCallback(() => {
    return inputGroups.filter(
      (group) =>
        group.location_type_id !== location_type_id &&
        group.location_type_id !== location_type_id_eighteen
    );
  }, [inputGroups]);

  useEffect(() => {
    if (!isFetching && data) {
      setCountries(data?.data);
    }
  }, [data, isFetching]);

  useEffect(() => {
    if (getLayers && !isLoadingLayers) {
      // TODO: remove garbage children layers based on location_type_id, location_type_id_eighteen (17, 18)
      const pureChildrenLayers = {
        ...getLayers?.data,
        children: getLayers?.data?.children?.filter(
          (child) =>
            child.location_type_id.id !== location_type_id &&
            child.location_type_id.id !== location_type_id_eighteen
        ),
      };
      const saveLayers = {
        id: pureChildrenLayers?.id || null,
        location_type_id:
          pureChildrenLayers?.children?.[0]?.location_type_id?.id || null,
        type_name:
          pureChildrenLayers?.children?.[0]?.location_type_id?.type_name ||
          null,
        leaf: true,
        children: pureChildrenLayers?.children || [],
      };
      if (saveLayers && saveLayers.children.length > 0) {
        setInputGroups((prevInputGroups) => {
          const prev = prevInputGroups.map((item) => ({
            ...item,
            leaf: false,
          }));
          return [...prev, saveLayers];
        });
      }
    }
  }, [getLayers, isLoadingLayers]);

  return {
    selectedCountry,
    countries,
    inputGroups,
    locationTypes,
    locationTypesObjItems,
    formData,
    errors,
    isFetching,
    isLoadingLayers,
    handleLocationSelection,
    selectLocationLayerHandler: handleLocationSelection,
    handleFormChange,
    setFormErrors,
    clearFormErrors,
    resetLocationSelector,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    setSelectedCountry,
    setFormData,
    setErrors,
  };
};

export default useLocationSelector;

/* ===============================
How to use this hook:
1. import useLocationSelector from "@/hooks/useLocationSelector";
2. const {
     selectedCountry,
    countries,
    inputGroups,
    locationTypes,
    locationTypesObjItems, // this is the array of location types objects for parent id
    formData, // this is the form data for location name
    errors,
    isFetching,
    isLoadingLayers,
    handleLocationSelection,
    selectLocationLayerHandler: handleLocationSelection,
    handleFormChange,
    setFormErrors,
    clearFormErrors,
    resetLocationSelector,
    getCountryOptions,
    getLocationOptions,
    getFilteredInputGroups,
    setSelectedCountry,
    setFormData,
    setErrors,
  } = useLocationSelector();

  3. JSX Example:
    <div className="location-selector">
      <div>
        <SelectBox
          defaultValue={selectedCountry?.location_name}
          handler={handleLocationSelection}
          loading={isFetching}
          list={getCountryOptions()}
          isRequired
          label="Country"
        />
      </div>

      
      {getFilteredInputGroups().map((group, index) => (
        <div key={index}>
          <SelectBox
            isRequired
            className="blur-anim"
            handler={handleLocationSelection}
            list={getLocationOptions(group.children)}
            label={group.type_name}
          />
          {errors?.location && (
            <p className="text-danger-700 text-sm">{errors.location}</p>
          )}
        </div>
      ))}

     
      <div>
        <InputWithLabel
          label="Street Address"
          placeholder="Enter street address"
          type="text"
          value={formData.location_name}
          name="location_name"
          handler={handleFormChange}
          error={errors?.location_name}
          isRequired
        />
      </div>
    </div>
=============================== */
