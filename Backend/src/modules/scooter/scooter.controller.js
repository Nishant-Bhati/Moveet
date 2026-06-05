import scooterService from './scooter.service.js';
import { sendSuccess, sendError } from '../../utils/apiResponse.js';

export const getNearby = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) {
      return sendError(res, 'Latitude (lat) and longitude (lng) query parameters are required', 400);
    }
    const scooters = await scooterService.getNearby(lat, lng, radius);
    return sendSuccess(res, scooters, 'Nearby AVAILABLE scooters retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const scooter = await scooterService.getById(id);
    return sendSuccess(res, scooter, 'Scooter retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const getByQr = async (req, res) => {
  try {
    const { code } = req.params;
    const scooter = await scooterService.getByQr(code);
    return sendSuccess(res, scooter, 'Scooter retrieved by QR successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 404);
  }
};

export const getFleetSummary = async (req, res) => {
  try {
    const summary = await scooterService.getFleetSummary();
    return sendSuccess(res, summary, 'Fleet summary retrieved successfully', 200);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

export default {
  getNearby,
  getById,
  getByQr,
  getFleetSummary,
};
