// Array of sayings
var sayings = [
    "cringe",
    "america",
    "1 + 1 = 3",
    "pew pew",
    "do your work",
    "wow",
    "hamburger",
    "tucker's the best",
    "please help",
    "insert nice quote",
    "JOIN THE SERVER OFHORFHRUHOIF"
  ];

  // Function to set random saying as homequote text
  function setRandomSaying() {
    // Get random index from sayings array
    var randomIndex = Math.floor(Math.random() * sayings.length);
    
    // Get homequote element
    var homequote = document.getElementById("homequote");
    
    // Set its text to the random saying
    homequote.textContent = sayings[randomIndex];
  }
  
  setRandomSaying()
