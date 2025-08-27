export const calculateNonRoommateBalances = (payments, roommates) => {
  return payments.reduce((acc, p) => {
    // Check if either payer or payee is a non-roommate
    const fromIsNonRm = !roommates.some((rm) => rm.name === p.from);
    const toIsNonRm = !roommates.some((rm) => rm.name === p.to);

    if (fromIsNonRm || toIsNonRm) {
      const key = `${p.from}->${p.to}`;
      acc[key] = (acc[key] || 0) + parseFloat(p.amount);
    }

    return acc;
  }, {});
};
