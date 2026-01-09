import pandas as pd
import geopandas as gpd
import folium
from folium.plugins import MarkerCluster
import re

# Function to clean assembly name by removing bracketed text like (SC), (ST)
def clean_ac_name(ac_name):
    return re.sub(r"\s*\(.*?\)", "", str(ac_name)).strip()

# Step 1: Load Assembly GeoJSON polygon data
wards_gdf = gpd.read_file('F:\SIH\client\TamilWards\TAMIL NADU_ASSEMBLY.geojson')  # Your geometry file

# Step 2: Load the safety score Excel and make points GeoDataFrame
df = pd.read_excel('F:\SIH\client\TamilWards\tn_enhanced_safety_analysis_20250915_122616.xlsx')
points_gdf = gpd.GeoDataFrame(
    df,
    geometry=gpd.points_from_xy(df['Longitude'], df['Latitude']),
    crs=wards_gdf.crs
)

# Step 3: Merge Safety_Zone info to polygons based on DIST_NAME and AC_NAME
wards_gdf = wards_gdf.merge(
    df[['DIST_NAME', 'AC_NAME', 'Safety_Zone', 'Zone_Color']],
    on=['DIST_NAME', 'AC_NAME'],
    how='left'
)

# Step 4: Define color mapping function returning fill and border colors
def zone_color(zone):
    if pd.isna(zone):
        return ('#b7fbb7', '#67b267')  # Light green fill, darker green border
    elif zone == "Safe Zone":
        return ('#ffff99', '#999933')  # Light yellow fill, darker yellow border
    elif zone == "Moderate Zone":
        return ('#ffcc66', '#cc9933')  # Light orange fill, darker orange border
    else:
        return ('#ff6666', '#cc3333')  # Light red fill, darker red border

# Step 5: Initialize map centered over Tamil Nadu with zoom restrictions
tamilnadu_map = folium.Map(
    location=[11.1271, 78.6569],
    zoom_start=7,
    min_zoom=7,
    max_zoom=12
)

# Step 6: Add colored polygons with tooltips for each assembly area (cleaned names)
for _, row in wards_gdf.iterrows():
    ac_name = clean_ac_name(row.get('AC_NAME', '--'))
    dist_name = row.get('DIST_NAME', '--')
    fill_color, border_color = zone_color(row['Safety_Zone'])
    tooltip = f"{dist_name}<br>{ac_name}<br>Safety Zone: {row['Safety_Zone']}"
    folium.GeoJson(
        row['geometry'],
        style_function=lambda feature, fill_color=fill_color, border_color=border_color: {
            'fillColor': fill_color,
            'color': border_color,
            'weight': 1,
            'fillOpacity': 0.75
        },
        highlight_function=lambda x: {'weight': 3, 'color': 'blue'},
        tooltip=tooltip
    ).add_to(tamilnadu_map)

# Step 7: Add clustered markers for each point with cleaned tooltips
marker_cluster = MarkerCluster().add_to(tamilnadu_map)
for _, row in df.iterrows():
    clean_name = clean_ac_name(row['AC_NAME'])
    folium.Marker(
        location=[row['Latitude'], row['Longitude']],
        tooltip=f"{clean_name} ({row['DIST_NAME']}): {row['Safety_Zone']}"
    ).add_to(marker_cluster)

# Step 8: Compute Tamil Nadu bounds and restrict map to those bounds
bounds = wards_gdf.total_bounds  # [minx, miny, maxx, maxy]
sw = [bounds[1], bounds[0]]  # Southwest corner (min lat, min lon)
ne = [bounds[3], bounds[2]]  # Northeast corner (max lat, max lon)

tamilnadu_map.fit_bounds([sw, ne])  # Auto-zoom to Tamil Nadu bounds
tamilnadu_map.options['maxBounds'] = [sw, ne]  # Restrict panning outside Tamil Nadu

# Step 9: Save the map to HTML
tamilnadu_map.save("tamilnadu_safety_zone_choropleth.html")
print("Map saved as 'tamilnadu_safety_zone_choropleth.html'")
