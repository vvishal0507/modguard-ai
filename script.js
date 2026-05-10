const samples = {
  safe: "I really like this discussion. The explanation is useful and I learned something new from the comments.",
  spam: "FREE MONEY!!! Click this link now and visit my website. Buy now buy now buy now. Limited offer!!!",
  toxic: "You are so stupid and useless. Nobody wants your opinion here.",
  review: "I made a tool that can help people. Please check my link and tell me what you think."
};

function loadSample(type) {
  const input = document.getElementById("contentInput");
  input.value = samples[type] || "";
  analyzeContent();
}

function analyzeContent() {
  const input = document.getElementById("contentInput");
  const text = input.value.trim();

  const resultBox = document.getElementById("resultBox");
  const scoreFill = document.getElementById("scoreFill");
  const scoreText = document.getElementById("scoreText");
  const resultMessage = document.getElementById("resultMessage");
  const signalsList = document.getElementById("signalsList");
  const suggestionText = document.getElementById("suggestionText");

  if (text.length === 0) {
    updateResult({
      status: "Waiting for input",
      type: "default",
      score: 0,
      message: "Enter a post or comment and click Analyze Content.",
      signals: ["No signals detected yet."],
      suggestion: "No suggestion yet."
    });
    return;
  }

  const analysis = scanText(text);

  resultBox.className = "result-box " + analysis.type;
  document.querySelector(".result-status").textContent = analysis.status;
  scoreFill.style.width = analysis.score + "%";
  scoreText.textContent = analysis.score + "%";
  resultMessage.textContent = analysis.message;

  signalsList.innerHTML = "";
  analysis.signals.forEach(signal => {
    const li = document.createElement("li");
    li.textContent = signal;
    signalsList.appendChild(li);
  });

  suggestionText.textContent = analysis.suggestion;
}

function updateResult(data) {
  const resultBox = document.getElementById("resultBox");
  const scoreFill = document.getElementById("scoreFill");
  const scoreText = document.getElementById("scoreText");
  const resultMessage = document.getElementById("resultMessage");
  const signalsList = document.getElementById("signalsList");
  const suggestionText = document.getElementById("suggestionText");

  resultBox.className = "result-box " + data.type;
  document.querySelector(".result-status").textContent = data.status;
  scoreFill.style.width = data.score + "%";
  scoreText.textContent = data.score + "%";
  resultMessage.textContent = data.message;

  signalsList.innerHTML = "";
  data.signals.forEach(signal => {
    const li = document.createElement("li");
    li.textContent = signal;
    signalsList.appendChild(li);
  });

  suggestionText.textContent = data.suggestion;
}

function scanText(text) {
  const lowerText = text.toLowerCase();

  const toxicWords = [
    "stupid",
    "idiot",
    "useless",
    "hate",
    "dumb",
    "shut up",
    "trash",
    "loser"
  ];

  const spamWords = [
    "free money",
    "click here",
    "buy now",
    "limited offer",
    "visit my website",
    "subscribe now",
    "earn money",
    "winner",
    "giveaway"
  ];

  const suspiciousWords = [
    "link",
    "promotion",
    "dm me",
    "message me",
    "check my profile",
    "join now",
    "download now"
  ];

  let score = 0;
  let toxicCount = 0;
  let spamCount = 0;
  let suspiciousCount = 0;
  let signals = [];

  toxicWords.forEach(word => {
    if (lowerText.includes(word)) {
      toxicCount++;
    }
  });

  spamWords.forEach(word => {
    if (lowerText.includes(word)) {
      spamCount++;
    }
  });

  suspiciousWords.forEach(word => {
    if (lowerText.includes(word)) {
      suspiciousCount++;
    }
  });

  const exclamationCount = (text.match(/!/g) || []).length;
  const linkCount = (lowerText.match(/http|www\.|\.com|\.in|\.net|\.org/g) || []).length;
  const uppercaseWords = text.split(/\s+/).filter(word => word.length > 3 && word === word.toUpperCase()).length;
  const repeatedWords = findRepeatedWords(lowerText);

  score += toxicCount * 30;
  score += spamCount * 25;
  score += suspiciousCount * 12;
  score += exclamationCount > 3 ? 10 : 0;
  score += linkCount * 15;
  score += uppercaseWords > 2 ? 10 : 0;
  score += repeatedWords.length > 0 ? 10 : 0;

  if (toxicCount > 0) {
    signals.push("Toxic or abusive words detected.");
  }

  if (spamCount > 0) {
    signals.push("Spam or promotional words detected.");
  }

  if (suspiciousCount > 0) {
    signals.push("Suspicious moderation keywords detected.");
  }

  if (exclamationCount > 3) {
    signals.push("Too many exclamation marks detected.");
  }

  if (linkCount > 0) {
    signals.push("External link pattern detected.");
  }

  if (uppercaseWords > 2) {
    signals.push("Multiple uppercase words detected.");
  }

  if (repeatedWords.length > 0) {
    signals.push("Repeated words detected: " + repeatedWords.join(", "));
  }

  if (signals.length === 0) {
    signals.push("No major risk signals detected.");
  }

  score = Math.min(score, 100);

  if (toxicCount > 0 && score >= 40) {
    return {
      status: "Toxic Content",
      type: "toxic",
      score: score,
      message: "This content may contain harmful or abusive language.",
      signals: signals,
      suggestion: "Send this content for moderator review. Consider warning the user or removing the comment if it violates community rules."
    };
  }

  if (spamCount > 0 && score >= 45) {
    return {
      status: "Spam Detected",
      type: "spam",
      score: score,
      message: "This content looks like possible spam or promotional content.",
      signals: signals,
      suggestion: "Review the links and promotional language. If it breaks rules, remove or mark it as spam."
    };
  }

  if (score >= 30) {
    return {
      status: "Needs Review",
      type: "review",
      score: score,
      message: "This content has some signals that may need human moderator review.",
      signals: signals,
      suggestion: "Do not auto-remove. A moderator should review the context and decide."
    };
  }

  return {
    status: "Safe",
    type: "safe",
    score: score,
    message: "This content appears safe based on the current scan.",
    signals: signals,
    suggestion: "No action needed. Keep monitoring community activity."
  };
}

function findRepeatedWords(text) {
  const words = text
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 3);

  const repeated = [];

  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === words[i + 1] && !repeated.includes(words[i])) {
      repeated.push(words[i]);
    }
  }

  return repeated;
}