/**
 * Roadmap Seed Script
 * Run: node server/src/seed/roadmapSeed.js
 *
 * Seeds DomainConfig for 25+ educational domains.
 * SAFE: only inserts/updates — never deletes existing data.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const DomainConfig = require('../modules/roadmap/models/DomainConfig');
const LearningResource = require('../modules/roadmap/models/LearningResource');

const DOMAINS = [
  // ── Engineering ──────────────────────────────────────────────────────────
  {
    key: 'engineering.cse', displayName: 'Computer Science Engineering', parentDomain: 'engineering', icon: '💻', sortOrder: 1,
    careerGoals: [
      { key: 'software_engineer', label: 'Software Engineer', roadmapType: 'placement', prioritySkills: ['dsa', 'os', 'dbms', 'system_design'] },
      { key: 'data_scientist', label: 'Data Scientist', roadmapType: 'skill', prioritySkills: ['python', 'ml', 'statistics', 'sql'] },
      { key: 'devops_engineer', label: 'DevOps Engineer', roadmapType: 'certification', prioritySkills: ['linux', 'docker', 'ci_cd', 'cloud'] },
      { key: 'product_manager', label: 'Product Manager', roadmapType: 'skill', prioritySkills: ['product_thinking', 'analytics', 'communication'] },
      { key: 'higher_studies', label: 'Higher Studies (MS/MTech)', roadmapType: 'higher_studies', prioritySkills: ['research', 'mathematics', 'algorithms'] },
    ],
    requiredSkills: [
      { key: 'dsa', label: 'Data Structures & Algorithms', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'os', label: 'Operating Systems', category: 'core', assessable: true, proficiencyThreshold: 60 },
      { key: 'dbms', label: 'Database Management', category: 'core', assessable: true, proficiencyThreshold: 60 },
      { key: 'networking', label: 'Computer Networks', category: 'core', assessable: true, proficiencyThreshold: 55 },
      { key: 'programming', label: 'Programming (Java/Python/C++)', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'system_design', label: 'System Design', category: 'advanced', assessable: true, proficiencyThreshold: 55 },
      { key: 'communication', label: 'Communication Skills', category: 'soft', assessable: false, proficiencyThreshold: 60 },
    ],
    certifications: ['AWS Certified Developer', 'Google Cloud Associate', 'Meta Front-End Developer'],
    industryKeywords: ['SDE', 'FAANG', 'startup', 'full-stack', 'backend'],
  },
  {
    key: 'engineering.it', displayName: 'Information Technology', parentDomain: 'engineering', icon: '🌐', sortOrder: 2,
    careerGoals: [
      { key: 'it_manager', label: 'IT Manager', roadmapType: 'skill' },
      { key: 'network_engineer', label: 'Network Engineer', roadmapType: 'certification' },
      { key: 'cybersecurity', label: 'Cybersecurity Analyst', roadmapType: 'certification' },
      { key: 'cloud_architect', label: 'Cloud Architect', roadmapType: 'certification' },
    ],
    requiredSkills: [
      { key: 'networking', label: 'Computer Networks', category: 'core', assessable: true },
      { key: 'linux', label: 'Linux Administration', category: 'core', assessable: true },
      { key: 'security', label: 'Information Security', category: 'core', assessable: true },
      { key: 'cloud', label: 'Cloud Computing', category: 'core', assessable: true },
      { key: 'programming', label: 'Programming Basics', category: 'core', assessable: true },
    ],
    certifications: ['CCNA', 'CompTIA Security+', 'AWS Solutions Architect', 'CEH'],
  },
  {
    key: 'engineering.ai_ds', displayName: 'AI & Data Science', parentDomain: 'engineering', icon: '🤖', sortOrder: 3,
    careerGoals: [
      { key: 'ml_engineer', label: 'ML Engineer', roadmapType: 'skill' },
      { key: 'data_scientist', label: 'Data Scientist', roadmapType: 'skill' },
      { key: 'ai_researcher', label: 'AI Researcher', roadmapType: 'research' },
      { key: 'nlp_engineer', label: 'NLP Engineer', roadmapType: 'skill' },
    ],
    requiredSkills: [
      { key: 'python', label: 'Python Programming', category: 'core', assessable: true },
      { key: 'ml', label: 'Machine Learning', category: 'core', assessable: true },
      { key: 'statistics', label: 'Statistics & Probability', category: 'core', assessable: true },
      { key: 'deep_learning', label: 'Deep Learning', category: 'advanced', assessable: true },
      { key: 'sql', label: 'SQL & Databases', category: 'core', assessable: true },
      { key: 'data_visualization', label: 'Data Visualization', category: 'core', assessable: false },
    ],
    certifications: ['TensorFlow Developer', 'IBM Data Science', 'Google ML Engineer'],
  },
  {
    key: 'engineering.mechanical', displayName: 'Mechanical Engineering', parentDomain: 'engineering', icon: '⚙️', sortOrder: 4,
    careerGoals: [
      { key: 'design_engineer', label: 'Design Engineer', roadmapType: 'skill' },
      { key: 'automobile_engineer', label: 'Automobile Engineer', roadmapType: 'skill' },
      { key: 'gate_me', label: 'GATE (Mechanical)', roadmapType: 'exam' },
      { key: 'core_manufacturing', label: 'Manufacturing Engineer', roadmapType: 'placement' },
    ],
    requiredSkills: [
      { key: 'thermodynamics', label: 'Thermodynamics', category: 'core', assessable: true },
      { key: 'fluid_mechanics', label: 'Fluid Mechanics', category: 'core', assessable: true },
      { key: 'machine_design', label: 'Machine Design', category: 'core', assessable: true },
      { key: 'manufacturing', label: 'Manufacturing Processes', category: 'core', assessable: true },
      { key: 'cad', label: 'CAD/CAM (AutoCAD, SolidWorks)', category: 'skill', assessable: false },
      { key: 'strength_materials', label: 'Strength of Materials', category: 'core', assessable: true },
    ],
    certifications: ['SolidWorks CSWA', 'AutoCAD Certified', 'Six Sigma Green Belt'],
  },
  {
    key: 'engineering.civil', displayName: 'Civil Engineering', parentDomain: 'engineering', icon: '🏗️', sortOrder: 5,
    careerGoals: [
      { key: 'structural_engineer', label: 'Structural Engineer', roadmapType: 'placement' },
      { key: 'urban_planner', label: 'Urban Planner', roadmapType: 'skill' },
      { key: 'gate_civil', label: 'GATE (Civil)', roadmapType: 'exam' },
      { key: 'psc_ae', label: 'PSC/SSC AE', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'structural_analysis', label: 'Structural Analysis', category: 'core', assessable: true },
      { key: 'rcc_design', label: 'RCC Design', category: 'core', assessable: true },
      { key: 'soil_mechanics', label: 'Soil Mechanics', category: 'core', assessable: true },
      { key: 'surveying', label: 'Surveying', category: 'core', assessable: true },
      { key: 'fluid_hydraulics', label: 'Fluid Mechanics & Hydraulics', category: 'core', assessable: true },
      { key: 'construction_management', label: 'Construction Management', category: 'advanced', assessable: false },
    ],
    certifications: ['AutoCAD Civil 3D', 'PMP', 'STAAD.Pro'],
  },
  {
    key: 'engineering.electrical', displayName: 'Electrical Engineering', parentDomain: 'engineering', icon: '⚡', sortOrder: 6,
    careerGoals: [
      { key: 'power_engineer', label: 'Power Systems Engineer', roadmapType: 'placement' },
      { key: 'embedded_engineer', label: 'Embedded Systems Engineer', roadmapType: 'skill' },
      { key: 'gate_ee', label: 'GATE (EE)', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'circuit_theory', label: 'Circuit Theory', category: 'core', assessable: true },
      { key: 'power_systems', label: 'Power Systems', category: 'core', assessable: true },
      { key: 'control_systems', label: 'Control Systems', category: 'core', assessable: true },
      { key: 'electronics', label: 'Electronics', category: 'core', assessable: true },
      { key: 'signal_processing', label: 'Signal Processing', category: 'advanced', assessable: true },
    ],
    certifications: ['IEEE Certifications', 'PLC Programming', 'ETAP'],
  },

  // ── Medical ──────────────────────────────────────────────────────────────
  {
    key: 'medical.mbbs', displayName: 'MBBS (Bachelor of Medicine)', parentDomain: 'medical', icon: '🩺', sortOrder: 10,
    careerGoals: [
      { key: 'neet_pg', label: 'NEET PG (MD/MS)', roadmapType: 'exam', prioritySkills: ['medicine', 'surgery', 'pathology', 'pharmacology', 'anatomy'] },
      { key: 'general_physician', label: 'General Physician', roadmapType: 'skill' },
      { key: 'medical_researcher', label: 'Medical Researcher', roadmapType: 'research' },
      { key: 'hospital_admin', label: 'Hospital Administrator', roadmapType: 'skill' },
    ],
    requiredSkills: [
      { key: 'anatomy', label: 'Human Anatomy', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'physiology', label: 'Physiology', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'biochemistry', label: 'Biochemistry', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'pharmacology', label: 'Pharmacology', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'pathology', label: 'Pathology', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'medicine', label: 'Internal Medicine', category: 'clinical', assessable: true, proficiencyThreshold: 70 },
      { key: 'surgery', label: 'General Surgery', category: 'clinical', assessable: true, proficiencyThreshold: 65 },
      { key: 'clinical_skills', label: 'Clinical Skills', category: 'practical', assessable: false },
    ],
    certifications: ['USMLE (for USA)', 'PLAB (for UK)', 'Dip NB'],
    examPattern: { name: 'NEET PG', totalQuestions: 200, duration: '3.5 hours', subjects: ['Medicine', 'Surgery', 'OBG', 'Pediatrics', 'Psychiatry', 'Radiology'] },
  },
  {
    key: 'medical.bds', displayName: 'BDS (Bachelor of Dental Surgery)', parentDomain: 'medical', icon: '🦷', sortOrder: 11,
    careerGoals: [
      { key: 'dentist', label: 'General Dentist', roadmapType: 'skill' },
      { key: 'oral_surgeon', label: 'Oral Surgeon', roadmapType: 'exam' },
      { key: 'neet_mds', label: 'NEET MDS', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'oral_anatomy', label: 'Oral Anatomy', category: 'core', assessable: true },
      { key: 'dental_materials', label: 'Dental Materials', category: 'core', assessable: true },
      { key: 'oral_pathology', label: 'Oral Pathology', category: 'core', assessable: true },
      { key: 'prosthodontics', label: 'Prosthodontics', category: 'clinical', assessable: true },
      { key: 'endodontics', label: 'Endodontics', category: 'clinical', assessable: true },
    ],
  },
  {
    key: 'medical.nursing', displayName: 'Nursing (BSc/GNM)', parentDomain: 'medical', icon: '👩‍⚕️', sortOrder: 12,
    careerGoals: [
      { key: 'staff_nurse', label: 'Staff Nurse', roadmapType: 'placement' },
      { key: 'nurse_practitioner', label: 'Nurse Practitioner', roadmapType: 'higher_studies' },
      { key: 'aiims_nursing', label: 'AIIMS Nursing Exam', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'anatomy_nursing', label: 'Anatomy & Physiology', category: 'core', assessable: true },
      { key: 'pharmacology_nursing', label: 'Pharmacology', category: 'core', assessable: true },
      { key: 'medical_surgical', label: 'Medical Surgical Nursing', category: 'clinical', assessable: true },
      { key: 'child_health', label: 'Child Health Nursing', category: 'clinical', assessable: true },
    ],
  },

  // ── Pharmacy ─────────────────────────────────────────────────────────────
  {
    key: 'pharmacy', displayName: 'Pharmacy (B.Pharm/D.Pharm)', parentDomain: 'pharmacy', icon: '💊', sortOrder: 15,
    careerGoals: [
      { key: 'pharmacist', label: 'Community Pharmacist', roadmapType: 'placement' },
      { key: 'clinical_pharmacist', label: 'Clinical Pharmacist', roadmapType: 'skill' },
      { key: 'drug_researcher', label: 'Drug Researcher', roadmapType: 'research' },
      { key: 'gpat', label: 'GPAT (M.Pharm)', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'pharmaceutics', label: 'Pharmaceutics', category: 'core', assessable: true },
      { key: 'pharma_chemistry', label: 'Pharmaceutical Chemistry', category: 'core', assessable: true },
      { key: 'pharmacology', label: 'Pharmacology', category: 'core', assessable: true },
      { key: 'pharmacognosy', label: 'Pharmacognosy', category: 'core', assessable: true },
    ],
  },

  // ── Law ──────────────────────────────────────────────────────────────────
  {
    key: 'law.llb', displayName: 'LLB (Bachelor of Laws)', parentDomain: 'law', icon: '⚖️', sortOrder: 20,
    careerGoals: [
      { key: 'corporate_lawyer', label: 'Corporate Lawyer', roadmapType: 'placement', prioritySkills: ['contract_law', 'corporate_law', 'legal_drafting'] },
      { key: 'criminal_lawyer', label: 'Criminal Lawyer', roadmapType: 'skill' },
      { key: 'judge', label: 'Judicial Services', roadmapType: 'exam' },
      { key: 'clat_pg', label: 'CLAT PG / LLM Entrance', roadmapType: 'exam' },
      { key: 'civil_services', label: 'Civil Services (IAS/IPS)', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'constitutional_law', label: 'Constitutional Law', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'contract_law', label: 'Law of Contracts', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'criminal_law', label: 'Criminal Law (IPC/CrPC)', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'corporate_law', label: 'Corporate Law', category: 'specialized', assessable: true, proficiencyThreshold: 65 },
      { key: 'legal_reasoning', label: 'Legal Reasoning', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'legal_drafting', label: 'Legal Drafting', category: 'skill', assessable: false },
      { key: 'jurisprudence', label: 'Jurisprudence', category: 'core', assessable: true },
    ],
    certifications: ['Bar Council Enrollment', 'Diploma in Corporate Law', 'Arbitration Certification'],
    examPattern: { name: 'Judicial Services', subjects: ['Constitutional Law', 'CPC', 'CrPC', 'IPC', 'Evidence Act', 'Transfer of Property'] },
  },
  {
    key: 'law.llm', displayName: 'LLM (Master of Laws)', parentDomain: 'law', icon: '📜', sortOrder: 21,
    careerGoals: [
      { key: 'legal_consultant', label: 'Legal Consultant', roadmapType: 'skill' },
      { key: 'academician', label: 'Law Professor/Researcher', roadmapType: 'research' },
      { key: 'international_law', label: 'International Law Expert', roadmapType: 'higher_studies' },
    ],
    requiredSkills: [
      { key: 'research_methodology', label: 'Legal Research Methodology', category: 'core', assessable: true },
      { key: 'comparative_law', label: 'Comparative Law', category: 'core', assessable: true },
      { key: 'international_law', label: 'International Law', category: 'advanced', assessable: true },
    ],
  },

  // ── MBA/BBA ──────────────────────────────────────────────────────────────
  {
    key: 'mba', displayName: 'MBA (Master of Business Administration)', parentDomain: 'business', icon: '📊', sortOrder: 25,
    careerGoals: [
      { key: 'product_manager', label: 'Product Manager', roadmapType: 'placement', prioritySkills: ['product_thinking', 'analytics', 'market_research'] },
      { key: 'management_consultant', label: 'Management Consultant', roadmapType: 'placement' },
      { key: 'finance_manager', label: 'Finance Manager', roadmapType: 'placement' },
      { key: 'entrepreneur', label: 'Entrepreneur', roadmapType: 'entrepreneurship' },
      { key: 'cat_prep', label: 'CAT/GMAT Preparation', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'finance', label: 'Financial Management', category: 'core', assessable: true },
      { key: 'marketing', label: 'Marketing Management', category: 'core', assessable: true },
      { key: 'operations', label: 'Operations Management', category: 'core', assessable: true },
      { key: 'business_analytics', label: 'Business Analytics', category: 'core', assessable: true },
      { key: 'strategy', label: 'Business Strategy', category: 'advanced', assessable: true },
      { key: 'case_study', label: 'Case Study Analysis', category: 'skill', assessable: true },
      { key: 'excel_sql', label: 'Excel & SQL', category: 'tool', assessable: true },
      { key: 'communication', label: 'Communication & Presentation', category: 'soft', assessable: false },
    ],
    certifications: ['CFA Level 1', 'CPA', 'PMP', 'Six Sigma', 'Google Analytics'],
  },
  {
    key: 'bba', displayName: 'BBA (Bachelor of Business Administration)', parentDomain: 'business', icon: '🏢', sortOrder: 26,
    careerGoals: [
      { key: 'business_analyst', label: 'Business Analyst', roadmapType: 'placement' },
      { key: 'marketing_executive', label: 'Marketing Executive', roadmapType: 'placement' },
      { key: 'mba_entrance', label: 'MBA Entrance (CAT/XAT)', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'accounting', label: 'Accounting Fundamentals', category: 'core', assessable: true },
      { key: 'marketing_basics', label: 'Marketing Basics', category: 'core', assessable: true },
      { key: 'economics', label: 'Economics', category: 'core', assessable: true },
      { key: 'quantitative_aptitude', label: 'Quantitative Aptitude', category: 'core', assessable: true },
    ],
  },

  // ── Commerce ─────────────────────────────────────────────────────────────
  {
    key: 'commerce.ca', displayName: 'Chartered Accountancy (CA)', parentDomain: 'commerce', icon: '📒', sortOrder: 30,
    careerGoals: [
      { key: 'chartered_accountant', label: 'Chartered Accountant', roadmapType: 'exam' },
      { key: 'auditor', label: 'Auditor', roadmapType: 'certification' },
      { key: 'tax_consultant', label: 'Tax Consultant', roadmapType: 'skill' },
    ],
    requiredSkills: [
      { key: 'accountancy', label: 'Advanced Accountancy', category: 'core', assessable: true },
      { key: 'taxation', label: 'Direct & Indirect Taxes', category: 'core', assessable: true },
      { key: 'audit', label: 'Audit & Assurance', category: 'core', assessable: true },
      { key: 'corporate_law_ca', label: 'Corporate & Economic Law', category: 'core', assessable: true },
      { key: 'financial_management', label: 'Financial Management', category: 'core', assessable: true },
    ],
    examPattern: { name: 'CA Final', stages: ['Foundation', 'Inter', 'Final'], totalAttempts: 'Multiple' },
  },

  // ── Arts & Science ───────────────────────────────────────────────────────
  {
    key: 'arts.general', displayName: 'Arts (BA/MA)', parentDomain: 'arts', icon: '🎨', sortOrder: 40,
    careerGoals: [
      { key: 'civil_services', label: 'Civil Services (UPSC)', roadmapType: 'exam' },
      { key: 'journalist', label: 'Journalist/Writer', roadmapType: 'skill' },
      { key: 'professor', label: 'Professor/Academic', roadmapType: 'research' },
      { key: 'social_worker', label: 'Social Worker/NGO', roadmapType: 'skill' },
    ],
    requiredSkills: [
      { key: 'critical_thinking', label: 'Critical Thinking & Analysis', category: 'core', assessable: true },
      { key: 'writing', label: 'Writing & Communication', category: 'core', assessable: false },
      { key: 'research_skills', label: 'Research Skills', category: 'core', assessable: false },
      { key: 'general_studies', label: 'General Studies', category: 'core', assessable: true },
    ],
  },
  {
    key: 'science.general', displayName: 'Science (BSc/MSc)', parentDomain: 'science', icon: '🔬', sortOrder: 41,
    careerGoals: [
      { key: 'researcher', label: 'Research Scientist', roadmapType: 'research' },
      { key: 'professor', label: 'Professor', roadmapType: 'higher_studies' },
      { key: 'gate_science', label: 'GATE/JAM/CSIR-NET', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'core_science', label: 'Core Subject Mastery', category: 'core', assessable: true },
      { key: 'lab_skills', label: 'Laboratory Skills', category: 'practical', assessable: false },
      { key: 'research_methodology', label: 'Research Methodology', category: 'advanced', assessable: true },
    ],
  },

  // ── Government Exams / UPSC ──────────────────────────────────────────────
  {
    key: 'upsc', displayName: 'UPSC Civil Services', parentDomain: 'government', icon: '🇮🇳', sortOrder: 50,
    careerGoals: [
      { key: 'ias_officer', label: 'IAS Officer', roadmapType: 'exam', prioritySkills: ['history', 'polity', 'economy', 'geography', 'current_affairs'] },
      { key: 'ips_officer', label: 'IPS Officer', roadmapType: 'exam' },
      { key: 'ifs_officer', label: 'IFS Officer', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'history', label: 'History (Ancient/Medieval/Modern)', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'polity', label: 'Indian Polity & Constitution', category: 'core', assessable: true, proficiencyThreshold: 70 },
      { key: 'economy', label: 'Indian Economy', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'geography', label: 'Geography (India & World)', category: 'core', assessable: true, proficiencyThreshold: 65 },
      { key: 'current_affairs', label: 'Current Affairs', category: 'core', assessable: true, proficiencyThreshold: 60 },
      { key: 'ethics', label: 'Ethics & Integrity (GS-4)', category: 'core', assessable: true },
      { key: 'essay_writing', label: 'Essay Writing', category: 'skill', assessable: false },
      { key: 'optional_subject', label: 'Optional Subject', category: 'specialized', assessable: false },
    ],
    examPattern: { name: 'UPSC CSE', stages: ['Prelims', 'Mains', 'Interview'], totalQuestions: { prelims: '100+80 GS', mains: '9 papers' } },
  },
  {
    key: 'govt_exam', displayName: 'Government Exams (SSC/Bank/Railway)', parentDomain: 'government', icon: '🏛️', sortOrder: 51,
    careerGoals: [
      { key: 'bank_po', label: 'Bank PO/SO', roadmapType: 'exam' },
      { key: 'ssc_cgl', label: 'SSC CGL', roadmapType: 'exam' },
      { key: 'railway', label: 'Railway Officer (RRB)', roadmapType: 'exam' },
      { key: 'defence', label: 'Defence (NDA/CDS)', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'quantitative_aptitude', label: 'Quantitative Aptitude', category: 'core', assessable: true },
      { key: 'reasoning', label: 'Logical Reasoning', category: 'core', assessable: true },
      { key: 'english', label: 'English Language', category: 'core', assessable: true },
      { key: 'general_awareness', label: 'General Awareness', category: 'core', assessable: true },
      { key: 'computer_awareness', label: 'Computer Awareness', category: 'core', assessable: true },
    ],
  },

  // ── Research ─────────────────────────────────────────────────────────────
  {
    key: 'research', displayName: 'Research & PhD', parentDomain: 'research', icon: '🔭', sortOrder: 55,
    careerGoals: [
      { key: 'phd', label: 'PhD Scholar', roadmapType: 'research' },
      { key: 'post_doc', label: 'Post Doctoral Researcher', roadmapType: 'research' },
      { key: 'professor', label: 'University Professor', roadmapType: 'higher_studies' },
    ],
    requiredSkills: [
      { key: 'research_design', label: 'Research Design & Methodology', category: 'core', assessable: true },
      { key: 'literature_review', label: 'Literature Review', category: 'core', assessable: false },
      { key: 'statistics_research', label: 'Statistical Analysis', category: 'core', assessable: true },
      { key: 'academic_writing', label: 'Academic Writing', category: 'skill', assessable: false },
    ],
  },

  // ── Agriculture ──────────────────────────────────────────────────────────
  {
    key: 'agriculture', displayName: 'Agriculture (BSc Agri)', parentDomain: 'agriculture', icon: '🌾', sortOrder: 60,
    careerGoals: [
      { key: 'agronomist', label: 'Agronomist', roadmapType: 'placement' },
      { key: 'icar_jrf', label: 'ICAR JRF / SRF', roadmapType: 'exam' },
      { key: 'agri_officer', label: 'Agriculture Officer', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'agronomy', label: 'Agronomy', category: 'core', assessable: true },
      { key: 'plant_pathology', label: 'Plant Pathology', category: 'core', assessable: true },
      { key: 'soil_science', label: 'Soil Science', category: 'core', assessable: true },
      { key: 'entomology', label: 'Agricultural Entomology', category: 'core', assessable: true },
    ],
  },

  // ── Design ───────────────────────────────────────────────────────────────
  {
    key: 'design', displayName: 'Design (B.Des/M.Des)', parentDomain: 'design', icon: '✏️', sortOrder: 65,
    careerGoals: [
      { key: 'ux_designer', label: 'UX/UI Designer', roadmapType: 'placement' },
      { key: 'graphic_designer', label: 'Graphic Designer', roadmapType: 'placement' },
      { key: 'nid_nift', label: 'NID/NIFT Entrance', roadmapType: 'exam' },
    ],
    requiredSkills: [
      { key: 'visual_communication', label: 'Visual Communication', category: 'core', assessable: false },
      { key: 'ux_research', label: 'UX Research', category: 'core', assessable: true },
      { key: 'design_tools', label: 'Design Tools (Figma/Adobe)', category: 'skill', assessable: false },
      { key: 'design_thinking', label: 'Design Thinking', category: 'core', assessable: true },
    ],
  },

  // ── Architecture ─────────────────────────────────────────────────────────
  {
    key: 'architecture', displayName: 'Architecture (B.Arch)', parentDomain: 'architecture', icon: '🏛️', sortOrder: 66,
    careerGoals: [
      { key: 'architect', label: 'Architect', roadmapType: 'placement' },
      { key: 'nata_prep', label: 'NATA/JEE Paper 2', roadmapType: 'exam' },
      { key: 'urban_designer', label: 'Urban Designer', roadmapType: 'skill' },
    ],
    requiredSkills: [
      { key: 'building_construction', label: 'Building Construction', category: 'core', assessable: true },
      { key: 'history_arch', label: 'History of Architecture', category: 'core', assessable: true },
      { key: 'structures', label: 'Structures in Architecture', category: 'core', assessable: true },
      { key: 'drafting', label: 'Architectural Drawing/CAD', category: 'skill', assessable: false },
    ],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
  console.log('[Seed] Connected to MongoDB');

  let created = 0, updated = 0;
  for (const domainData of DOMAINS) {
    const result = await DomainConfig.findOneAndUpdate(
      { key: domainData.key },
      { $set: domainData },
      { upsert: true, new: true }
    );
    if (result.createdAt?.getTime() === result.updatedAt?.getTime()) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`[Seed] Domains: ${created} created, ${updated} updated`);
  console.log(`[Seed] Total domains seeded: ${DOMAINS.length}`);

  await mongoose.disconnect();
  console.log('[Seed] Done. ✅');
}

run().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
