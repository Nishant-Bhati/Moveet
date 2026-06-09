import Ride from './ride.model.js';
import Scooter from '../scooter/scooter.model.js';
import User from '../user/user.model.js';
import { createNotification } from '../notification/notification.service.js';

export const startRide = async (userId, scooterId) => {
  // 1. Check if user already has an ACTIVE ride
  const activeRide = await Ride.findOne({ userId, status: 'ACTIVE' });
  if (activeRide) {
    throw new Error('You already have an active ride');
  }

  // 2. Find scooter and check availability
  const scooter = await Scooter.findById(scooterId);
  if (!scooter) {
    throw new Error('Scooter not found');
  }
  if (scooter.status !== 'AVAILABLE') {
    throw new Error('Scooter is not available');
  }

  // 3. Create new Ride document
  const ride = new Ride({
    userId,
    scooterId,
    iotScooterId: scooter.iotId,
    status: 'ACTIVE',
    startTime: new Date(),
  });
  await ride.save();

  // 4. Update scooter status
  scooter.status = 'IN_USE';
  scooter.assignedUserId = userId;
  await scooter.save();

  // TODO: call IoT unlock endpoint when available

  return await ride.populate('scooterId');
};

export const getActiveRide = async (userId) => {
  return await Ride.findOne({ userId, status: 'ACTIVE' }).populate('scooterId');
};

export const endRide = async (userId) => {
  // 1. Find active ride
  const ride = await Ride.findOne({ userId, status: 'ACTIVE' });
  if (!ride) {
    throw new Error('No active ride found');
  }

  // 2. Calculate duration in seconds
  const durationSeconds = Math.floor((new Date() - ride.startTime) / 1000);

  // 3. Fetch user to check active plan
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // 4. Calculate cost
  let cost = 0;
  const isPlanActive = user.activePlanId && user.planExpiryDate && new Date(user.planExpiryDate) > new Date();
  
  if (!isPlanActive) {
    const scooter = await Scooter.findById(ride.scooterId);
    if (!scooter) {
      throw new Error('Scooter not found for this ride');
    }
    const rawCost = Math.ceil(durationSeconds / 60) * (scooter.pricing?.minutely || 0);
    cost = Math.round(rawCost * 100) / 100; // Round to 2 decimal places
  }

  // 5. Update ride
  ride.status = 'COMPLETED';
  ride.endTime = new Date();
  ride.durationSeconds = durationSeconds;
  ride.cost = cost;
  await ride.save();

  // 6. Update scooter status
  await Scooter.findByIdAndUpdate(ride.scooterId, {
    status: 'AVAILABLE',
    assignedUserId: null,
  });

  // 7. Deduct from user wallet if cost > 0
  if (cost > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { walletBalance: -cost },
    });
  }

  // TODO: call IoT lock endpoint when available

  // 8. Call notification service
  const notificationMessage = `Your ride ended. Cost: ₹${cost}.`;
  await createNotification(userId, 'SUCCESS', 'Ride complete', notificationMessage);

  return await ride.populate('scooterId');
};

export const getRideHistory = async (userId) => {
  return await Ride.find({ userId, status: 'COMPLETED' })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('scooterId');
};

export default {
  startRide,
  getActiveRide,
  endRide,
  getRideHistory,
};
