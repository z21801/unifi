let timestamp = () => {
  let date_ob = new Date();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();

  // prints time in HH:MM:SS format
  //   console.log(hours + ":" + minutes + ":" + seconds);
  return hours + ":" + minutes + ":" + seconds;
};

export { timestamp };
