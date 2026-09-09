/**
 * CURLING PUZZLES — HANGMAN PUZZLE DATA CONTRACT
 *
 * Maintenance Rule:
 * To add puzzles, append new puzzle objects to the array below.
 * Do not modify index.html, style.css, or script.js when adding content.
 *
 * Schedule Baseline:
 * Day 0 = 8 September 2026 (index 0)
 * Day 1 = 9 September 2026 (index 1)
 *
 * Curriculum Levels (Curling Puzzles Curriculum):
 * Level 1: Accessible Foundations (House, Button, Stones, Sheet, Basic Scoring)
 * Level 2: Developing Knowledge (Delivery, Brushing, Curl, Guards, Takeouts)
 * Level 3: Strategy & Play (Hammer, Shot Selection, Free Guard Zone, Roles)
 * Level 4: Ice, Technique & History (Pebble, Ice Conditions, Bonspiels, Tournaments)
 * Level 5: Expert Knowledge (Canadian Curling Lore, Advanced Tactics, Specialist Rules)
 */

var CURLING_HANGMAN_PUZZLES = [
  {
    id: "curl-hang-000",
    index: 0,
    word: "BUTTON",
    category: "The House",
    curriculumLevel: "Level 1 — Accessible Foundations",
    difficulty: "Easy",
    clue: "The exact center circle of the house, measuring one foot in diameter.",
    context: "In curling, stones closest to the button score points. A shot landing directly on the button is often the ultimate strategic goal in an end."
  },
  {
    id: "curl-hang-001",
    index: 1,
    word: "HAMMER",
    category: "Curling Strategy",
    curriculumLevel: "Level 3 — Strategy & Play",
    difficulty: "Easy",
    clue: "The significant tactical advantage of delivering the final stone in an end.",
    context: "Holding the hammer allows a team to dictate end strategy, typically aiming to score two or more points, or blank the end to keep the advantage."
  },
  {
    id: "curl-hang-002",
    index: 2,
    word: "HOGLINE",
    category: "The Curling Sheet",
    curriculumLevel: "Level 1 — Accessible Foundations",
    difficulty: "Medium",
    clue: "The line a stone must clearly cross to remain in play, and must be released before.",
    context: "Stones that fail to cross the far hog line are immediately removed from the sheet as 'hogged rocks'. Modern competitive stones use electronic sensor handles."
  },
  {
    id: "curl-hang-003",
    index: 3,
    word: "PEBBLE",
    category: "Pebble and Ice Preparation",
    curriculumLevel: "Level 4 — Ice, Technique & History",
    difficulty: "Easy",
    clue: "Water droplets sprayed onto the ice sheet that freeze into tiny raised bumps.",
    context: "Pebbled ice drastically reduces the contact surface area beneath the stone's running band, allowing the 44-pound granite rock to glide smoothly and curl."
  },
  {
    id: "curl-hang-004",
    index: 4,
    word: "TAKEOUT",
    category: "Takeouts",
    curriculumLevel: "Level 2 — Developing Knowledge",
    difficulty: "Beginner",
    clue: "A high-velocity delivery intended to strike and remove an opponent's rock from play.",
    context: "Takeouts require precision line calling and heavier throwing weight. Clearing opponent stones keeps the house open for defensive control."
  },
  {
    id: "curl-hang-005",
    index: 5,
    word: "BONSPIEL",
    category: "Major Events and Tournaments",
    curriculumLevel: "Level 4 — Ice, Technique & History",
    difficulty: "Medium",
    clue: "A traditional curling tournament or festival, originating from Scottish heritage.",
    context: "Bonspiels range from casual weekend club gatherings to prestigious international tournaments with deep community and sportsmanship traditions."
  },
  {
    id: "curl-hang-006",
    index: 6,
    word: "GRANITE",
    category: "Stones / Rocks",
    curriculumLevel: "Level 1 — Accessible Foundations",
    difficulty: "Beginner",
    clue: "The dense natural igneous rock used to fashion regulation curling stones.",
    context: "World Curling regulation stones are quarried primarily from Ailsa Craig in Scotland and Trefor in Wales, known for resistance to water absorption and freezing impact."
  },
  {
    id: "curl-hang-007",
    index: 7,
    word: "SWEEPER",
    category: "Brushing / Sweeping",
    curriculumLevel: "Level 2 — Developing Knowledge",
    difficulty: "Beginner",
    clue: "A teammate who vigorously brushes the ice ahead of a gliding stone to polish its path.",
    context: "Sweeping momentarily warms and smooths the pebbled ice, reducing friction to keep the rock sliding farther and straightening its curved trajectory."
  },
  {
    id: "curl-hang-008",
    index: 8,
    word: "SKIP",
    category: "Skip / Lead / Second / Third Roles",
    curriculumLevel: "Level 3 — Strategy & Play",
    difficulty: "Beginner",
    clue: "The team captain who determines tactical decisions and holds the broom target in the house.",
    context: "The skip calls shots, manages end strategy, signals sweeping calls from the house, and usually delivers the final two stones of each end."
  },
  {
    id: "curl-hang-009",
    index: 9,
    word: "FREEZE",
    category: "Shot Selection",
    curriculumLevel: "Level 3 — Strategy & Play",
    difficulty: "Hard",
    clue: "A delicate finesse draw that comes to rest nestled directly against another stone.",
    context: "Executing a perfect freeze makes the newly placed stone nearly impossible to remove with a simple takeout without bumping your own stone deeper into position."
  },
  {
    id: "curl-hang-010",
    index: 10,
    word: "BRIER",
    category: "Deep Curling Lore & Canadian Culture",
    curriculumLevel: "Level 5 — Expert Knowledge",
    difficulty: "Medium",
    clue: "The annual Canadian men's national curling championship, inaugurated in 1927.",
    context: "The Montana's Brier (historically the Macdonald Brier) is one of Canadian sports' most watched traditions, awarding the iconic purple heart crest."
  },
  {
    id: "curl-hang-011",
    index: 11,
    word: "GUARD",
    category: "Guards",
    curriculumLevel: "Level 2 — Developing Knowledge",
    difficulty: "Beginner",
    clue: "A stone positioned between the hog line and the house to shield scoring stones behind it.",
    context: "Under the modern five-rock Free Guard Zone rule, lead stones placed in the guard zone cannot be eliminated by opponents until the sixth stone of the end."
  },
  {
    id: "curl-hang-012",
    index: 12,
    word: "HACK",
    category: "The Curling Sheet",
    curriculumLevel: "Level 1 — Accessible Foundations",
    difficulty: "Easy",
    clue: "The rubber-lined foot foothold embedded in the ice used to push off during delivery.",
    context: "Similar to a track-and-field starting block, two hacks are frozen flush into the ice behind each tee line for left-handed and right-handed deliveries."
  },
  {
    id: "curl-hang-013",
    index: 13,
    word: "DRAW",
    category: "Draws",
    curriculumLevel: "Level 2 — Developing Knowledge",
    difficulty: "Beginner",
    clue: "A finesse delivery calculated to come to rest gently inside the rings without contact.",
    context: "Draw weight is the standard metric for ice speed. When a skip calls for 'draw weight', sweepers gauge elapsed delivery time from back line to hog line."
  },
  {
    id: "curl-hang-014",
    index: 14,
    word: "SCOTTIES",
    category: "Deep Curling Lore & Canadian Culture",
    curriculumLevel: "Level 5 — Expert Knowledge",
    difficulty: "Hard",
    clue: "The colloquial title of the prestigious Canadian Women's National Curling Championship.",
    context: "The Scotties Tournament of Hearts features provincial and territorial champions competing for the national title and the privilege to represent Canada at the Worlds."
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { CURLING_HANGMAN_PUZZLES };
}
