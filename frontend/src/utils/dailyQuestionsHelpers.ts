const getCurrentPeriod = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return "morning";
  if (hours >= 12 && hours < 18) return "afternoon";
  return "evening";
};

const getRemainingQuestions = (currentPeriod: string, remainingMorningQuestions: number, remainingEveningQuestions: number) => {
  return currentPeriod === "morning" || currentPeriod === "afternoon" 
    ? remainingMorningQuestions 
    : remainingEveningQuestions;
};

const decrementRemainingQuestions = (currentPeriod: string, setRemainingMorningQuestions: (value: number) => void, remainingMorningQuestions: number, setRemainingEveningQuestions: (value: number) => void, remainingEveningQuestions: number) => {
  if (currentPeriod === "morning" || currentPeriod === "afternoon") {
    setRemainingMorningQuestions(remainingMorningQuestions - 1);
  } else {
    setRemainingEveningQuestions(remainingEveningQuestions - 1);
  }
};

export { getCurrentPeriod, getRemainingQuestions, decrementRemainingQuestions };