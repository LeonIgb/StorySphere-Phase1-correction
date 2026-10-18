// Mock data service. Every call is async and can fail, so screens are built
// around real loading and error states from day one. Swap the internals for a
// real API later without touching the screens.

import { stories } from '../data/stories';
import { creators } from '../data/creators';

let simulateFailure = false;

export function setSimulateFailure(value) {
  simulateFailure = Boolean(value);
}

export function getSimulateFailure() {
  return simulateFailure;
}

const creatorById = Object.fromEntries(creators.map((c) => [c.id, c]));

function withCreator(story) {
  return { ...story, creator: creatorById[story.creatorId] || null };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function guarded(producer, ms = 650) {
  await delay(ms);
  if (simulateFailure) {
    throw new Error('We could not reach StorySphere. Check your connection and try again.');
  }
  return producer();
}

export function fetchHomeFeed() {
  return guarded(() => {
    const all = stories.map(withCreator);
    return {
      featured: all.filter((s) => s.featured),
      trending: [...all].sort((a, b) => b.likes - a.likes).slice(0, 4),
      fresh: [...all].sort((a, b) => a.daysAgo - b.daysAgo).slice(0, 5),
      creators: [...creators].sort((a, b) => b.followers - a.followers),
    };
  });
}

export function searchStories({ query = '', genre = 'All' } = {}) {
  return guarded(() => {
    const q = query.trim().toLowerCase();
    return stories
      .map(withCreator)
      .filter((s) => genre === 'All' || s.genre === genre)
      .filter((s) => {
        if (!q) return true;
        const haystack = [s.title, s.blurb, s.genre, s.creator ? s.creator.name : '', ...s.tags]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
  }, 450);
}

export function fetchCreators() {
  return guarded(() => [...creators].sort((a, b) => b.followers - a.followers), 500);
}

export function fetchAllStories() {
  return guarded(() => stories.map(withCreator), 400);
}
