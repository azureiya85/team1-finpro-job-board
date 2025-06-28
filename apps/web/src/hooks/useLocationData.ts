'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  name: string;
  type: 'CITY' | 'REGENCY';
  provinceId: string;
}

export function useLocationData(selectedProvinceId?: string) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setIsLoadingProvinces(true);
        const response = await axios.get('/api/locations/provinces');
        setProvinces(response.data);
      } catch (err) {
        console.error('Error fetching provinces:', err);
        setError('Failed to load provinces');
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch cities when province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvinceId) {
        setCities([]);
        return;
      }

      try {
        setIsLoadingCities(true);
        const response = await axios.get(`/api/locations/cities?provinceId=${selectedProvinceId}`);
        setCities(response.data);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities');
        setCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedProvinceId]);

  return {
    provinces,
    cities,
    isLoadingProvinces,
    isLoadingCities,
    error,
  };
}