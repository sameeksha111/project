const tagPriority = ({ issueType, description, petAge }) => {
  let priority = 'medium';

  // Convert description to lowercase for comparison
  const desc = description ? description.toLowerCase() : '';

  // HIGH PRIORITY keywords
  const highPriorityKeywords = [
    'injured', 'critical', 'emergency', 'severe', 'dying', 'bleeding', 
    'accident', 'fight', 'poisoned', 'hit', 'run over', 'unconscious', 'urgent'
  ];

  const isHighPriority = highPriorityKeywords.some(keyword => desc.includes(keyword));

  if (isHighPriority || issueType === 'emergency' || issueType === 'injured') {
    priority = 'high';
  }
  // LOW PRIORITY
  else if (issueType === 'general' || desc.length < 20) {
    priority = 'low';
  }
  // MEDIUM PRIORITY (default)
  else if (issueType === 'missing' || issueType === 'illness' || issueType === 'lost-found') {
    priority = 'medium';
  }

  return priority;
};

module.exports = { tagPriority };
