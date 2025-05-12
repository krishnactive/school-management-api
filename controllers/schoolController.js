const db = require('../db');
const { getDistance } = require('geolib');

// Handler to add a new school
exports.addSchool = (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Basic input validation
  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'Invalid input. Name, address, latitude, and longitude are required.' });
  }

  const insertQuery = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  const values = [name, address, latitude, longitude];

  db.query(insertQuery, values, (err) => {
    if (err) {
      console.error('Error inserting school:', err);
      return res.status(500).json({ error: 'Database error while adding school.' });
    }

    res.status(201).json({ message: 'School added successfully.' });
  });
};

// Handler to list all schools sorted by proximity
exports.listSchools = (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLng = parseFloat(req.query.longitude);

  // Validate coordinates
  if (isNaN(userLat) || isNaN(userLng)) {
    return res.status(400).json({ message: 'Invalid latitude or longitude.' });
  }

  const fetchQuery = 'SELECT * FROM schools';

  db.query(fetchQuery, (err, schools) => {
    if (err) {
      console.error('Error fetching schools:', err);
      return res.status(500).json({ error: 'Database error while retrieving schools.' });
    }

    // Calculate distance for each school and sort the list
    const sortedSchools = schools.map(school => {
      const distance = getDistance(
        { latitude: userLat, longitude: userLng },
        { latitude: school.latitude, longitude: school.longitude }
      );
      return { ...school, distanceInMeters: distance };
    }).sort((a, b) => a.distanceInMeters - b.distanceInMeters);

    res.json(sortedSchools);
  });
};
