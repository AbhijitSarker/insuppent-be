export const calculateLeadPrice =(memberLevel, leadType) => {
  const pricing = {
    subscriber: {
      auto: 17.5,
      home: 21.5,
      mortgage: 25.5,
    },
    startup: {
      auto: 12.5,
      home: 15.5,
      mortgage: 19.5,
    },
    agency: {
      auto: 11.5,
      home: 13.5,
      mortgage: 17.5,
    },
  };

  const normalizedLevel = String(memberLevel).toLowerCase();
  const normalizedType = String(leadType).toLowerCase();

  if (!pricing[normalizedLevel] || !pricing[normalizedLevel][normalizedType]) {
    return null;
  }
  return pricing[normalizedLevel][normalizedType];
}