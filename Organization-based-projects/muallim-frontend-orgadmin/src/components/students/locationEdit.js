import InputWithLabel from "@/components/common/Inputs/Input/InputWithLabel";
import SelectBox from "@/components/common/Inputs/Input/SelectBox";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  useGetCountriesQuery,
  useLazyGetLocationLayersQuery,
} from "@/store/features/locations/apiSlice";

const extractLocationHierarchy = (location) => {
  const hierarchy = [];
  let current = location;
  while (current) {
    hierarchy.push({
      id: current.id,
      name: current.location_name,
      type: current.location_type_id?.type_name,
    });
    current = current?.parent_id;
  }
  return hierarchy.reverse();
};

const LocationEdit = ({
  handleChange,
  location,
  defaultValue,
  AddAddress = true,
}) => {
  const initialHierarchy = useMemo(
    () => extractLocationHierarchy(location || defaultValue || {}),
    [location, defaultValue]
  );

  const [editMode, setEditMode] = useState(false);
  const [inputGroups, setInputGroups] = useState([]);
  const inputGroupsRef = useRef([]);
  const [selectedValues, setSelectedValues] = useState({});

  const [streetAddress, setStreetAddress] = useState(
    location?.location_name || null
  );
  const [zipCode, setZipCode] = useState(location?.post_code || null);
  const [lat, setLat] = useState(location?.lat || "0.0");
  const [long, setLong] = useState(location?.long || "0.0");

  const [getCountries, setGetCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const { data: countriesData, isFetching } = useGetCountriesQuery();
  const [getLocationLayers, { data: getLayers }] =
    useLazyGetLocationLayersQuery();

  const isPopulating = useRef(false);
  const loadedParents = useRef(new Set());

  useEffect(() => {
    if (!isFetching && countriesData?.data) {
      setGetCountries(countriesData.data);
    }
  }, [countriesData, isFetching]);

  useEffect(() => {
    const populateHierarchy = async () => {
      if (isPopulating.current || initialHierarchy.length === 0) return;
      isPopulating.current = true;
      loadedParents.current.clear();

      const countryLevel = initialHierarchy[0];
      const countryOption = countriesData?.data.find(
        (c) => c.location_name === countryLevel.name
      );
      if (countryOption) {
        setSelectedCountry(countryOption);
        setSelectedValues((prev) => ({
          ...prev,
          [countryLevel.type]: countryOption.location_name,
        }));
        let currentParentId = countryOption.id;
        let currentGroups = [
          {
            type_name: countryLevel.type,
            children: countriesData.data,
            selected: countryOption.location_name,
          },
        ];
        loadedParents.current.add(currentParentId);

        for (let i = 1; i < initialHierarchy.length; i++) {
          const level = initialHierarchy[i];
          const { data: layers } = await getLocationLayers(currentParentId);
          loadedParents.current.add(currentParentId);

          if (layers?.data?.children) {
            const matchingChild = layers.data.children.find(
              (child) => child.location_name === level.name
            );
            if (matchingChild) {
              currentGroups.push({
                type_name: level.type,
                children: layers.data.children,
                selected: matchingChild.location_name,
              });
              setSelectedValues((prev) => ({
                ...prev,
                [level.type]: matchingChild.location_name,
              }));
              currentParentId = matchingChild.id;
            }
          }
        }

        setInputGroups(currentGroups);
        inputGroupsRef.current = currentGroups;
      }
      isPopulating.current = false;
    };

    if (countriesData?.data && initialHierarchy.length > 0) {
      populateHierarchy();
    }
  }, [countriesData, initialHierarchy, getLocationLayers]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSelect = useCallback(
    debounce(async (value, option, groupIndex) => {
      if (!option || loadedParents.current.has(option.id)) return;

      const updatedGroups = [
        ...inputGroupsRef.current.slice(0, groupIndex + 1),
      ];
      updatedGroups[groupIndex].selected = value;

      setSelectedValues((prev) => ({
        ...prev,
        [updatedGroups[groupIndex].type_name]: value,
      }));

      const { data: layers } = await getLocationLayers(option.id);
      loadedParents.current.add(option.id);

      if (layers?.data?.children?.length > 0) {
        const nextType = layers.data.children[0].location_type_id.type_name;
        updatedGroups.push({
          type_name: nextType,
          children: layers.data.children,
          selected: "",
        });
      }

      setInputGroups(updatedGroups);
      inputGroupsRef.current = updatedGroups;

      handleChange({
        target: {
          name: "location",
          value: {
            location_name: streetAddress,
            post_code: zipCode,
            // lat,
            // long,
            location_type_id: 18,
            location_parent_id: option.id,
          },
        },
      });
    }, 300),
    [
      getLocationLayers,
      streetAddress,
      zipCode,
      // lat, long,
      handleChange,
    ]
  );

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name === "street_address") setStreetAddress(value);
    if (name === "zip_code") setZipCode(value);
    // if (name === "lat") setLat(value);
    // if (name === "long") setLong(value);

    handleChange(e);
  };

  const handleCountrySelect = (value, option) => {
    setSelectedCountry(option);
    setSelectedValues({ country: value });
    const countryGroup = [
      {
        type_name: "country",
        children: getCountries,
        selected: value,
      },
    ];
    setInputGroups(countryGroup);
    inputGroupsRef.current = countryGroup;
    debouncedSelect(value, option, 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-bold">Address</h4>
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className="text-blue-500 font-bold"
        >
          {editMode ? "Cancel" : AddAddress ? "Add Address" : "Edit Location"}
        </button>
      </div>

      {!editMode ? (
        <>
          <InputWithLabel
            label="Street Address"
            value={streetAddress}
            disabled
          />
          {initialHierarchy.map((level, i) => (
            <InputWithLabel
              key={i}
              label={
                level?.type?.charAt(0).toUpperCase() + level?.type?.slice(1)
              }
              value={level?.name}
              disabled
            />
          ))}
        </>
      ) : (
        <>
          <div className="mb-3">
            <SelectBox
              label="Country"
              value={selectedValues["country"] || ""}
              handler={handleCountrySelect}
              loading={isFetching}
              list={
                getCountries?.map((item) => ({
                  ...item,
                  label: item?.location_name,
                  value: item.location_name,
                })) || []
              }
            />
          </div>

          {inputGroups.slice(1).map((item, i) => (
            <div key={i} className="mb-3">
              <SelectBox
                label={
                  item?.type_name?.charAt(0).toUpperCase() +
                  item?.type_name?.slice(1)
                }
                value={selectedValues[item?.type_name] || ""}
                handler={(value, option) =>
                  debouncedSelect(value, option, i + 1)
                }
                list={item?.children?.map((child) => ({
                  ...child,
                  label: child.location_name,
                  value: child.location_name,
                }))}
              />
            </div>
          ))}

          <div className="mb-3">
            <InputWithLabel
              label="Street Address"
              placeholder="1750 Ranchero Road"
              type="text"
              name="street_address"
              value={streetAddress}
              handler={handleTextChange}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LocationEdit;
