client.addEventListener('TIME_SET', (data: { timeInSeconds: number }) => {
    setWhiteTime(data.timeInSeconds);
    setBlackTime(data.timeInSeconds);
    setActiveTimer('white');
    setChatMessages(prev => [...prev, `Game time set to ${Math.floor(data.timeInSeconds / 60)} minutes per player`]);
  });