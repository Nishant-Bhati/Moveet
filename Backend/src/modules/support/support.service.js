import SupportContact from './supportContact.model.js';

export const getSupportContact = async () => {
  const contact = await SupportContact.findOne({ isActive: true });
  if (!contact) {
    return {
      phone: '+91 98765 43210',
      email: 'support@moveet.in',
      label: 'Moveet Support',
      supportHours: 'Mon–Sat, 9am–6pm',
    };
  }
  return contact;
};

export default {
  getSupportContact,
};
