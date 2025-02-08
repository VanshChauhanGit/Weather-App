import {
  View,
  Text,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../theme";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForcast } from "../api/weather";
import { weatherImages } from "@/constants";
import { storeData, getData } from "../utils/asyncStorage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const HomeScreen = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const locationHandler = (location) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForcast({ cityName: location.name, days: "7" }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", location.name);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "New Delhi";
    if (myCity) cityName = myCity;
    const data = await fetchWeatherForcast({
      cityName,
      days: "7",
    });
    setWeather(data);
    setLoading(false);
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      automaticallyAdjustKeyboardInsets={true}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 relative">
        <StatusBar
          translucent
          barStyle="light-content"
          backgroundColor="transparent"
        />
        <Image
          source={require("../assets/images/bg.png")}
          className="absolute w-full h-full"
          blurRadius={70}
        />

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="140" color="#0bb3b2" />
          </View>
        ) : (
          <SafeAreaView className="flex flex-1">
            {/* Search Section */}
            <View
              style={{ height: "10%" }}
              className="mx-4 relative z-50 mt-1 justify-center"
            >
              <View
                className="flex-row justify-end items-center rounded-full"
                style={{
                  backgroundColor: showSearch
                    ? theme.bgWhite(0.2)
                    : "transparent",
                  borderRadius: showSearch ? 50 : 0,
                }}
              >
                {showSearch && (
                  <TextInput
                    placeholder="Search City"
                    placeholderTextColor={"lightgray"}
                    onChangeText={handleTextDebounce}
                    onBlur={() => setLocations([])}
                    className="pl-6 py-4 flex-1 h-16 text-lg text-white rounded-full"
                  />
                )}

                <TouchableOpacity
                  className="p-3 m-1 rounded-full"
                  style={{ backgroundColor: theme.bgWhite(0.3) }}
                  onPress={() => {
                    toggleSearch(!showSearch);
                    setLocations([]);
                  }}
                >
                  <MagnifyingGlassIcon color="white" size={30} />
                </TouchableOpacity>
              </View>

              {locations.length > 0 && showSearch && (
                <View className="absolute w-full bg-gray-300 top-20 rounded-3xl">
                  {locations.map((location, index) => {
                    let showBorder = index + 1 != locations.length;
                    let borderClass = showBorder
                      ? "border-b-2 border-b-gray-400"
                      : "";
                    return (
                      <TouchableOpacity
                        onPress={() => locationHandler(location)}
                        key={index}
                        className={`flex-row items-center p-3 border-0 px-4 mb-1 gap-2 ${borderClass}`}
                      >
                        <MapPinIcon size={20} color={"gray"} />
                        <Text className="text-black text-lg">
                          {location?.name}, {location?.country}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Forcast Section */}
            <View className="mx-4 flex justify-around flex-1 mb-2">
              {/* location */}
              <Text className="text-white text-center text-3xl font-bold">
                {location?.name},
                <Text className="text-lg font-semibold text-gray-300">
                  {" " + location?.country}
                </Text>
              </Text>
              {/* Weather Image */}
              <View className="flex-row justify-center">
                <Image
                  source={
                    weatherImages[current?.condition?.text] || {
                      uri: "https:" + current?.condition?.icon,
                    }
                  }
                  className="w-52 h-52"
                />
              </View>
              {/* Degree Celsius Display */}
              <View className="space-y-2">
                <Text className="text-center text-white text-6xl font-bold ml-5">
                  {current?.temp_c}&#176;
                </Text>
                <Text className="text-center text-white text-xl tracking-widest">
                  {current?.condition.text}
                </Text>
              </View>
              {/* Other stats */}
              <View className="flex-row justify-between mx-6">
                <View className="flex-row items-center gap-2">
                  <Image
                    source={require("../assets/icons/wind.png")}
                    className="size-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {current?.wind_kph}km
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Image
                    source={require("../assets/icons/drop.png")}
                    className="size-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {current?.humidity}%
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Image
                    source={require("../assets/icons/sun.png")}
                    className="size-6"
                  />
                  <Text className="text-white font-semibold text-base">
                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                  </Text>
                </View>
              </View>
            </View>

            {/* Forecast for next days */}
            <View className="mb-2 gap-3">
              <View className="flex-row items-center gap-2 mx-5">
                <CalendarDaysIcon size={23} color={"white"} />
                <Text className="text-white text-lg font-semibold">
                  Daily Forecast
                </Text>
              </View>

              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 15 }}
                showsHorizontalScrollIndicator={false}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item?.date);
                  let options = { weekday: "long" };
                  let dayName = date.toLocaleDateString("en-US", options);
                  dayName = dayName.split(",")[0];
                  return (
                    <View
                      key={index}
                      className="flex justify-center items-center w-32 rounded-3xl py-3 mr-4 gap-2"
                      style={{ backgroundColor: theme.bgWhite(0.15) }}
                    >
                      <Image
                        source={
                          weatherImages[item?.day?.condition?.text] || {
                            uri: "https:" + item?.day?.condition?.icon,
                          }
                        }
                        className="size-11"
                      />
                      <Text className="text-white">{dayName}</Text>
                      <Text className="text-white text-xl font-semibold">
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        )}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
