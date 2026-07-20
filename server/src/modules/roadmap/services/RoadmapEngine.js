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
 * RoadmapEngine — Core AI & Fallback roadmap generator.
 * Guaranteed to generate a rich, personalized domain roadmap 100% of the time.
 */
const RoadmapEngine = {
  isAvailable() {
    return true; // Always available via AI or smart domain fallback
  },

  /**
   * Generate a complete roadmap for a student profile.
   * Returns the saved Roadmap document.
   */
  async generate(profile) {
    const domainKey = profile.subDomain || profile.domain || 'general';
    const domainConfig = await DomainRegistry.findByKey(domainKey);
    const { gaps, strengths, gapText } = await GapAnalysisService.analyze(profile);

    let parsed = null;
    const ai = getAI();

    if (ai) {
      try {
        const requiredSkills = domainConfig?.requiredSkills?.map((s) => s.label).join(', ') || '';
        const certifications = domainConfig?.certifications?.slice(0, 5) || [];
        const targetDate = profile.targetExamDate;
        const weeksAvailable = targetDate
          ? Math.max(4, Math.ceil((new Date(targetDate) - Date.now()) / (7 * 24 * 60 * 60 * 1000)))
          : 24;

        const prompt = this._buildPrompt(profile, gaps, strengths, gapText, requiredSkills, certifications, weeksAvailable, domainConfig);
        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const result = await model.generateContent(prompt);
        let raw = result.response.text().trim();
        raw = raw.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
        parsed = JSON.parse(raw);
      } catch (err) {
        console.warn('[RoadmapEngine] AI call failed/timed out, using smart domain fallback:', err.message);
      }
    }

    // Fallback if AI call didn't produce valid output
    if (!parsed || !parsed.phases || parsed.phases.length === 0) {
      parsed = this._generateFallbackRoadmap(profile, domainConfig, gaps, strengths, gapText);
    }

    // Ensure stable IDs and phase unlocking
    for (const phase of parsed.phases || []) {
      for (const topic of phase.topics || []) {
        if (!topic.topicId) topic.topicId = uuidv4();
      }
      phase.isUnlocked = phase.phase === 1;
    }

    // Archive existing active roadmaps for user
    await Roadmap.updateMany({ user: profile.user, status: 'active' }, { status: 'archived' });

    // Save active roadmap to MongoDB
    const roadmap = await Roadmap.create({
      user: profile.user,
      profile: profile._id,
      title: parsed.title || `${profile.careerGoalLabel || 'Career'} Roadmap`,
      type: profile.roadmapType || 'placement',
      domain: domainKey,
      careerGoal: profile.careerGoal,
      status: 'active',
      phases: parsed.phases || [],
      weakAreas: parsed.weakAreas || gaps.slice(0, 5).map((g) => g.skill),
      strongAreas: parsed.strongAreas || strengths.slice(0, 5).map((s) => s.skill),
      gapAnalysis: parsed.gapAnalysis || gapText,
      generatedBy: ai && parsed ? MODEL_NAME : 'smart-fallback-engine',
      generationPrompt: parsed.generationPrompt || '',
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return roadmap;
  },

  /**
   * Regenerate an existing roadmap.
   */
  async regenerate(profile, existingRoadmapId) {
    if (existingRoadmapId) {
      await Roadmap.findByIdAndUpdate(existingRoadmapId, { status: 'archived' });
    }
    return this.generate(profile);
  },

  /**
   * Fallback engine for creating customized domain roadmaps when Gemini API key is unconfigured or unavailable.
   */
  _generateFallbackRoadmap(profile, domainConfig, gaps = [], strengths = [], gapText = '') {
    const domainKey = profile.subDomain || profile.domain || 'general';
    const domainName = domainConfig?.displayName || profile.domain || 'Academic';
    const goalName = profile.careerGoalLabel || profile.careerGoal || 'Career Goal';
    const reqSkills = domainConfig?.requiredSkills || [];

    const skillList = reqSkills.length > 0
      ? reqSkills.map((s) => ({ title: s.label, skillId: s.key }))
      : [
          { title: `${domainName} Fundamentals`, skillId: 'core_1' },
          { title: `${domainName} Core Methods`, skillId: 'core_2' },
          { title: `${domainName} Applied Practice`, skillId: 'core_3' },
          { title: `${domainName} Exam & Industry Preparation`, skillId: 'core_4' },
        ];

    const style = profile.learningStyle || 'mixed';
    const resType = style === 'visual' ? 'video' : style === 'reading' ? 'book' : style === 'practical' ? 'practice' : 'course';

    const phases = [
      {
        phase: 1,
        title: `Phase 1: Foundational ${domainName} Core`,
        description: `Build essential knowledge in ${domainName} and address baseline requirements for ${goalName}.`,
        durationWeeks: 4,
        isUnlocked: true,
        topics: skillList.slice(0, 3).map((s) => ({
          topicId: uuidv4(),
          title: `${s.title} — Foundation & Principles`,
          description: `Master core concepts, terminology, and foundational principles of ${s.title}.`,
          type: 'concept',
          difficulty: 'beginner',
          estimatedHours: Math.round((profile.studyHoursPerDay || 3) * 5),
          isCompleted: false,
          resources: [
            { type: resType, title: `${s.title} Key Concepts Overview`, platform: 'Student OS Hub', url: '' },
            { type: 'article', title: `Essential Guide to ${s.title}`, platform: 'Curated Articles', url: '' },
          ]
        }))
      },
      {
        phase: 2,
        title: `Phase 2: Core Competencies & Practical Application`,
        description: `Apply concepts through problem solving, case studies, and hands-on exercises tailored for ${goalName}.`,
        durationWeeks: 6,
        isUnlocked: false,
        topics: (skillList.slice(3, 6).length > 0 ? skillList.slice(3, 6) : skillList.slice(0, 2)).map((s) => ({
          topicId: uuidv4(),
          title: `Applied ${s.title} & Problem Solving`,
          description: `Work through domain-specific scenarios, practical problems, and methodology application.`,
          type: 'skill',
          difficulty: 'intermediate',
          estimatedHours: Math.round((profile.studyHoursPerDay || 3) * 6),
          isCompleted: false,
          resources: [
            { type: 'practice', title: `${s.title} Problem Set & Exercises`, platform: 'Interactive Practice', url: '' },
            { type: resType, title: `Comprehensive Course on ${s.title}`, platform: 'Student OS Hub', url: '' },
          ]
        }))
      },
      {
        phase: 3,
        title: `Phase 3: Advanced Specialization & Mastery`,
        description: `Deep dive into advanced topics, high-yield examination/career subjects, and specialized tools.`,
        durationWeeks: 6,
        isUnlocked: false,
        topics: [
          {
            topicId: uuidv4(),
            title: `Advanced ${goalName} Specialization`,
            description: `Focus on complex problems, advanced case analysis, and specialized subject areas.`,
            type: 'project',
            difficulty: 'advanced',
            estimatedHours: Math.round((profile.studyHoursPerDay || 3) * 7),
            isCompleted: false,
            resources: [
              { type: 'mock_test', title: `${goalName} Advanced Evaluation`, platform: 'Quiz Engine', url: '' },
            ]
          },
          {
            topicId: uuidv4(),
            title: `Industry / Exam Pattern Mastery`,
            description: `Review past papers, standard exam questions, and industry best practices.`,
            type: 'revision',
            difficulty: 'advanced',
            estimatedHours: Math.round((profile.studyHoursPerDay || 3) * 6),
            isCompleted: false,
            resources: [
              { type: 'book', title: `High-Yield Review Guide for ${goalName}`, platform: 'Textbook Library', url: '' },
            ]
          }
        ]
      },
      {
        phase: 4,
        title: `Phase 4: Placement, Exam & Career Readiness`,
        description: `Final revision, full-length mock tests, portfolio preparation, and career assessment.`,
        durationWeeks: 4,
        isUnlocked: false,
        topics: [
          {
            topicId: uuidv4(),
            title: `Comprehensive ${goalName} Mock Test`,
            description: `Simulated exam/interview evaluation under timed conditions to verify total readiness.`,
            type: 'mock_test',
            difficulty: 'advanced',
            estimatedHours: 12,
            isCompleted: false,
            resources: [
              { type: 'mock_test', title: `Full Readiness Assessment`, platform: 'Student OS Engine', url: '' }
            ]
          },
          {
            topicId: uuidv4(),
            title: `Career Portfolio & Final Review`,
            description: `Finalize certifications, resume highlights, and career presentation materials.`,
            type: 'revision',
            difficulty: 'intermediate',
            estimatedHours: 8,
            isCompleted: false,
            resources: [
              { type: 'article', title: `Career Readiness Checklist`, platform: 'Student OS Hub', url: '' }
            ]
          }
        ]
      }
    ];

    return {
      title: `${domainName} ${goalName} Roadmap`,
      type: profile.roadmapType || 'placement',
      domain: domainKey,
      careerGoal: profile.careerGoal,
      phases,
      weakAreas: gaps.slice(0, 5).map((g) => g.skill),
      strongAreas: strengths.slice(0, 5).map((s) => s.skill),
      gapAnalysis: gapText || `Personalized roadmap generated for ${domainName} targeting ${goalName}. Complete Phase 1 foundational topics to build core skill proficiency.`,
    };
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
