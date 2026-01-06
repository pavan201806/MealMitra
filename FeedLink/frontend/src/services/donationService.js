import api from './api';

export const createDonation = async (donationData) => {
  const response = await api.post('/donations/create', donationData);
  return response.data;
};

export const getDonorDonations = async () => {
  const response = await api.get('/donations/donor');
  return response.data;
};

export const getAvailableDonations = async () => {
  const response = await api.get('/donations/available');
  return response.data;
};

export const getVolunteerDonations = async () => {
  const response = await api.get('/donations/volunteer');
  return response.data;
};

export const assignDonation = async (donationId) => {
  const response = await api.post('/donations/assign', { donation_id: donationId });
  return response.data;
};

export const completeDonation = async (donationId) => {
  const response = await api.post('/donations/complete', { donation_id: donationId });
  return response.data;
};

export const getNearbyDonations = async (address = '') => {
  const response = await api.get('/ngo/nearby-donations', { params: { address } });
  return response.data;
};

export const getAllDonations = async () => {
  const response = await api.get('/donations/all');
  return response.data;
};

