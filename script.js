const notesInput = document.getElementById("notes-input");
const generateButton = document.getElementById("generate-button");
const helperText = document.getElementById("helper-text");
const reelFeed = document.getElementById("reel-feed");
const reelTemplate = document.getElementById("reel-template");

const HOOKS = [
  "POV: your prof drops this at 8:59am",
  "This fact is living rent-free in my skull",
  "Class clown explaining your notes like it's lore",
  "Brainrot recap for your future sleep-deprived self",
  "Study group but everyone speaks in memes",
];

const QUESTIONS = [
  "So... what are we answering on the exam tho?",
  "If you had to explain this to your dog, how would you do it?",
  "Drop a memory trick before we all forget again?",
  "What cursed mnemonic are you using for this?",
  "If this was a TikTok sound, what would it say?",
];

const CTA_LINES = [
  "Smash that remember button and send help",
  "Tag the friend who still hasn't started the assignment",
  "Like if you're fake confident rn",
  "Double tap to manifest passing grades",
  "Comment 'brb crying' if you relate",
];

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function chunkNotes(notes) {
  const cleaned = notes
    .replace(/\s+/g, " ")
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (cleaned.length === 0) {
    return [];
  }

  const chunks = [];
  const chunkSize = Math.max(1, Math.ceil(cleaned.length / 6));
  for (let i = 0; i < cleaned.length; i += chunkSize) {
    const slice = cleaned.slice(i, i + chunkSize).join(" ");
    chunks.push(slice);
  }
  return chunks.slice(0, 8); // keep feed snackable
}

function buildReelData(notes) {
  const chunks = chunkNotes(notes);
  if (!chunks.length) {
    return [];
  }

  return chunks.map((chunk, index) => {
    const hook = pickRandom(HOOKS);
    const question = pickRandom(QUESTIONS);
    const cta = pickRandom(CTA_LINES);
    const snippet = chunk.length > 140 ? `${chunk.slice(0, 137)}...` : chunk;

    return {
      id: `reel-${Date.now()}-${index}`,
      title: `Reel ${index + 1}: ${hook}`,
      hook,
      snippet,
      question,
      cta,
    };
  });
}

function createReelCard(reel) {
  const node = reelTemplate.content.cloneNode(true);
  const article = node.querySelector(".reel-card");
  article.dataset.reelId = reel.id;

  node.querySelector(".video-hook").textContent = reel.hook;
  node.querySelector(".video-snippet").textContent = reel.snippet;
  node.querySelector(".reel-title").textContent = reel.title;
  node.querySelector(".reel-question").textContent = `${reel.question} (${reel.cta})`;

  const playToggle = node.querySelector(".play-toggle");
  playToggle.addEventListener("click", () => {
    const isPlaying = playToggle.getAttribute("aria-pressed") === "true";
    playToggle.setAttribute("aria-pressed", String(!isPlaying));
    playToggle.textContent = isPlaying ? "▶ Play vibe" : "⏸ Pause vibe";
  });

  node.querySelectorAll(".reaction-button").forEach((button) => {
    button.addEventListener("click", () => {
      const counter = button.querySelector("span");
      const current = Number(counter.textContent) || 0;
      counter.textContent = current + 1;
      button.setAttribute("aria-live", "polite");
      button.classList.add("popped");
      setTimeout(() => button.classList.remove("popped"), 180);
    });
  });

  const replyForm = node.querySelector(".reply-form");
  const replyInput = node.querySelector(".reply-input");
  const replyList = node.querySelector(".reply-list");

  replyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = replyInput.value.trim();
    if (!text) {
      replyInput.focus();
      return;
    }

    const listItem = document.createElement("li");
    listItem.textContent = text;
    replyList.append(listItem);
    replyInput.value = "";
    replyInput.focus();
  });

  return node;
}

function clearFeed() {
  reelFeed.innerHTML = "";
}

function renderReels(reels) {
  clearFeed();

  if (!reels.length) {
    helperText.textContent = "Need words to make chaos. Paste those notes first!";
    helperText.classList.add("error-text");
    return;
  }

  helperText.textContent = `Serving ${reels.length} bite-size reel${
    reels.length === 1 ? "" : "s"
  }. Scroll for unhinged learning.`;
  helperText.classList.remove("error-text");

  const fragment = document.createDocumentFragment();
  reels.forEach((reel) => {
    fragment.append(createReelCard(reel));
  });
  reelFeed.append(fragment);
  reelFeed.focus();
}

function handleGenerate() {
  const notes = notesInput.value.trim();
  const reels = buildReelData(notes);
  renderReels(reels);
}

generateButton.addEventListener("click", handleGenerate);

notesInput.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
    event.preventDefault();
    handleGenerate();
  }
});
