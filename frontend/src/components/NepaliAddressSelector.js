import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { provinces, districtsByProvince, municipalsByDistrict } from '../data/nepalAddresses';

const NepaliAddressSelector = ({ onAddressChange, initialProvince, initialDistrict, initialMunicipal }) => {
  console.log('NepaliAddressSelector mounted with initialProvince:', initialProvince);
  const [districts, setDistricts] = useState([]);
  const [municipals, setMunicipals] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState(initialProvince || '');
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict || '');
  const [selectedMunicipal, setSelectedMunicipal] = useState(initialMunicipal || '');

  useEffect(() => {
    if (initialProvince && provinces.length > 0 && selectedProvince === '') {
      console.log('Attempting to set initial province:', initialProvince);
      const foundProvince = provinces.find(p => p === initialProvince);
      if (foundProvince) {
        setSelectedProvince(initialProvince);
        console.log('Initial province set to:', initialProvince);
      }
    }
  }, [initialProvince, selectedProvince]);

  useEffect(() => {
    if (selectedProvince) {
      console.log('selectedProvince changed to:', selectedProvince);
      const fetchedDistricts = districtsByProvince[selectedProvince] || [];
      setDistricts(fetchedDistricts);
      setMunicipals([]); // Clear municipals when district changes
      setSelectedDistrict('');
      setSelectedMunicipal('');
    } else {
      console.log('selectedProvince is empty, clearing districts and municipals.');
      setDistricts([]);
      setMunicipals([]);
      setSelectedDistrict('');
      setSelectedMunicipal('');
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      console.log('selectedDistrict changed to:', selectedDistrict);
      const fetchedMunicipals = municipalsByDistrict[selectedDistrict] || [];
      setMunicipals(fetchedMunicipals);
      setSelectedMunicipal('');
    } else {
      console.log('selectedDistrict is empty, clearing municipals.');
      setMunicipals([]);
      setSelectedMunicipal('');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    // Call the parent's onAddressChange callback
    onAddressChange({
      province: selectedProvince,
      district: selectedDistrict,
      municipal: selectedMunicipal,
    });
  }, [selectedProvince, selectedDistrict, selectedMunicipal, onAddressChange]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
      <FormControl fullWidth>
        <InputLabel id="province-select-label">Province</InputLabel>
        <Select
          labelId="province-select-label"
          id="province-select"
          value={selectedProvince}
          label="Province"
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          {Array.isArray(provinces) && provinces.map((provinceName) => (
            <MenuItem key={provinceName} value={provinceName}>
              {provinceName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedProvince}>
        <InputLabel id="district-select-label">District</InputLabel>
        <Select
          labelId="district-select-label"
          id="district-select"
          value={selectedDistrict}
          label="District"
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          {Array.isArray(districts) && districts.map((districtName) => (
            <MenuItem key={districtName} value={districtName}>
              {districtName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedDistrict}>
        <InputLabel id="municipal-select-label">Municipal</InputLabel>
        <Select
          labelId="municipal-select-label"
          id="municipal-select"
          value={selectedMunicipal}
          label="Municipal"
          onChange={(e) => setSelectedMunicipal(e.target.value)}
        >
          {Array.isArray(municipals) && municipals.map((municipalName) => (
            <MenuItem key={municipalName} value={municipalName}>
              {municipalName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default NepaliAddressSelector;
