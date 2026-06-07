import supportService from './support.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export const getSupportContact = async (req, res, next) => {
  try {
    const result = await supportService.getSupportContact();
    return sendSuccess(res, result, 'Support contact details fetched successfully');
  } catch (err) {
    next(err);
  }
};

export default {
  getSupportContact,
};
