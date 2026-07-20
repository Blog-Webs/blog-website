const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');
const Roadmap = require('../models/Roadmap');
const DomainRegistry = require('./DomainRegistry');
const GapAnalysisService = require('./GapAnalysisService');

const MODEL_NAME = 'gemini-2.5-flash';

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

/**
 * RoadmapEngine — Core AI engine that generates a personalized roadmap
 * using the student's full profile, gap analysis, and domain knowledge.
 *
 * Design principles:
 * - Never hardcode roadmap content — 100% AI-generated
 * - Domain-aware: Gemini is explicitly told the student's domain
 * - Gap-first: weakest skills appear in the earliest phases
 */
const RoadmapEngine = {
  isAvailable() {
    return !!process.env.GEMINI_API_KEY;
  },

  /**
   * Generate a complete roadmap for a student profile.
   * Returns the saved Roadmap document.
   */
  async generate(profile) {
    const ai = getAI();
    if (!ai) throw new Error('GEMINI_API_KEY is not configured.');

    // 1. Run gap analysis
    const { gaps, strengths, gapText } = await GapAnalysisService.analyze(profile);

    // 2. Load domain knowledge
    const domainKey = profile.subDomain || profile.domain;
    const domainConfig = await DomainRegistry.findByKey(domainKey);
    const requiredSkills = domainConfig?.requiredSkills?.map((s) => s.label).join(', ') || '';
    const certifications = domainConfig?.certifications?.slice(0, 5) || [];

    // 3. Calculate available weeks until target exam
    const targetDate = profile.targetExamDate;
    const weeksAvailable = targetDate
      ? Math.max(4, Math.ceil((new Date(targetDate) - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
      : 24;

    // 4. Build the AI prompt
    const prompt = this._buildPrompt(profile, gaps, strengths, gapText, requiredSkills, certifications, weeksAvailable, domainConfig);

    // 5. Call Gemini
    const model = ai.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent(prompt);
    let raw = result.response.text().trim();
    raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error('AI returned invalid roadmap JSON. Please try again.');
    }

    // 6. Add stable IDs to topics
    for (const phase of parsed.phases || []) {
      for (const topic of phase.topics || []) {
        if (!topic.topicId) topic.topicId = uuidv4();
      }
      // Phase 1 always unlocked
      phase.isUnlocked = phase.phase === 1;
    }

    // 7. Save to MongoDB
    const roadmap = await Roadmap.create({
      user: profile.user,
      profile: profile._id,
      title: parsed.title || `${profile.careerGoalLabel} Roadmap`,
      type: profile.roadmapType || 'placement',
      domain: domainKey,
      careerGoal: profile.careerGoal,
      status: 'active',
      phases: parsed.phases || [],
      weakAreas: parsed.weakAreas || gaps.slice(0, 5).map((g) => g.skill),
      strongAreas: parsed.strongAreas || strengths.slice(0, 5).map((s) => s.skill),
      gapAnalysis: gapText,
      generatedBy: MODEL_NAME,
      generationPrompt: prompt.substring(0, 2000), // store truncated for audit
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return roadmap;
  },

  /**
   * Regenerate an existing roadmap (e.g. after significant profile update).
   */
  async regenerate(profile, existingRoadmapId) {
    // Archive old roadmap
    if (existingRoadmapId) {
      await Roadmap.findByIdAndUpdate(existingRoadmapId, { status: 'archived' });
    }
    return this.generate(profile);
  },

  _buildPrompt(profile, gaps, strengths, gapText, requiredSkills, certifications, weeksAvailable, domainConfig) {
    const gapList = gaps.slice(0, 8).map((g) =>
      `  - ${g.label}: ${g.level} level (score ${g.score}%) — ${g.priority} gap`
    ).join('\n');

    const strengthList = strengths.slice(0, 5).map((s) =>
      `  - ${s.label}: ${s.level} level (score ${s.score}%)`
    ).join('\n');

    const selfRatingList = (profile.selfSkillRatings || []).slice(0, 10).map((r) =>
      `  - ${r.skill}: self-rated ${r.level}`
    ).join('\n');

    const certList = certifications.length
      ? certifications.map((c) => `  - ${typeof c === 'string' ? c : c.name || JSON.stringify(c)}`).join('\n')
      : '  (none specified)';

    return `You are an expert academic career advisor and curriculum designer.

STUDENT PROFILE:
- Degree: ${profile.degree || 'Not specified'}
- Domain: ${domainConfig?.displayName || profile.domain || 'Not specified'}
- Branch/Specialization: ${profile.branch || profile.subDomain || 'Not specified'}
- Year of Study: ${profile.yearOfStudy || 1}, Semester: ${profile.semester || 1}
- College: ${profile.collegeName || 'Not specified'}
- Career Goal: ${profile.careerGoalLabel || profile.careerGoal}
- Roadmap Type: ${profile.roadmapType || 'placement'}
- Learning Style: ${profile.learningStyle || 'mixed'}
- Available Study Time: ${profile.studyHoursPerDay || 3} hours/day
- Total Time Available: ${weeksAvailable} weeks
- Target Date: ${profile.targetExamDate ? new Date(profile.targetExamDate).toDateString() : 'Not specified'}

REQUIRED SKILLS FOR THIS DOMAIN:
${requiredSkills || 'General domain skills'}

SKILL GAP ANALYSIS:
${gapText}

Identified Gaps (prioritized by deficit):
${gapList || '  (No major gaps identified)'}

Strong Areas (accelerate through these):
${strengthList || '  (Not yet assessed)'}

Self-Rated Skills:
${selfRatingList || '  (Not provided)'}

RELEVANT CERTIFICATIONS:
${certList}

TASK: Generate a personalized ${profile.roadmapType || 'career'} roadmap for this student.

CRITICAL RULES:
1. This is a "${domainConfig?.displayName || profile.domain}" student — NEVER include skills/topics from other domains
2. For example: DO NOT suggest DSA, programming, or software skills to medical/law/arts students
3. DO NOT suggest medical/legal topics to engineering students unless explicitly relevant
4. Topics must directly serve the career goal: "${profile.careerGoalLabel || profile.careerGoal}"
5. Structure phases in logical learning progression (foundation → intermediate → advanced → exam/career prep)
6. Phase 1 must address the MOST CRITICAL gaps first
7. Match resource types to learning style: "${profile.learningStyle}" (visual=videos, reading=books/articles, practical=projects/labs)
8. Keep total estimated hours realistic for ${profile.studyHoursPerDay}h/day × ${weeksAvailable} weeks
9. Title should be specific: e.g. "NEET PG Preparation Roadmap" not just "Medical Roadmap"

Return ONLY valid JSON, no markdown, no extra text:
{
  "title": "Specific roadmap title",
  "phases": [
    {
      "phase": 1,
      "title": "Foundation Phase",
      "description": "Brief phase goal",
      "durationWeeks": 4,
      "topics": [
        {
          "topicId": "unique_id_1",
          "title": "Topic name",
          "description": "What to study and why it matters",
          "type": "concept | skill | project | assessment | revision | practice | mock_test",
          "difficulty": "beginner | intermediate | advanced",
          "estimatedHours": 8,
          "resources": [
            {"type": "video | article | book | course | practice | mock_test", "title": "Resource name", "url": "", "platform": "YouTube | PubMed | etc"}
          ]
        }
      ]
    }
  ],
  "weakAreas": ["skill_key1", "skill_key2"],
  "strongAreas": ["skill_key3"],
  "gapAnalysis": "One paragraph gap analysis narrative"
}`;
  },
};

module.exports = RoadmapEngine;
