import streamlit as st
import pandas as pd
import pydeck as pdk


@st.cache_data
def load_data():
    """Loads the trip data from the CSV file."""
    path = "/Users/sansunda/Documents/Code/github/trip-visualizer/trips_data.csv"
    df = pd.read_csv(path)

    # Convert time columns to datetime objects, coercing errors
    time_cols = ['request_time', 'begin_trip_time', 'dropoff_time']
    for col in time_cols:
        df[col] = pd.to_datetime(df[col], errors='coerce')

    # Drop rows where essential location data is missing for visualization
    df.dropna(subset=['begintrip_lat', 'begintrip_lng', 'dropoff_lat', 'dropoff_lng'], inplace=True)
    return df


st.set_page_config(layout="wide")
st.title("Trip Visualizer")

df = load_data()

st.header("Rides from Top Cities")

# --- Top Cities Section ---

# Calculate top cities by trip count
top_cities = df['city'].value_counts().nlargest(5)

st.subheader("Top 5 Cities by Number of Trips")
st.bar_chart(top_cities)

st.write("Here is the breakdown of trips per city:")
st.dataframe(top_cities)

# Add a selector for the top cities
selected_city = st.selectbox("Select a city to view its rides", top_cities.index)

if selected_city:
    city_rides = df[df['city'] == selected_city]
    st.subheader(f"Displaying {len(city_rides)} rides for {selected_city}")

    # Display rides in a table
    st.dataframe(city_rides[['product_type', 'status', 'distance', 'fare_amount', 'request_time']].head(100))

    # Display rides on a map
    st.pydeck_chart(pdk.Deck(
        map_style='mapbox://styles/mapbox/light-v9',
        initial_view_state=pdk.ViewState(
            latitude=city_rides['begintrip_lat'].mean(),
            longitude=city_rides['begintrip_lng'].mean(),
            zoom=10,
            pitch=50,
        ),
        layers=[
            pdk.Layer(
                'ArcLayer',
                data=city_rides,
                get_source_position='[begintrip_lng, begintrip_lat]',
                get_target_position='[dropoff_lng, dropoff_lat]',
                get_source_color='[200, 30, 0, 160]',
                get_target_color='[0, 100, 200, 160]',
                auto_highlight=True,
                width_scale=0.0001,
                get_width="fare_amount",
                width_min_pixels=3,
                width_max_pixels=30,
            ),
        ],
    ))
