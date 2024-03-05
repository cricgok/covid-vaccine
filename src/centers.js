import React, { useState, useEffect } from 'react';
import "./centers.css";

function CenterDetails() {
  const [centers, setCenters] = useState([]);
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [filter, setFilter] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCenterData();
  }, []);

  useEffect(() => {
    applyFilterAndSort();
    // eslint-disable-next-line 
  }, [centers, filter, sortColumn, sortOrder]);

  const fetchCenterData = async () => {
    try {
      const response = await fetch('http://localhost:5001/get-centers');
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      } else {
        console.error('Failed to fetch center data');
      }
    } catch (error) {
      console.error('Error fetching center data:', error);
    }
  };

  const fetchSlotCount = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/get-center-slots/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data.count; // Assuming the response has a 'count' field
      } else {
        console.error('Failed to fetch slot count for center:', id);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching slot count for center:', id, error);
      return 0;
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/delete-center/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        console.log('Center deleted successfully');
        // Refetch data after deletion
        fetchCenterData();
      } else {
        console.error('Failed to delete center');
      }
    } catch (error) {
      console.error('Error deleting center:', error);
    }
  };

  const applyFilterAndSort = async () => {
    let filtered = [...centers];
    if (filter) {
      filtered = filtered.filter(center =>
        center.centerName.toLowerCase().includes(filter.toLowerCase()) ||
        center.location.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valueA = a[sortColumn];
        const valueB = b[sortColumn];
        if (sortOrder === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      });
    }

    const centersWithSlotCount = await Promise.all(filtered.map(async center => {
      const slotCount = await fetchSlotCount(center.id);
      return { ...center, slotCount };
    }));

    setFilteredCenters(centersWithSlotCount);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };
  const handleClearFilter = () => {
    setFilter('');
  };

  return (
    <div>
      <h2 className='text-col'>Available Vaccination Centers</h2>
      <div>
        <input type="text" placeholder="Filter by name or location" value={filter} onChange={handleFilterChange} />
        <button onClick={handleClearFilter}>Clear</button>
      </div>
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('centerName')}>Name {sortColumn === 'centerName' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th onClick={() => handleSort('location')}>Location {sortColumn === 'location' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            <th>Dosage</th>
            <th>Slots</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCenters.map(center => (
            <tr key={center.id}>
              <td>{center.centerName}</td>
              <td>{center.location}</td>
              <td>{center.availableDosage}</td>
              <td>{center.availableSlots}</td>
              <td><button onClick={() => handleDelete(center.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CenterDetails;
