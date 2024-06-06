import {
  Box,
  Flex,
  Input,
  SkeletonText,
} from "@chakra-ui/react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { useRef, useState } from "react";

// Australian capital coordinates
const center = { lat: -35.2809, lng: 149.13 };

function App() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const [map, setMap] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(center);
  const inputRef = useRef();
  const autocompleteRef = useRef();
  const geocoder = useRef();

  if (!isLoaded) {
    return <SkeletonText />;
  }

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      const newCenter = { lat: location.lat(), lng: location.lng() };
      setSelectedPosition(newCenter);
      map.panTo(newCenter);
      map.setZoom(15);
    }
  };

  const handleMapClick = async (e) => {
    const newCenter = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setSelectedPosition(newCenter);

    if (!geocoder.current) {
      geocoder.current = new window.google.maps.Geocoder();
    }

    geocoder.current.geocode({ location: newCenter }, (results, status) => {
      if (status === "OK" && results[0]) {
        inputRef.current.value = results[0].formatted_address;
      } else {
        inputRef.current.value = `${newCenter.lat}, ${newCenter.lng}`;
      }
    });
  };

  return (
    <Flex
      position="relative"
      flexDirection="column"
      alignItems="center"
      h="100vh"
      w="100vw"
    >
      <Box position="absolute" left={0} top={0} h="100%" w="100%">
        <GoogleMap
          center={selectedPosition}
          zoom={15}
          mapContainerStyle={{ width: "100%", height: "100%" }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={(map) => setMap(map)}
          onClick={handleMapClick}
        >
          <Marker position={selectedPosition} />
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius="lg"
        m={4}
        bgColor="white"
        shadow="base"
        minW="container.md"
        zIndex="1"
      >
        <Box flexGrow={1}>
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <Input type="text" placeholder="Enter a location" ref={inputRef} />
          </Autocomplete>
        </Box>
      </Box>
    </Flex>
  );
}

export default App;
