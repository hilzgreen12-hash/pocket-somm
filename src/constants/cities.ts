// Curated list of cities for autocomplete fallback. Skewed toward places
// people actually drink wine in — major capitals, wine-region towns, big
// metro areas. The user's own history is suggested first; this list fills
// the gap for first-time use and unfamiliar destinations.

export const CITIES: readonly string[] = [
  // UK & Ireland
  'London', 'Edinburgh', 'Glasgow', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
  'Bristol', 'Bath', 'Oxford', 'Cambridge', 'York', 'Brighton', 'Cardiff', 'Belfast',
  'Newcastle', 'Sheffield', 'Nottingham', 'Aberdeen', 'St Andrews', 'Inverness',
  'Dublin', 'Cork', 'Galway',

  // France
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier',
  'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon',
  'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Aix-en-Provence', 'Avignon', 'Cannes',
  'Beaune', 'Sancerre', 'Épernay', 'Chablis', 'Saint-Émilion',

  // Italy
  'Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence',
  'Venice', 'Verona', 'Padua', 'Trieste', 'Brescia', 'Parma', 'Modena', 'Pisa',
  'Siena', 'Lucca', 'Bari', 'Catania', 'Sorrento', 'Amalfi', 'Como', 'Alba',
  'Montalcino', 'Montepulciano',

  // Spain & Portugal
  'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia',
  'Palma', 'Bilbao', 'Granada', 'San Sebastián', 'Logroño', 'Haro', 'Jerez',
  'Lisbon', 'Porto', 'Faro', 'Coimbra', 'Funchal',

  // Germany, Austria, Switzerland
  'Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf',
  'Leipzig', 'Dresden', 'Hanover', 'Nuremberg', 'Bremen', 'Heidelberg',
  'Vienna', 'Salzburg', 'Graz', 'Innsbruck',
  'Zurich', 'Geneva', 'Basel', 'Bern', 'Lausanne', 'Lucerne',

  // Benelux & Nordics
  'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven',
  'Brussels', 'Antwerp', 'Bruges', 'Ghent', 'Luxembourg',
  'Copenhagen', 'Aarhus', 'Stockholm', 'Gothenburg', 'Malmö',
  'Oslo', 'Bergen', 'Helsinki', 'Reykjavik',

  // Eastern Europe & Greece
  'Athens', 'Thessaloniki', 'Santorini', 'Mykonos', 'Crete',
  'Prague', 'Brno', 'Budapest', 'Warsaw', 'Krakow', 'Bucharest', 'Sofia',
  'Belgrade', 'Zagreb', 'Ljubljana', 'Tallinn', 'Riga', 'Vilnius',
  'Moscow', 'Saint Petersburg', 'Kyiv',

  // North America – US
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
  'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City',
  'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Milwaukee', 'Albuquerque',
  'Tucson', 'Atlanta', 'Miami', 'Tampa', 'Orlando', 'Pittsburgh', 'Cleveland',
  'Cincinnati', 'Kansas City', 'Saint Louis', 'Honolulu',
  'Napa', 'Sonoma', 'Healdsburg', 'Calistoga', 'Saint Helena',
  'Walla Walla', 'Willamette', 'McMinnville',

  // North America – Canada & Mexico
  'Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Quebec City',
  'Winnipeg', 'Halifax', 'Victoria', 'Kelowna', 'Niagara-on-the-Lake',
  'Mexico City', 'Guadalajara', 'Monterrey', 'Cancún', 'Puerto Vallarta',
  'Mérida', 'Oaxaca', 'San Miguel de Allende',

  // South America
  'Buenos Aires', 'Mendoza', 'Córdoba', 'Rosario',
  'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte',
  'Santiago', 'Valparaíso', 'Casablanca',
  'Lima', 'Cusco', 'Bogotá', 'Medellín', 'Cartagena', 'Quito', 'Caracas',
  'Montevideo',

  // Africa
  'Cape Town', 'Johannesburg', 'Stellenbosch', 'Franschhoek', 'Constantia',
  'Durban', 'Pretoria',
  'Cairo', 'Alexandria', 'Marrakech', 'Casablanca', 'Tangier',
  'Tunis', 'Algiers', 'Dakar', 'Lagos', 'Nairobi', 'Addis Ababa',

  // Middle East
  'Dubai', 'Abu Dhabi', 'Doha', 'Riyadh', 'Jeddah', 'Manama', 'Kuwait City',
  'Tel Aviv', 'Jerusalem', 'Amman', 'Beirut', 'Istanbul', 'Ankara', 'Izmir',

  // Asia
  'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo', 'Nagoya', 'Fukuoka',
  'Seoul', 'Busan', 'Incheon', 'Jeju',
  'Beijing', 'Shanghai', 'Hong Kong', 'Macau', 'Guangzhou', 'Shenzhen',
  'Chengdu', "Xi'an", 'Hangzhou', 'Suzhou',
  'Taipei', 'Kaohsiung',
  'Singapore', 'Kuala Lumpur', 'Penang', 'Bangkok', 'Chiang Mai', 'Phuket',
  'Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An',
  'Manila', 'Cebu', 'Jakarta', 'Bali', 'Yogyakarta',
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Goa',
  'Karachi', 'Lahore', 'Dhaka', 'Colombo', 'Kathmandu',

  // Oceania
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Hobart', 'Canberra',
  'Darwin', 'Cairns', 'Margaret River', 'Barossa Valley', 'Hunter Valley',
  'Auckland', 'Wellington', 'Christchurch', 'Queenstown', 'Marlborough',
  'Hawke\'s Bay', 'Central Otago',
];
