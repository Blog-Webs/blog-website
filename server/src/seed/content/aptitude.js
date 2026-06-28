// Aptitude content tree. Same shape as dsa.js and java.js.

const aptitude = {
  subject: {
    name: 'Aptitude',
    description: 'Quantitative aptitude, logical reasoning, and verbal ability for placement tests and interview rounds.',
    icon: 'calculator',
    color: '#A78BFA',
    order: 3,
  },
  topics: [
    {
      name: 'Quantitative Aptitude: Percentages & Ratios',
      description: 'The two concepts that underpin almost every other quant aptitude question type.',
      order: 1,
      difficulty: 'beginner',
      estimatedMinutes: 30,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 8,
              content: `Percentages and ratios are foundational because nearly every other quant aptitude topic — profit & loss, simple/compound interest, mixtures, time & work — is a percentage or ratio problem wearing a different costume.

A percentage is simply a ratio expressed relative to 100. "20% of 150" means 20/100 × 150 = 30. The key skill isn't the arithmetic itself but recognizing when a word problem is secretly asking for a percentage calculation, since exam questions deliberately phrase things indirectly.

A ratio compares two quantities of the same kind: if the ratio of boys to girls in a class is 3:2, that means for every 3 boys there are 2 girls — not that there are exactly 3 boys and 2 girls, but that the quantities scale together in that proportion. Ratios become proportions when you set two ratios equal: a:b = c:d, which cross-multiplies to a×d = b×c, the basis for solving most "if X then what is Y" ratio problems.

Percentage change (the formula that trips people up most): percentage increase/decrease = ((new value − old value) / old value) × 100. The denominator is always the original (old) value, not the new one — a frequent source of wrong answers under time pressure.`,
              codeSnippets: [],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 12,
              content: `A set of patterns that cover the large majority of percentage and ratio questions on placement tests.

Successive percentage change: if a value increases by 20% and then decreases by 10%, the net change is NOT simply +10%. The correct approach multiplies the factors: 1.20 × 0.90 = 1.08, meaning a net 8% increase. This "multiply the multipliers, don't add the percentages" rule is one of the highest-yield things to internalize, since successive-change questions appear constantly.

Percentage point vs percentage: if an interest rate moves from 5% to 8%, that's a 3 percentage point increase, but a (3/5) × 100 = 60% relative increase. Exam questions sometimes deliberately exploit this distinction.

Ratio-to-fraction shortcuts: if A:B = 3:5, then A is 3/8 of the total (A+B) and B is 5/8 of the total — useful for quickly converting "the ratio of X to Y is 3:5" into "X is 3/8 of the combined quantity" without setting up a full equation.

Combining ratios (working with a common term): if A:B = 2:3 and B:C = 4:5, to combine them into A:B:C, scale both ratios so B matches in both — multiply the first by 4 and the second by 3, giving A:B = 8:12 and B:C = 12:15, so A:B:C = 8:12:15.

Mixture and alligation problems (a ratio application): when mixing two quantities with different concentrations (e.g., two solutions with different sugar percentages) to hit a target concentration, the ratio in which they must be mixed is the inverse ratio of their distances from the target — a shortcut called alligation that avoids setting up and solving a full algebraic equation under time pressure.`,
              externalLinks: [
                { label: 'Percentage Aptitude Questions', url: 'https://www.geeksforgeeks.org/percentage-formula/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Shortcut Formula Reference',
              isFreePreview: true,
              estimatedMinutes: 10,
              content: `A condensed formula sheet for the percentage/ratio question types that appear most often on timed placement tests.

Profit and Loss: Profit % = (Profit / Cost Price) × 100. Loss % = (Loss / Cost Price) × 100. Always note that profit/loss percentage is calculated on Cost Price, never on Selling Price, unless a question explicitly states otherwise — a frequent trap.

Simple Interest: SI = (Principal × Rate × Time) / 100. Compound Interest (annual): CI = Principal × (1 + Rate/100)^Time − Principal. The gap between SI and CI grows with both rate and time, which is the basis for "find the difference between SI and CI" question types.

Successive discounts: two successive discounts of x% and y% are equivalent to a single discount of (x + y − xy/100)%. This is structurally the same multiply-the-multipliers logic as successive percentage change, just phrased as a discount.

Average speed for equal distances at different speeds: when covering equal distances at speeds a and b, the average speed for the entire journey is the harmonic mean, 2ab/(a+b) — NOT the simple arithmetic mean (a+b)/2, a very common mistake under time pressure.

Time and Work: if A can finish a job in x days, A's one-day work rate is 1/x. Combined work rates add directly: if A takes x days and B takes y days, working together they take xy/(x+y) days — derived by adding their individual one-day rates and inverting.`,
              externalLinks: [
                { label: 'Aptitude Formulas', url: 'https://www.geeksforgeeks.org/aptitude-questions-and-answers/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Logical Reasoning: Puzzles & Sequences',
      description: 'Pattern recognition, seating arrangements, syllogisms, and blood relation puzzles.',
      order: 2,
      difficulty: 'intermediate',
      estimatedMinutes: 35,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 9,
              content: `Logical reasoning questions test structured thinking under constraints rather than calculation speed — the skill being measured is whether you can hold multiple conditions in mind simultaneously and methodically eliminate possibilities.

Number and letter series: identifying the rule governing a sequence (2, 6, 12, 20, 30 — differences are 4, 6, 8, 10, an arithmetic progression of differences) and predicting the next term. These test pattern recognition speed, and the key technique is always checking differences, then differences-of-differences, before assuming the pattern is purely multiplicative.

Seating arrangement puzzles: a fixed number of people (or objects) arranged in a line, circle, or grid, given a set of relative-position clues ("A sits second to the left of B," "C is not adjacent to D"). The reliable technique is building a structured grid or diagram, placing the most restrictive ("definite") clues first, and using elimination for the relative clues — guessing-and-checking without a systematic diagram is what causes people to run out of time.

Syllogisms: given two or more premises ("All cats are animals," "Some animals are pets"), determine which conclusions necessarily follow. The Venn diagram method is the most reliable way to verify a syllogism conclusion, since informal reasoning about "all" and "some" statements is a common source of incorrect intuitive answers.

Blood relation puzzles: deducing family relationships from a chain of statements ("A is B's mother's brother's son"). Drawing an actual family tree diagram as you read each clue, rather than holding the chain in your head, is the dependable approach — these puzzles are specifically designed to overload working memory if attempted without a diagram.`,
              codeSnippets: [],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 14,
              content: `A closer look at technique for the puzzle types that consume the most time if approached without a system.

Circular seating arrangements: unlike linear arrangements, "left" and "right" depend on whether people are facing the center or facing outward — a detail questions often state once at the start and expect you to apply consistently. Drawing the circle and marking each confirmed position before working through relative clues prevents directional errors.

Coding-decoding patterns: letters are shifted by a fixed or variable rule (e.g., each letter moves forward by 2 positions in the alphabet) and a code word must be decoded, or a new word encoded using the discovered rule. The fastest approach is writing out the alphabet with position numbers above each letter once, then applying the shift directly rather than counting forward each time.

Direction sense problems: tracking net displacement and final facing direction after a sequence of turns and movements ("walks 5m north, turns right, walks 3m..."). Sketching a simple coordinate grid as you read each step — rather than trying to visualize the whole path mentally — eliminates the most common error source, which is losing track of which direction "right" means after an intermediate turn.

Syllogism edge cases: "Some" statements are often misread as implying "Some are not," which is not logically guaranteed — "Some cats are black" does not mean some cats are definitely not black, even though that's frequently true in real life. Aptitude tests specifically probe this kind of formal-logic precision rather than everyday intuition.

Puzzle-solving time management: a single hard seating arrangement or blood-relation puzzle worth a few points can consume 5+ minutes if attempted without a diagram-first approach — the highest-leverage skill is recognizing within the first 30 seconds whether a puzzle is solvable quickly with the clues given, or whether to skip it and return later if time allows.`,
              externalLinks: [
                { label: 'Logical Reasoning Questions', url: 'https://www.geeksforgeeks.org/logical-reasoning/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Pattern Recognition Techniques',
              isFreePreview: true,
              estimatedMinutes: 11,
              content: `A reference of recurring pattern types worth recognizing on sight, since recognizing the category immediately is most of the battle in a timed test.

Arithmetic and geometric series: constant difference (arithmetic, e.g., 3, 7, 11, 15) vs constant ratio (geometric, e.g., 3, 6, 12, 24). Check ratio first if differences don't look constant — many series are geometric and waste time if you only check differences.

Alternating/composite series: two interleaved patterns in a single series (e.g., 1, 3, 4, 9, 7, 27 — odd positions follow one rule, even positions follow another). Splitting the series into odd-indexed and even-indexed sub-sequences immediately reveals this pattern type.

Prime number and square/cube patterns: sequences built from prime numbers, perfect squares, or perfect cubes (2, 4, 9, 16, 25... mixing a prime-position rule with squares) require recognizing the underlying number-theory pattern rather than a simple arithmetic rule.

Letter-to-number mapping series: series where letters are mapped to their alphabetical position (A=1, B=2...) and then an arithmetic or geometric rule is applied to the resulting numbers — effectively a two-step pattern that's faster to solve by converting to numbers immediately rather than trying to spot the pattern in letters directly.

Syllogism Venn diagram shortcuts: for "All A are B" draw circle A entirely inside circle B; for "Some A are B" draw two overlapping circles; for "No A are B" draw two separate, non-touching circles. Once premises are drawn, a conclusion is valid only if it holds true in every possible diagram consistent with the premises — not just the first diagram you happen to draw.`,
              externalLinks: [
                { label: 'Number Series Practice', url: 'https://www.geeksforgeeks.org/number-series-reasoning/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Verbal Ability & Reading Comprehension',
      description: 'Vocabulary, grammar, sentence correction, and comprehension strategy under time pressure.',
      order: 3,
      difficulty: 'beginner',
      estimatedMinutes: 25,
      tracks: [
        {
          name: 'Deep Analysis',
          chapters: [
            {
              title: 'Introduction',
              isFreePreview: true,
              estimatedMinutes: 8,
              content: `Verbal ability sections test reading speed, grammatical precision, and vocabulary range under a tight time budget, which means strategy (where to spend time) matters as much as raw language skill.

Reading comprehension: passages are typically followed by 4-6 questions mixing direct fact-lookup, inference, vocabulary-in-context, and main-idea questions. The efficient approach is skimming the passage first for structure (what is each paragraph doing) before reading questions, rather than reading every word carefully on a first pass — most time is wasted re-reading the whole passage repeatedly per question.

Sentence correction / error spotting: identifying grammatical errors in a given sentence, commonly testing subject-verb agreement, tense consistency, parallel structure, and pronoun-antecedent agreement. These questions reward pattern recognition over deep grammar theory — most errors fall into a small number of recurring categories.

Vocabulary (synonyms/antonyms, fill-in-the-blanks): tests both raw vocabulary range and the ability to use context clues to infer a word's meaning even without having seen it before — context-based elimination of obviously wrong options is usually faster than trying to recall an exact dictionary definition under pressure.

Para-jumbles (sentence rearrangement): given 4-5 jumbled sentences, determine the correct logical order. The reliable technique is identifying the opening sentence (usually the one introducing a general subject, with no pronoun referring back to something earlier) and any clear pairs (a sentence containing "this" or "it" that clearly refers to a specific preceding sentence).`,
              codeSnippets: [],
            },
            {
              title: 'Features & Use Cases',
              isFreePreview: false,
              estimatedMinutes: 10,
              content: `Specific recurring error categories and comprehension strategies worth drilling, since most verbal sections repeat the same handful of question patterns.

Subject-verb agreement edge cases: the most commonly tested edge cases are sentences with intervening phrases ("The list of items is long" — "list" is singular, so "is," not "are," despite "items" appearing right before the verb), and collective nouns that can be singular or plural depending on context ("The committee has decided" vs "The committee have different opinions" — usage varies by region/style guide, but most standard tests treat collective nouns as singular by default).

Parallel structure: items in a list or comparison must share the same grammatical form — "She likes reading, writing, and to swim" is wrong because the first two are gerunds and the third is an infinitive; the corrected form is "reading, writing, and swimming."

Modifier placement: a misplaced modifier attaches to the wrong noun and creates an unintended (often unintentionally funny) meaning — "Walking down the street, the trees looked beautiful" technically implies the trees were walking, since the modifying phrase should attach to the subject immediately following it.

Reading comprehension question-type strategy: "main idea" questions are answered by the passage's overall argument, not by any single supporting detail — a frequent wrong-answer trap is choosing an option that's true and stated in the passage but is a supporting detail rather than the central point. "Inference" questions require an answer that must be true given the passage, not merely plausible or consistent with it — the distinction between "definitely follows" and "could also be true" is exactly what these questions are testing.

Vocabulary-in-context strategy: when a word is unfamiliar, substitute each answer option back into the original sentence and check which one preserves the sentence's logical flow and tone — this context-substitution approach works even for genuinely unknown words, since the surrounding sentence usually constrains the meaning enough to eliminate 2-3 of the 4 options.`,
              externalLinks: [
                { label: 'Verbal Ability Practice', url: 'https://www.geeksforgeeks.org/verbal-ability-questions-and-answers/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
        {
          name: 'Data Research',
          chapters: [
            {
              title: 'Common Error Patterns Reference',
              isFreePreview: true,
              estimatedMinutes: 9,
              content: `A condensed reference of the grammar and usage errors that appear most frequently in error-spotting and sentence-correction questions.

Tense consistency: a sentence describing a single continuous event or narrative should not randomly shift tense mid-sentence — "He walked to the store and buys milk" mixes past and present incorrectly; both verbs should match the established tense.

Comparative and superlative misuse: "more better" and "most fastest" double up a comparative/superlative marker that's already built into the word — "better" and "fastest" are already comparative/superlative forms and don't need "more" or "most" added.

Preposition errors with fixed idiomatic pairs: certain verbs and adjectives pair with specific, fixed prepositions in standard usage ("married to," not "married with"; "capable of," not "capable to") — these are memorization-heavy since they don't follow a general grammatical rule, just established usage.

Redundancy (pleonasm): phrases that repeat the same meaning unnecessarily — "return back," "free gift," "each and every" — are commonly flagged as errors in error-spotting questions, since the redundant word adds no new information.

Countable vs uncountable noun agreement: "less" pairs with uncountable nouns ("less water"), "fewer" pairs with countable nouns ("fewer items") — a distinction frequently tested and frequently violated even in everyday native usage, which is exactly why it shows up often on formal grammar tests.

Practicing against real previous-year question sets (available on GeeksforGeeks' aptitude section and most placement-prep platforms) tends to be more useful than studying grammar rules in isolation, since recognizing the error pattern fast is the actual skill being timed.`,
              externalLinks: [
                { label: 'Grammar Error Spotting', url: 'https://www.geeksforgeeks.org/error-spotting/', source: 'geeksforgeeks' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = aptitude;
