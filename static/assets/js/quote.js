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
    "JOIN THE SERVER OFHORFHRUHOIF",
    "wassup",
    "The names Bond, names James",
    "just existing yk?",
    "ew dreambox sounds suck",
    "if do you like you know? me too",
    "dm fowntain if you saw this",
    "dean was here",
    "russell is sooper koool",
    "shoutout to my admins :)",
    "I see you, RAT. YEAH, YOU",
    "Shoutout to rolesville",
    "shoutout to carroll i see you",
    "sup xordas",
    "hey ms pierre, you suck",
    "'pisshole' - rat, 2023"
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
