"""
AstraConvoy Backend - AI Defence Transport & Threat Intelligence System
Flask API with simulated AI modules for convoy management
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import json
import math
import random
import hashlib

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = 'astraconvoy.db'

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Convoys table
    c.execute('''CREATE TABLE IF NOT EXISTS convoys
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy_name TEXT NOT NULL,
                  start_point TEXT NOT NULL,
                  destination TEXT NOT NULL,
                  mission_type TEXT NOT NULL,
                  load_weight REAL,
                  num_vehicles INTEGER,
                  priority_score INTEGER,
                  status TEXT DEFAULT 'active',
                  threat_level REAL,
                  route_data TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  eta TEXT,
                  current_position TEXT)''')
    
    # Alerts table
    c.execute('''CREATE TABLE IF NOT EXISTS alerts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy_id INTEGER,
                  alert_type TEXT NOT NULL,
                  severity TEXT NOT NULL,
                  message TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  resolved BOOLEAN DEFAULT 0,
                  FOREIGN KEY (convoy_id) REFERENCES convoys(id))''')
    
    # V2V Messages table
    c.execute('''CREATE TABLE IF NOT EXISTS v2v_messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  from_convoy_id INTEGER,
                  to_convoy_id INTEGER,
                  message TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (from_convoy_id) REFERENCES convoys(id),
                  FOREIGN KEY (to_convoy_id) REFERENCES convoys(id))''')
    
    # Route conflicts table
    c.execute('''CREATE TABLE IF NOT EXISTS route_conflicts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy1_id INTEGER,
                  convoy2_id INTEGER,
                  conflict_point TEXT NOT NULL,
                  conflict_time TEXT NOT NULL,
                  resolved BOOLEAN DEFAULT 0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (convoy1_id) REFERENCES convoys(id),
                  FOREIGN KEY (convoy2_id) REFERENCES convoys(id))''')
    
    # SMS notifications table
    c.execute('''CREATE TABLE IF NOT EXISTS sms_notifications
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy_id INTEGER,
                  phone_number TEXT,
                  message TEXT NOT NULL,
                  notification_type TEXT NOT NULL,
                  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  status TEXT DEFAULT 'sent',
                  FOREIGN KEY (convoy_id) REFERENCES convoys(id))''')
    
    # Driver access codes table
    c.execute('''CREATE TABLE IF NOT EXISTS driver_access
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy_id INTEGER,
                  access_code TEXT NOT NULL,
                  driver_name TEXT,
                  phone_number TEXT,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (convoy_id) REFERENCES convoys(id))''')
    
    # Tactical Messages table
    c.execute('''CREATE TABLE IF NOT EXISTS tactical_messages
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  convoy_id TEXT NOT NULL,
                  sender TEXT NOT NULL,
                  content TEXT NOT NULL,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# =============================================
# MODULE 1: CONVOY ROUTE OPTIMIZATION ENGINE
# =============================================

# Major Indian cities with coordinates (latitude, longitude)
INDIAN_CITIES = {
    # North India
    'Delhi': (28.6139, 77.2090),
    'Delhi Cantonment': (28.5833, 77.1500),
    'New Delhi': (28.6139, 77.2090),
    'Jammu': (32.7266, 74.8570),
    'Katra': (32.9918, 74.9320),
    'Srinagar': (34.0837, 74.7973),
    'Ladakh': (34.1526, 77.5771),
    'Ladakh Base': (34.1526, 77.5771),
    'Leh': (34.1642, 77.5846),
    'Chandigarh': (30.7333, 76.7794),
    'Amritsar': (31.6340, 74.8723),
    'Pathankot': (32.2746, 75.6521),
    
    # Central India
    'Bhopal': (23.2599, 77.4126),
    'Indore': (22.7196, 75.8577),
    'Jabalpur': (23.1815, 79.9864),
    'Raipur': (21.2514, 81.6296),
    'Nagpur': (21.1458, 79.0882),
    
    # East India
    'Kolkata': (22.5726, 88.3639),
    'Patna': (25.5941, 85.1376),
    'Ranchi': (23.3441, 85.3096),
    'Guwahati': (26.1445, 91.7362),
    'Siliguri': (26.7271, 88.3953),
    
    # West India
    'Mumbai': (19.0760, 72.8777),
    'Pune': (18.5204, 73.8567),
    'Ahmedabad': (23.0225, 72.5714),
    'Jaipur': (26.9124, 75.7873),
    'Udaipur': (24.5854, 73.7125),
    'Jodhpur': (26.2389, 73.0243),
    
    # South India
    'Bangalore': (12.9716, 77.5946),
    'Chennai': (13.0827, 80.2707),
    'Hyderabad': (17.3850, 78.4867),
    'Coimbatore': (11.0168, 76.9558),
    'Kochi': (9.9312, 76.2673),
    'Trivandrum': (8.5241, 76.9366),
    'Visakhapatnam': (17.6868, 83.2185),
    
    # Strategic Locations
    'Siachen Base': (35.4215, 77.1025),
    'Kargil': (34.5539, 76.1313),
    'Drass': (34.4255, 75.7577),
    'Tawang': (27.5860, 91.8590),
    'Arunachal': (28.2180, 94.7278),
    'Itanagar': (27.1021, 93.6922),
    
    # Border Areas
    'Jaisalmer': (26.9157, 70.9083),
    'Barmer': (25.7521, 71.3967),
    'Bikaner': (28.0229, 73.3119),
    'Ganganagar': (29.9039, 73.8772),
    
    # More Indian Cities
    'Lucknow': (26.8467, 80.9462),
    'Kanpur': (26.4499, 80.3319),
    'Agra': (27.1767, 78.0081),
    'Varanasi': (25.3176, 82.9739),
    'Meerut': (28.9845, 77.7064),
    'Ghaziabad': (28.6692, 77.4538),
    'Noida': (28.5355, 77.3910),
    'Gurgaon': (28.4595, 77.0266),
    'Faridabad': (28.4089, 77.3178),
    'Ludhiana': (30.9010, 75.8573),
    'Jalandhar': (31.3260, 75.5762),
    'Kota': (25.2138, 75.8648),
    'Rajkot': (22.3039, 70.8022),
    'Surat': (21.1702, 72.8311),
    'Vadodara': (22.3072, 73.1812),
    'Nashik': (19.9975, 73.7898),
    'Aurangabad': (19.8762, 75.3433),
    'Mysore': (12.2958, 76.6394),
    'Madurai': (9.9252, 78.1198),
    'Vijayawada': (16.5062, 80.6480),
    'Guntur': (16.3067, 80.4365),
    'Warangal': (17.9689, 79.5941),
    'Hubli': (15.3647, 75.1240),
    'Salem': (11.6643, 78.1460),
    'Tiruchirappalli': (10.7905, 78.7047),
}

def calculate_distance(start, dest):
    """Calculate real distance using Haversine formula"""
    
    # Normalize city names (case-insensitive, strip whitespace)
    start = start.strip()
    dest = dest.strip()
    
    # Try to find coordinates
    start_coords = None
    dest_coords = None
    
    # Exact match
    if start in INDIAN_CITIES:
        start_coords = INDIAN_CITIES[start]
    else:
        # Fuzzy match - check if any city name contains the input
        for city, coords in INDIAN_CITIES.items():
            if start.lower() in city.lower() or city.lower() in start.lower():
                start_coords = coords
                break
    
    if dest in INDIAN_CITIES:
        dest_coords = INDIAN_CITIES[dest]
    else:
        # Fuzzy match
        for city, coords in INDIAN_CITIES.items():
            if dest.lower() in city.lower() or city.lower() in dest.lower():
                dest_coords = coords
                break
    
    # If coordinates not found, use default estimation based on string hash
    if not start_coords or not dest_coords:
        # Fallback to hash-based distance (but make it realistic: 200-2000 km)
        hash_val = int(hashlib.md5(f"{start}{dest}".encode()).hexdigest(), 16)
        return 200 + (hash_val % 1800)  # 200-2000 km range
    
    # Haversine formula for great circle distance
    lat1, lon1 = start_coords
    lat2, lon2 = dest_coords
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Earth's radius in kilometers
    radius = 6371
    
    straight_line_distance = radius * c
    
    # Apply road factor to convert straight-line to actual road distance
    # Road distances are longer due to terrain, curves, avoiding obstacles
    # Factor varies by terrain type and distance
    
    # Estimate road factor based on cities involved
    # Mountainous routes (Ladakh, Siachen, Himalayan regions) = 1.4-1.5x
    # Hilly routes = 1.3-1.35x  
    # Plain routes = 1.2-1.25x
    
    mountainous_cities = ['Ladakh', 'Siachen', 'Kargil', 'Drass', 'Leh', 'Srinagar', 
                          'Tawang', 'Arunachal', 'Itanagar', 'Katra', 'Jammu']
    
    hilly_cities = ['Shimla', 'Mussoorie', 'Dehradun', 'Nainital', 'Darjeeling',
                   'Siliguri', 'Gangtok', 'Shillong', 'Guwahati']
    
    # Check if route involves mountainous terrain
    is_mountainous = False
    for city in mountainous_cities:
        if (city.lower() in start.lower() or start.lower() in city.lower() or
            city.lower() in dest.lower() or dest.lower() in city.lower()):
            is_mountainous = True
            break
    
    # Check if route involves hilly terrain
    is_hilly = False
    if not is_mountainous:
        for city in hilly_cities:
            if (city.lower() in start.lower() or start.lower() in city.lower() or
                city.lower() in dest.lower() or dest.lower() in city.lower()):
                is_hilly = True
                break
    
    # Apply appropriate road factor (calibrated for Indian highways)
    if is_mountainous:
        road_factor = 1.32  # Mountainous terrain adds 32% to distance (previously 1.35)
    elif is_hilly:
        road_factor = 1.28  # Hilly terrain adds 28% to distance (previously 1.32)
    else:
        # For longer distances, road factor is higher due to more curves
        if straight_line_distance > 1500:
            road_factor = 1.20  # Long distance routes (previously 1.35)
        elif straight_line_distance > 800:
            road_factor = 1.18  # Medium distance (previously 1.30)
        else:
            road_factor = 1.15  # Short distance (previously 1.25)
    
    # Calculate actual road distance
    road_distance = straight_line_distance * road_factor
    
    return round(road_distance)


def calculate_route_score(terrain, weather, traffic, road_type):
    """Calculate route optimization score"""
    terrain_scores = {'plain': 10, 'hilly': 7, 'mountain': 4, 'forest': 6}
    weather_scores = {'clear': 10, 'cloudy': 8, 'rainy': 5, 'foggy': 4, 'stormy': 2}
    traffic_scores = {'low': 10, 'medium': 6, 'high': 3}
    road_scores = {'highway': 10, 'state_road': 7, 'rural': 5, 'unpaved': 3}
    
    score = (terrain_scores.get(terrain, 5) * 0.25 +
             weather_scores.get(weather, 5) * 0.30 +
             traffic_scores.get(traffic, 5) * 0.25 +
             road_scores.get(road_type, 5) * 0.20)
    
    return score

def optimize_route(start_point, destination, mission_type, load, num_vehicles):
    """Generate optimized routes with backup"""
    distance = calculate_distance(start_point, destination)
    
    # Generate multiple route options
    routes = []
    
    # Function to get coordinates for waypoints
    def get_coords(waypoint_list):
        coords_list = []
        for wp in waypoint_list:
            # Try to find coordinates for the waypoint
            found = False
            for city, coords in INDIAN_CITIES.items():
                if wp.lower() in city.lower() or city.lower() in wp.lower():
                    coords_list.append({'name': wp, 'lat': coords[0], 'lon': coords[1]})
                    found = True
                    break
            if not found:
                # Fallback to random offset near the start/dest if unknown
                coords_list.append({'name': wp, 'lat': 0, 'lon': 0})
        return coords_list

    # Route 1: Fastest (Highway)
    route1_waypoints = [start_point, f"Checkpoint-{random.randint(10,99)}", f"Bridge-{random.randint(100,999)}", destination]
    route1 = {
        'route_name': 'Highway Route (Recommended)',
        'distance_km': distance,
        'eta_hours': distance / 60,
        'terrain': 'plain',
        'weather': 'clear',
        'traffic': 'medium',
        'road_type': 'highway',
        'waypoints': route1_waypoints,
        'waypoint_coords': get_coords(route1_waypoints)
    }
    
    # Route 2: Backup (State Road)
    route2_waypoints = [start_point, "Rural-Crossing", "Forest-Path", destination]
    route2 = {
        'route_name': 'Secondary Route (Backup)',
        'distance_km': round(distance * 1.15),
        'eta_hours': (distance * 1.15) / 45,
        'terrain': 'hilly',
        'weather': 'cloudy',
        'traffic': 'low',
        'road_type': 'state_road',
        'waypoints': route2_waypoints,
        'waypoint_coords': get_coords(route2_waypoints)
    }
    
    # Route 3: Emergency (Rural/Unpaved)
    route3_waypoints = [start_point, "Border-Track", "Hill-Pass", destination]
    route3 = {
        'route_name': 'Emergency Route (High Stealth)',
        'distance_km': round(distance * 1.30),
        'eta_hours': (distance * 1.30) / 35,
        'terrain': 'mountain',
        'weather': 'rainy',
        'traffic': 'low',
        'road_type': 'rural',
        'waypoints': route3_waypoints,
        'waypoint_coords': get_coords(route3_waypoints)
    }

    route1['score'] = calculate_route_score(route1['terrain'], route1['weather'], 
                                            route1['traffic'], route1['road_type'])
    routes.append(route1)
    
    # Route 2: Backup (State Road)
    route2 = {
        'route_name': 'State Road (Backup)',
        'distance_km': distance * 1.15,
        'terrain': random.choice(['plain', 'hilly']),
        'weather': random.choice(['clear', 'cloudy']),
        'traffic': random.choice(['medium', 'high']),
        'road_type': 'state_road',
        'waypoints': [start_point, f"{start_point}-Town-A", f"StateRoad-{destination}", destination]
    }
    route2['score'] = calculate_route_score(route2['terrain'], route2['weather'], 
                                            route2['traffic'], route2['road_type'])
    route2['eta_hours'] = (distance * 1.15) / 45  # Avg 45 km/h
    routes.append(route2)
    
    # Route 3: Alternative (Rural)
    route3 = {
        'route_name': 'Rural Route (Emergency)',
        'distance_km': distance * 1.3,
        'terrain': random.choice(['forest', 'hilly']),
        'weather': random.choice(['clear', 'foggy']),
        'traffic': 'low',
        'road_type': 'rural',
        'waypoints': [start_point, f"{start_point}-Village-X", f"Rural-{destination}", destination]
    }
    route3['score'] = calculate_route_score(route3['terrain'], route3['weather'], 
                                            route3['traffic'], route3['road_type'])
    route3['eta_hours'] = (distance * 1.3) / 35  # Avg 35 km/h
    routes.append(route3)
    
    # Sort by score (descending)
    routes.sort(key=lambda x: x['score'], reverse=True)
    
    return {
        'recommended_route': routes[0],
        'backup_route': routes[1],
        'emergency_route': routes[2],
        'all_routes': routes
    }

# =============================================
# MODULE 2: AI THREAT & VULNERABILITY PREDICTION
# =============================================

def calculate_threat_score(route_data, mission_type, is_night=False):
    """Calculate comprehensive threat score (1-10)"""
    threat_score = 0
    factors = {}
    
    # Terrain risk
    terrain_risk = {
        'plain': 1,
        'hilly': 3,
        'mountain': 6,
        'forest': 5
    }
    factors['terrain_risk'] = terrain_risk.get(route_data['terrain'], 3)
    threat_score += factors['terrain_risk']
    
    # Weather severity
    weather_risk = {
        'clear': 0.5,
        'cloudy': 1,
        'rainy': 3,
        'foggy': 4,
        'stormy': 6
    }
    factors['weather_severity'] = weather_risk.get(route_data['weather'], 2)
    threat_score += factors['weather_severity']
    
    # Isolation level (inverse of traffic)
    isolation_map = {'low': 0.5, 'medium': 1.5, 'high': 0.8}
    factors['isolation_level'] = isolation_map.get(route_data['traffic'], 1)
    threat_score += factors['isolation_level']
    
    # Road type risk
    road_risk = {'highway': 0.5, 'state_road': 1.5, 'rural': 3, 'unpaved': 4}
    factors['road_risk'] = road_risk.get(route_data['road_type'], 2)
    threat_score += factors['road_risk']
    
    # Historical accident risk (simulated)
    distance = route_data['distance_km']
    factors['historical_risk'] = min(distance / 200, 2)  # Max 2 points
    threat_score += factors['historical_risk']
    
    # Night-time movement risk
    if is_night:
        factors['night_risk'] = 2
        threat_score += factors['night_risk']
    else:
        factors['night_risk'] = 0
    
    # Mission criticality bonus (higher priority = more threat exposure)
    mission_multiplier = {
        'medical': 1.2,
        'ammunition': 1.3,
        'fuel': 1.15,
        'supplies': 1.0,
        'routine': 0.9
    }
    threat_score *= mission_multiplier.get(mission_type.lower(), 1.0)
    
    # Normalize to 1-10
    threat_score = min(max(threat_score, 1), 10)
    
    return {
        'threat_score': round(threat_score, 1),
        'factors': factors,
        'recommendation': get_threat_recommendation(threat_score)
    }

def get_threat_recommendation(threat_score):
    """Get recommendation based on threat score"""
    if threat_score >= 8:
        return "CRITICAL: High danger. Immediate reroute recommended. Request armed escort."
    elif threat_score >= 6:
        return "HIGH: Significant risk detected. Consider alternative route or delay."
    elif threat_score >= 4:
        return "MODERATE: Monitor closely. Prepare contingency plans."
    elif threat_score >= 2:
        return "LOW: Normal precautions advised. Proceed as planned."
    else:
        return "MINIMAL: Safe to proceed. Routine monitoring sufficient."

# =============================================
# MODULE 3: MISSION PRIORITY ENGINE
# =============================================

def calculate_priority_score(mission_type, urgency='normal'):
    """Calculate mission priority score"""
    base_priorities = {
        'medical': 10,
        'ammunition': 9,
        'fuel': 8,
        'supplies': 6,
        'food': 6,
        'routine': 4,
        'equipment': 5,
        'personnel': 7
    }
    
    urgency_multiplier = {
        'critical': 1.5,
        'high': 1.2,
        'normal': 1.0,
        'low': 0.8
    }
    
    base_score = base_priorities.get(mission_type.lower(), 5)
    multiplier = urgency_multiplier.get(urgency.lower(), 1.0)
    
    final_score = min(int(base_score * multiplier), 10)
    
    return {
        'priority_score': final_score,
        'mission_type': mission_type,
        'urgency': urgency,
        'priority_level': get_priority_level(final_score)
    }

def get_priority_level(score):
    """Get priority level name"""
    if score >= 9:
        return "CRITICAL"
    elif score >= 7:
        return "HIGH"
    elif score >= 5:
        return "MEDIUM"
    else:
        return "LOW"

# =============================================
# MODULE 4: FLEET LOAD OPTIMIZATION
# =============================================

def optimize_fleet(total_load, max_vehicle_capacity=10):
    """Optimize fleet size and load distribution"""
    num_vehicles_needed = math.ceil(total_load / max_vehicle_capacity)
    
    # Calculate even distribution
    base_load = total_load / num_vehicles_needed
    vehicles = []
    
    for i in range(num_vehicles_needed):
        vehicles.append({
            'vehicle_id': f"V-{i+1:03d}",
            'load_tons': round(base_load, 2),
            'capacity_utilization': round((base_load / max_vehicle_capacity) * 100, 1)
        })
    
    # Fuel calculation (simulated)
    distance_estimate = 250  # Average km
    fuel_per_km = 0.4  # liters per km per ton
    total_fuel = total_load * fuel_per_km * distance_estimate
    
    # Efficiency suggestions
    suggestions = []
    if num_vehicles_needed > 1 and (total_load / num_vehicles_needed) < max_vehicle_capacity * 0.7:
        suggestions.append("Consider consolidating loads to reduce vehicle count")
    
    if total_fuel > 1000:
        suggestions.append(f"High fuel consumption expected: {round(total_fuel)} liters. Optimize speed for efficiency.")
    
    return {
        'optimal_vehicles': num_vehicles_needed,
        'vehicle_distribution': vehicles,
        'estimated_fuel_liters': round(total_fuel),
        'average_utilization_percent': round((base_load / max_vehicle_capacity) * 100, 1),
        'suggestions': suggestions
    }

# =============================================
# MODULE 5:CONVOY CLIMATE IMPACT ADVISOR
# =============================================

def calculate_climate_impact(distance_km, num_vehicles, load_weight):
    """Calculate environmental impact and efficiency recommendations"""
    # Fuel consumption model
    base_consumption = 0.35  # liters per km per vehicle
    load_factor = 1 + (load_weight / (num_vehicles * 20))  # Increased consumption with load
    fuel_needed = distance_km * num_vehicles * base_consumption * load_factor
    
    # Carbon footprint (kg CO2)
    co2_per_liter = 2.68  # kg CO2 per liter diesel
    total_co2 = fuel_needed * co2_per_liter
    
    # Optimal speed calculation
    optimal_speed = 55  # km/h for best efficiency
    current_speed = 60
    
    # Efficiency recommendations
    speed_optimization_saving = 0
    if current_speed > optimal_speed:
        speed_optimization_saving = (current_speed - optimal_speed) * 0.02 * fuel_needed
    
    return {
        'fuel_consumption_liters': round(fuel_needed, 2),
        'co2_emissions_kg': round(total_co2, 2),
        'optimal_speed_kmh': optimal_speed,
        'potential_fuel_savings_liters': round(speed_optimization_saving, 2),
        'co2_reduction_potential_kg': round(speed_optimization_saving * co2_per_liter, 2),
        'efficiency_tips': [
            f"Maintain steady speed of {optimal_speed} km/h for optimal fuel efficiency",
            "Avoid sudden acceleration and braking",
            "Check tire pressure before departure",
            f"Estimated carbon footprint: {round(total_co2)} kg CO2"
        ]
    }

# =============================================
# API ENDPOINTS
# =============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'online', 'system': 'AstraConvoy', 'version': '1.0'})

@app.route('/api/convoy/create', methods=['POST'])
def create_convoy():
    """Create new convoy with route optimization and threat analysis"""
    data = request.json
    
    # Extract data
    convoy_name = data.get('convoy_name', f"CONVOY-{random.randint(1000, 9999)}")
    start_point = data.get('start_point')
    destination = data.get('destination')
    mission_type = data.get('mission_type')
    load_weight = float(data.get('load_weight', 0))
    num_vehicles = int(data.get('num_vehicles', 1))
    urgency = data.get('urgency', 'normal')
    is_night = data.get('is_night', False)
    
    # Module 1: Route Optimization
    route_optimization = optimize_route(start_point, destination, mission_type, load_weight, num_vehicles)
    recommended_route = route_optimization['recommended_route']
    
    # Module 2: Threat Analysis
    threat_analysis = calculate_threat_score(recommended_route, mission_type, is_night)
    
    # Module 3: Priority Calculation
    priority_data = calculate_priority_score(mission_type, urgency)
    
    # Module 4: Fleet Optimization
    fleet_optimization = optimize_fleet(load_weight)
    
    # Module 5: Climate Impact
    climate_impact = calculate_climate_impact(
        recommended_route['distance_km'],
        num_vehicles,
        load_weight
    )
    
    # Store in database
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''INSERT INTO convoys 
                 (convoy_name, start_point, destination, mission_type, load_weight, 
                  num_vehicles, priority_score, threat_level, route_data, eta, current_position)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (convoy_name, start_point, destination, mission_type, load_weight,
               num_vehicles, priority_data['priority_score'], threat_analysis['threat_score'],
               json.dumps(route_optimization), 
               f"{recommended_route['eta_hours']:.1f} hours",
               start_point))
    convoy_id = c.lastrowid
    
    # Create alert if threat is high
    if threat_analysis['threat_score'] >= 6:
        c.execute('''INSERT INTO alerts (convoy_id, alert_type, severity, message)
                     VALUES (?, ?, ?, ?)''',
                  (convoy_id, 'threat', 'high', threat_analysis['recommendation']))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'convoy_id': convoy_id,
        'convoy_name': convoy_name,
        'route_optimization': route_optimization,
        'threat_analysis': threat_analysis,
        'priority': priority_data,
        'fleet_optimization': fleet_optimization,
        'climate_impact': climate_impact,
        'eta': f"{recommended_route['eta_hours']:.1f} hours"
    })

@app.route('/api/convoy/list', methods=['GET'])
def list_convoys():
    """Get all active convoys"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('''SELECT * FROM convoys WHERE status = 'active' ORDER BY created_at DESC''')
    convoys = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({'convoys': convoys})

@app.route('/api/convoy/<int:convoy_id>', methods=['GET'])
def get_convoy(convoy_id):
    """Get specific convoy details"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM convoys WHERE id = ?', (convoy_id,))
    convoy = c.fetchone()
    
    if convoy:
        convoy_dict = dict(convoy)
        if convoy_dict['route_data']:
            convoy_dict['route_data'] = json.loads(convoy_dict['route_data'])
        
        # Get alerts for this convoy
        c.execute('SELECT * FROM alerts WHERE convoy_id = ? ORDER BY created_at DESC', (convoy_id,))
        alerts = [dict(row) for row in c.fetchall()]
        convoy_dict['alerts'] = alerts
        
        conn.close()
        return jsonify(convoy_dict)
    
    conn.close()
    return jsonify({'error': 'Convoy not found'}), 404


@app.route('/api/emergency/trigger', methods=['POST'])
def trigger_emergency():
    """Trigger emergency SOS for a convoy with automatic rerouting"""
    data = request.json
    convoy_id = data.get('convoy_id')
    emergency_type = data.get('type', 'breakdown')  # breakdown, accident, attack
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get convoy details
    c.execute('SELECT * FROM convoys WHERE id = ?', (convoy_id,))
    convoy = dict(c.fetchone())
    
    # Create emergency alert
    messages = {
        'breakdown': 'EMERGENCY: Vehicle breakdown detected. Convoy stationary for extended period.',
        'accident': 'CRITICAL: Accident detected. Immediate assistance required.',
        'attack': 'CRITICAL ALERT: Security threat detected. Emergency response initiated.'
    }
    
    emergency_message = messages.get(emergency_type, 'Emergency detected')
    
    c.execute('''INSERT INTO alerts (convoy_id, alert_type, severity, message)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, 'emergency', 'critical', emergency_message))
    
    # Update convoy status
    c.execute('UPDATE convoys SET status = ? WHERE id = ?', ('emergency', convoy_id))
    
    # Generate alternative routes for rerouting
    alternative_routes = None
    if convoy['route_data']:
        route_data = json.loads(convoy['route_data'])
        # Get backup and emergency routes
        alternative_routes = {
            'backup_route': route_data.get('backup_route'),
            'emergency_route': route_data.get('emergency_route'),
            'accident_location': convoy.get('current_position', 'Unknown')
        }
    
    # Send SMS notifications to drivers
    sms_message = f"⚠️ EMERGENCY ALERT: {emergency_message} Alternative routes available. Check your route display."
    c.execute('''INSERT INTO sms_notifications (convoy_id, phone_number, message, notification_type)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, 'driver_phone', sms_message, 'emergency'))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Emergency SOS triggered',
        'actions_taken': [
            'Alert sent to command center',
            'Nearest checkpoint notified',
            'SMS sent to convoy drivers',
            'Alternative routes generated',
            'Other convoys rerouted',
            'Emergency response team dispatched'
        ],
        'alternative_routes': alternative_routes
    })

@app.route('/api/conflicts/check', methods=['POST'])
def check_conflicts():
    """Check for route conflicts between convoys"""
    # Get all active convoys
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM convoys WHERE status = "active"')
    convoys = [dict(row) for row in c.fetchall()]
    
    conflicts = []
    
    # Check for conflicts (simplified - checking if routes overlap)
    for i in range(len(convoys)):
        for j in range(i + 1, len(convoys)):
            convoy1 = convoys[i]
            convoy2 = convoys[j]
            
            # Parse route data
            if convoy1['route_data'] and convoy2['route_data']:
                route1 = json.loads(convoy1['route_data'])
                route2 = json.loads(convoy2['route_data'])
                
                # Simple conflict detection: same destination or overlapping waypoints
                if convoy1['destination'] == convoy2['destination']:
                    conflicts.append({
                        'convoy1': convoy1['convoy_name'],
                        'convoy2': convoy2['convoy_name'],
                        'conflict_point': convoy1['destination'],
                        'severity': 'medium',
                        'recommendation': 'Adjust departure times by 30 minutes'
                    })
    
    conn.close()
    
    return jsonify({
        'conflicts_detected': len(conflicts),
        'conflicts': conflicts
    })

@app.route('/api/v2v/send', methods=['POST'])
def send_v2v_message():
    """Send V2V (vehicle-to-vehicle) message"""
    data = request.json
    from_convoy = data.get('from_convoy_id')
    to_convoy = data.get('to_convoy_id', None)  # None = broadcast
    message = data.get('message')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute('''INSERT INTO v2v_messages (from_convoy_id, to_convoy_id, message)
                 VALUES (?, ?, ?)''', (from_convoy, to_convoy, message))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'V2V message sent'})



# =============================================
# NEW: DRIVER INTERFACE & SMS ENDPOINTS
# =============================================

@app.route('/api/driver/login', methods=['POST'])
def driver_login():
    """Driver login with convoy access code - accepts any valid pattern DRV-XXXX-ConvoyID"""
    data = request.json
    access_code = data.get('access_code', '').strip()
    
    # Validate access code format: DRV-XXXX-Y (where X is any digit, Y is convoy ID)
    import re
    pattern = r'^DRV-\d{4}-(\d+)$'
    match = re.match(pattern, access_code)
    
    if not match:
        return jsonify({'success': False, 'error': 'Invalid access code format. Use: DRV-XXXX-ConvoyID'}), 401
    
    # Extract convoy ID from access code
    convoy_id = int(match.group(1))
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Check if convoy exists
    c.execute('SELECT * FROM convoys WHERE id = ?', (convoy_id,))
    convoy = c.fetchone()
    
    if not convoy:
        conn.close()
        return jsonify({'success': False, 'error': f'Convoy ID {convoy_id} not found'}), 401
    
    # Build driver data response
    convoy_dict = dict(convoy)
    
    # Parse route data
    if convoy_dict['route_data']:
        convoy_dict['route_data'] = json.loads(convoy_dict['route_data'])
    
    # Create driver session data
    driver_dict = {
        'convoy_id': convoy_id,
        'convoy_name': convoy_dict['convoy_name'],
        'status': convoy_dict['status'],
        'route_data': convoy_dict['route_data'],
        'threat_level': convoy_dict['threat_level'],
        'eta': convoy_dict['eta'],
        'access_code': access_code,
        'driver_name': f'Driver (Convoy {convoy_id})',  # Generic driver name
        'start_point': convoy_dict['start_point'],
        'destination': convoy_dict['destination']
    }
    
    conn.close()
    
    return jsonify({'success': True, 'driver': driver_dict})

@app.route('/api/driver/convoy/<int:convoy_id>', methods=['GET'])
def get_driver_convoy_info(convoy_id):
    """Get convoy info for driver (simplified view)"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM convoys WHERE id = ?', (convoy_id,))
    convoy = c.fetchone()
    
    if convoy:
        convoy_dict = dict(convoy)
        if convoy_dict['route_data']:
            convoy_dict['route_data'] = json.loads(convoy_dict['route_data'])
        
        # Get recent alerts
        c.execute('SELECT * FROM alerts WHERE convoy_id = ? AND resolved = 0 ORDER BY created_at DESC LIMIT 5', (convoy_id,))
        alerts = [dict(row) for row in c.fetchall()]
        convoy_dict['active_alerts'] = alerts
        
        conn.close()
        return jsonify(convoy_dict)
    
    conn.close()
    return jsonify({'error': 'Convoy not found'}), 404

@app.route('/api/driver/sos', methods=['POST'])
def driver_sos():
    """Driver triggers SOS from their device"""
    data = request.json
    convoy_id = data.get('convoy_id')
    location = data.get('location', 'Unknown')
    issue_type = data.get('issue_type', 'emergency')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    message = f"DRIVER SOS: Emergency reported at {location}. Type: {issue_type}"
    
    c.execute('''INSERT INTO alerts (convoy_id, alert_type, severity, message)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, 'driver_sos', 'critical', message))
    
    c.execute('UPDATE convoys SET status = ? WHERE id = ?', ('emergency', convoy_id))
    
    # Send SMS to command center
    c.execute('''INSERT INTO sms_notifications (convoy_id, phone_number, message, notification_type)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, 'command_center', f"DRIVER SOS from Convoy {convoy_id}: {message}", 'driver_sos'))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'SOS sent to command center',
        'response': 'Emergency team dispatched. Stay safe.'
    })

@app.route('/api/sms/send', methods=['POST'])
def send_sms():
    """Send SMS notification (simulated)"""
    data = request.json
    convoy_id = data.get('convoy_id')
    phone_number = data.get('phone_number')
    message = data.get('message')
    notification_type = data.get('type', 'general')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    c.execute('''INSERT INTO sms_notifications (convoy_id, phone_number, message, notification_type)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, phone_number, message, notification_type))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'SMS sent successfully (simulated)'})

@app.route('/api/sms/history', methods=['GET'])
def get_sms_history():
    """Get SMS notification history"""
    convoy_id = request.args.get('convoy_id', None)
    
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    if convoy_id:
        c.execute('SELECT * FROM sms_notifications WHERE convoy_id = ? ORDER BY sent_at DESC LIMIT 50', (convoy_id,))
    else:
        c.execute('SELECT * FROM sms_notifications ORDER BY sent_at DESC LIMIT 100')
    
    sms_list = [dict(row) for row in c.fetchall()]
    conn.close()
    
    return jsonify({'sms_history': sms_list})

@app.route('/api/driver/register', methods=['POST'])
def register_driver():
    """Register driver access code for a convoy"""
    data = request.json
    convoy_id = data.get('convoy_id')
    driver_name = data.get('call_sign') or data.get('driver_name') # Support both for anonymity
    phone_number = data.get('phone_number')
    
    # Generate access code
    access_code = f"DRV-{random.randint(1000, 9999)}-{convoy_id}"
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    c.execute('''INSERT INTO driver_access (convoy_id, access_code, driver_name, phone_number)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, access_code, driver_name, phone_number))
    
    # Send SMS with access code
    sms_message = f"Welcome {driver_name}! Your AstraConvoy access code: {access_code}. Use this to track your convoy."
    c.execute('''INSERT INTO sms_notifications (convoy_id, phone_number, message, notification_type)
                 VALUES (?, ?, ?, ?)''',
              (convoy_id, phone_number, sms_message, 'access_code'))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'access_code': access_code,
        'message': 'Driver registered successfully. SMS sent with access code.'
    })

@app.route('/api/driver/my-convoys', methods=['GET'])
def get_driver_convoys():
    """Get all convoys created by a specific unit (by call_sign/driver_name)"""
    driver_name = request.args.get('call_sign') or request.args.get('driver_name', '')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Find all convoy IDs linked to this driver name
    c.execute("""
        SELECT DISTINCT da.convoy_id 
        FROM driver_access da
        WHERE LOWER(da.driver_name) = LOWER(?)
    """, (driver_name,))
    convoy_ids = [str(row[0]) for row in c.fetchall()]
    
    if not convoy_ids:
        conn.close()
        return jsonify({'convoys': []})
    
    # Get full convoy info for all those IDs
    placeholders = ','.join('?' * len(convoy_ids))
    c.execute(f"""
        SELECT id, convoy_name, start_point, destination, mission_type, 
               num_vehicles, threat_level, status, eta
        FROM convoys 
        WHERE id IN ({placeholders})
        ORDER BY id DESC
    """, convoy_ids)
    
    rows = c.fetchall()
    conn.close()
    
    convoys = [{
        'id': r[0], 'convoy_name': r[1], 'start_point': r[2],
        'destination': r[3], 'mission_type': r[4], 'num_vehicles': r[5],
        'threat_level': r[6], 'status': r[7], 'eta': r[8]
    } for r in rows]
    
    return jsonify({'convoys': convoys})


# --- TACTICAL MESSAGING ---
@app.route('/api/messages/send', methods=['POST'])
def send_message():
    data = request.json
    convoy_id = str(data.get('convoy_id'))
    content = data.get('content')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    c.execute("INSERT INTO tactical_messages (convoy_id, sender, content) VALUES (?, ?, ?)",
              (convoy_id, 'COMMAND_CENTER', content))
    conn.commit()
    conn.close()
    
    print(f"TACTICAL MSG SAVED to {convoy_id}: {content}")
    return jsonify({'success': True})

@app.route('/api/messages/get/<convoy_id>', methods=['GET'])
def get_messages(convoy_id):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # ADVANCED TACTICAL MONITOR
    print(f"[TACTICAL] Incoming request from Unit: {convoy_id}")

    # Find the real ID
    official_id = convoy_id
    if len(str(convoy_id)) > 10:
        c.execute("SELECT id FROM convoys WHERE convoy_name LIKE ?", (f"%{convoy_id}%",))
        row = c.fetchone()
        if row:
            official_id = str(row[0])
            print(f"[HANDSHAKE] Temp ID {convoy_id} -> Official ID {official_id}")

    # Get messages for this specific unit OR global broadcasts
    c.execute("""SELECT content, timestamp FROM tactical_messages 
                 WHERE convoy_id = ? OR convoy_id = 'ALL' 
                 ORDER BY timestamp DESC""", (str(official_id),))
    rows = c.fetchall()
    conn.close()
    
    msgs = []
    for r in rows:
        content = r[0]
        raw_ts = str(r[1])
        # Safe time extraction: handles 'YYYY-MM-DD HH:MM:SS' or raw strings
        ts_display = raw_ts.split(' ')[1] if ' ' in raw_ts else raw_ts
        msgs.append({'content': content, 'timestamp': ts_display})
    
    return jsonify({'success': True, 'messages': msgs})

# --- COMMAND CENTER ANALYTICS ---
@app.route('/api/analytics/dashboard', methods=['GET'])
def get_dashboard_stats():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Get active convoys
    c.execute("SELECT COUNT(*) FROM convoys WHERE status = 'active'")
    total_active = c.fetchone()[0]
    
    # Get average threat level
    c.execute("SELECT AVG(threat_level) FROM convoys WHERE status = 'active'")
    avg_threat = c.fetchone()[0] or 0
    
    # Get high threat count
    c.execute("SELECT COUNT(*) FROM convoys WHERE status = 'active' AND threat_level >= 7")
    high_threat = c.fetchone()[0]
    
    # Get active emergencies
    c.execute("SELECT COUNT(*) FROM alerts WHERE severity = 'critical' AND resolved = 0")
    emergencies = c.fetchone()[0]
    
    conn.close()
    return jsonify({
        'total_active_convoys': total_active,
        'average_threat_level': round(avg_threat, 1),
        'high_threat_convoys': high_threat,
        'active_emergencies': emergencies,
        'system_status': 'operational'
    })

@app.route('/api/alerts', methods=['GET'])
def get_all_alerts():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('''SELECT a.*, c.convoy_name 
                 FROM alerts a 
                 JOIN convoys c ON a.convoy_id = c.id 
                 WHERE a.resolved = 0 
                 ORDER BY a.created_at DESC LIMIT 10''')
    alerts_list = [dict(row) for row in c.fetchall()]
    conn.close()
    return jsonify({'alerts': alerts_list})

@app.route('/api/v2v/messages', methods=['GET'])
def get_v2v_history():
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Get standard V2V messages
    c.execute("SELECT from_convoy_id, message, created_at FROM v2v_messages")
    v2v_rows = c.fetchall()
    
    # Get Tactical instructions
    c.execute("SELECT convoy_id, content, timestamp FROM tactical_messages")
    tactical_rows = c.fetchall()
    
    conn.close()
    
    combined = []
    for r in v2v_rows:
        combined.append({'from': f"UNIT-{r[0]}", 'message': r[1], 'time': r[2], 'type': 'V2V'})
    for r in tactical_rows:
        combined.append({'from': "HQ_COMMAND", 'message': f"TO UNIT-{r[0]}: {r[1]}", 'time': r[2], 'type': 'TAC'})
    
    # Sort by time descending
    combined.sort(key=lambda x: x['time'], reverse=True)
    
    return jsonify({'messages': combined[:20]})

@app.route('/api/driver/report', methods=['POST'])
def driver_report():
    data = request.json
    convoy_id = str(data.get('convoy_id'))
    message = data.get('message')
    
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    
    # Save as a special V2V message with 'REPORT' type
    c.execute("INSERT INTO v2v_messages (from_convoy_id, to_convoy_id, message) VALUES (?, ?, ?)",
              (convoy_id, 0, f"[SITREP] {message}"))
    
    # Also add as an alert for visibility
    c.execute("INSERT INTO alerts (convoy_id, alert_type, severity, message) VALUES (?, ?, ?, ?)",
              (convoy_id, 'report', 'medium', f"SITUATION REPORT: {message}"))
    
    conn.commit()
    conn.close()
    return jsonify({'success': True})
@app.route('/api/driver/convoy/<convoy_id>', methods=['GET'])
def get_driver_convoy(convoy_id):
    conn = sqlite3.connect(DATABASE)
    c = conn.cursor()
    # Try finding by ID first
    c.execute("SELECT * FROM convoys WHERE id = ?", (convoy_id,))
    r = c.fetchone()
    
    # Fallback: Try finding by Name (useful if frontend uses temp timestamp name)
    if not r:
        c.execute("SELECT * FROM convoys WHERE convoy_name = ? OR convoy_name LIKE ?", 
                  (convoy_id, f"%{convoy_id}%"))
        r = c.fetchone()
        
    conn.close()
    if r:
        return jsonify({
            'id': r[0], 'convoy_name': r[1], 'start_point': r[2],
            'destination': r[3], 'mission_type': r[4], 'load_weight': r[5],
            'num_vehicles': r[6], 'priority_score': r[7], 'status': r[8],
            'threat_level': r[9], 'route_data': r[10], 'eta': r[12]
        })
    return jsonify({'error': 'Convoy not found'}), 404
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    print("AstraConvoy Backend Starting...")
    print(f"API Server running on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
