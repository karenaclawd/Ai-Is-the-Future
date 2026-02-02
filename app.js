const ideaForm = document.querySelector("#idea-form");
const ideaTitle = document.querySelector("#idea-title");
const ideaDescription = document.querySelector("#idea-description");
const characterCount = document.querySelector("#character-count");
const ideaFeed = document.querySelector("#idea-feed");
const emptyState = document.querySelector("#empty-state");
const ideaTemplate = document.querySelector("#idea-template");
const totalIdeas = document.querySelector("#total-ideas");
const totalVotes = document.querySelector("#total-votes");
const filterButtons = document.querySelectorAll(".chip");

const STORAGE_KEY = "idea-pulse-feed";
let ideaList = [];
let activeSort = "newest";

const formatDate = (timestamp) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);

const updateCounts = () => {
  totalIdeas.textContent = ideaList.length;
  const votes = ideaList.reduce(
    (sum, item) => sum + item.upvotes + item.downvotes,
    0
  );
  totalVotes.textContent = votes;
};

const saveIdeas = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ideaList));
};

const loadIdeas = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  ideaList = stored ? JSON.parse(stored) : [];
};

const buildCard = (idea) => {
  const card = ideaTemplate.content.cloneNode(true);
  const title = card.querySelector(".card__title");
  const timestamp = card.querySelector(".card__timestamp");
  const description = card.querySelector(".card__description");
  const upvoteButton = card.querySelector('[data-action="upvote"]');
  const downvoteButton = card.querySelector('[data-action="downvote"]');
  const scoreValue = card.querySelector(".score-value");

  title.textContent = idea.title;
  description.textContent = idea.description;
  timestamp.textContent = formatDate(new Date(idea.createdAt));
  scoreValue.textContent = idea.upvotes - idea.downvotes;

  if (idea.userVote === "up") {
    upvoteButton.classList.add("is-active");
  }

  if (idea.userVote === "down") {
    downvoteButton.classList.add("is-active");
  }

  const updateVote = (direction) => {
    if (idea.userVote === direction) {
      idea.userVote = null;
      if (direction === "up") {
        idea.upvotes -= 1;
      } else {
        idea.downvotes -= 1;
      }
    } else {
      if (idea.userVote === "up") {
        idea.upvotes -= 1;
      }
      if (idea.userVote === "down") {
        idea.downvotes -= 1;
      }
      idea.userVote = direction;
      if (direction === "up") {
        idea.upvotes += 1;
      } else {
        idea.downvotes += 1;
      }
    }

    saveIdeas();
    renderIdeas();
  };

  upvoteButton.addEventListener("click", () => updateVote("up"));
  downvoteButton.addEventListener("click", () => updateVote("down"));

  return card;
};

const getSortedIdeas = () => {
  const ideas = [...ideaList];
  if (activeSort === "top") {
    return ideas.sort((a, b) => {
      const scoreDiff = b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return ideas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const renderIdeas = () => {
  const sortedIdeas = getSortedIdeas();
  ideaFeed.innerHTML = "";

  if (sortedIdeas.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    sortedIdeas.forEach((idea) => {
      ideaFeed.appendChild(buildCard(idea));
    });
  }

  updateCounts();
};

const handleSubmit = (event) => {
  event.preventDefault();

  const title = ideaTitle.value.trim();
  const description = ideaDescription.value.trim();

  if (!title || !description) {
    return;
  }

  const newIdea = {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    userVote: null,
  };

  ideaList.unshift(newIdea);
  saveIdeas();
  renderIdeas();

  ideaForm.reset();
  characterCount.textContent = "0 / 280";
};

const updateCharacterCount = () => {
  characterCount.textContent = `${ideaDescription.value.length} / 280`;
};

ideaForm.addEventListener("submit", handleSubmit);
ideaDescription.addEventListener("input", updateCharacterCount);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((chip) => chip.classList.remove("is-active"));
    button.classList.add("is-active");
    activeSort = button.dataset.sort;
    renderIdeas();
  });
});

loadIdeas();
renderIdeas();
