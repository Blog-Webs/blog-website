const AcademicProfile = require('../models/AcademicProfile');
const { User } = require('../../../models');
const DomainRegistry = require('../services/DomainRegistry');
const RoadmapEngine = require('../services/RoadmapEngine');

/**
 * Onboarding Controller — handles the 4-step onboarding wizard.
 *
 * Each step is a PATCH on the same AcademicProfile document.
 * The profile is created on Step 1, updated on subsequent steps.
 * Step "complete" triggers instant roadmap generation.
 */
const onboardingController = {
  /**
   * GET /api/roadmap/onboarding/status
   * Returns whether the user has completed onboarding and current step.
   */
  async getStatus(req, res) {
    const profile = await AcademicProfile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id).select('onboardingComplete');
    res.json({
      onboardingComplete: user?.onboardingComplete || false,
      currentStep: profile?.onboardingStep || 1,
      profileId: profile?._id || null,
    });
  },

  /**
   * GET /api/roadmap/onboarding/domains
   * Returns available domains for Step 2, grouped by parent.
   */
  async getDomains(req, res) {
    const all = await DomainRegistry.getAll();
    const grouped = {};
    for (const d of all) {
      if (!grouped[d.parentDomain]) grouped[d.parentDomain] = [];
      grouped[d.parentDomain].push({
        key: d.key,
        displayName: d.displayName,
        icon: d.icon,
        description: d.description,
      });
    }
    res.json({ domains: grouped });
  },

  /**
   * GET /api/roadmap/onboarding/career-goals?domain=medical.mbbs
   * Returns career goals for a given domain.
   */
  async getCareerGoals(req, res) {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ message: 'domain is required' });
    const goals = await DomainRegistry.getCareerGoals(domain);
    res.json({ goals });
  },

  /**
   * GET /api/roadmap/onboarding/skills?domain=medical.mbbs
   * Returns assessable skills for Step 4 self-rating.
   */
  async getSkills(req, res) {
    const { domain } = req.query;
    if (!domain) return res.status(400).json({ message: 'domain is required' });
    const skills = await DomainRegistry.getAssessableSkills(domain);
    res.json({ skills });
  },

  /**
   * POST /api/roadmap/onboarding/step1 — Basic Info
   */
  async step1(req, res) {
    const { collegeName, degree, branch, yearOfStudy, semester } = req.body;
    if (!degree?.trim()) return res.status(400).json({ message: 'Degree is required.' });

    let profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new AcademicProfile({ user: req.user._id });
    }

    profile.collegeName = collegeName?.trim() || '';
    profile.degree = degree.trim();
    profile.branch = branch?.trim() || '';
    profile.yearOfStudy = parseInt(yearOfStudy) || 1;
    profile.semester = parseInt(semester) || 1;
    profile.onboardingStep = Math.max(profile.onboardingStep || 1, 2);
    await profile.save();

    res.json({ success: true, step: 1, nextStep: 2, profileId: profile._id });
  },

  /**
   * POST /api/roadmap/onboarding/step2 — Domain Selection
   */
  async step2(req, res) {
    const { domain, subDomain } = req.body;
    if (!domain?.trim()) return res.status(400).json({ message: 'Domain is required.' });

    let profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Please complete Step 1 first.', code: 'STEP_ORDER_ERROR' });

    profile.domain = domain.trim();
    profile.subDomain = (subDomain || domain).trim();
    profile.onboardingStep = Math.max(profile.onboardingStep, 3);
    await profile.save();

    res.json({ success: true, step: 2, nextStep: 3 });
  },

  /**
   * POST /api/roadmap/onboarding/step3 — Career Goal
   */
  async step3(req, res) {
    const { careerGoal, careerGoalLabel, careerGoalCustom, roadmapType, targetExamDate } = req.body;
    if (!careerGoal?.trim()) return res.status(400).json({ message: 'Career goal is required.' });

    let profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Please complete previous steps first.', code: 'STEP_ORDER_ERROR' });

    profile.careerGoal = careerGoal.trim();
    profile.careerGoalLabel = careerGoalLabel?.trim() || careerGoal.trim();
    profile.careerGoalCustom = careerGoalCustom?.trim() || '';
    profile.roadmapType = roadmapType || 'placement';
    if (targetExamDate) profile.targetExamDate = new Date(targetExamDate);
    profile.onboardingStep = Math.max(profile.onboardingStep, 4);
    await profile.save();

    const skills = await DomainRegistry.getAssessableSkills(profile.subDomain || profile.domain);
    res.json({ success: true, step: 3, nextStep: 4, skills });
  },

  /**
   * POST /api/roadmap/onboarding/step4 — Skill Self-Rating + Preferences
   */
  async step4(req, res) {
    const { selfSkillRatings, learningStyle, studyHoursPerDay } = req.body;

    let profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Please complete previous steps first.', code: 'STEP_ORDER_ERROR' });

    if (Array.isArray(selfSkillRatings)) {
      profile.selfSkillRatings = selfSkillRatings.filter(
        (r) => r.skill && ['beginner', 'intermediate', 'advanced'].includes(r.level)
      );
    }
    if (learningStyle) profile.learningStyle = learningStyle;
    if (studyHoursPerDay) profile.studyHoursPerDay = parseFloat(studyHoursPerDay);
    profile.onboardingStep = Math.max(profile.onboardingStep, 5);
    await profile.save();

    res.json({ success: true, step: 4, nextStep: 'complete' });
  },

  /**
   * POST /api/roadmap/onboarding/complete
   * Marks onboarding complete, generates active roadmap instantly.
   */
  async complete(req, res) {
    const profile = await AcademicProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found. Please complete all steps.' });

    // Mark user as onboarded
    await User.findByIdAndUpdate(req.user._id, {
      onboardingComplete: true,
      academicProfile: profile._id,
    });

    profile.onboardingStep = 5;
    await profile.save();

    // Instantly generate roadmap so it's ready when redirected
    let roadmap = null;
    try {
      roadmap = await RoadmapEngine.generate(profile);
      console.log(`[Onboarding] Roadmap generated successfully for user ${req.user._id}`);
    } catch (err) {
      console.error(`[Onboarding] Roadmap generation error:`, err.message);
    }

    res.json({
      success: true,
      message: 'Onboarding complete! Your personalized roadmap is ready.',
      roadmap,
      generating: false,
    });
  },
};

module.exports = onboardingController;
