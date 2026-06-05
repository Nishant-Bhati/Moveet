import rideService from './ride.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const startRide = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { scooterId } = req.body;
    const result = await rideService.startRide(userId, scooterId);
    return sendSuccess(res, result, 'Ride started successfully');
  } catch (err) {
    next(err);
  }
};

export const getActiveRide = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await rideService.getActiveRide(userId);
    if (!result) {
      return sendSuccess(res, null, 'No active ride');
    }
    return sendSuccess(res, result, 'Active ride fetched');
  } catch (err) {
    next(err);
  }
};

export const endRide = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await rideService.endRide(userId);
    return sendSuccess(res, result, 'Ride ended successfully');
  } catch (err) {
    next(err);
  }
};

export const getRideHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await rideService.getRideHistory(userId);
    return sendSuccess(res, result, 'Ride history fetched');
  } catch (err) {
    next(err);
  }
};

export default {
  startRide,
  getActiveRide,
  endRide,
  getRideHistory,
};
