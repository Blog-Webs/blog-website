const axios = require('axios');

// JSearch via RapidAPI — set JSEARCH_API_KEY in server .env
const JSEARCH_BASE = 'https://jsearch.p.rapidapi.com/search';
const RAPIDAPI_KEY = process.env.JSEARCH_API_KEY || '';

// Company type to search query keywords
const COMPANY_TYPE_QUERIES = {
  product: 'software engineer product-based company',
  service: 'software engineer service-based IT company',
  fintech: 'software engineer fintech financial technology',
  edutech: 'software engineer edtech education technology',
  manufacturing: 'software engineer manufacturing industrial',
  other: 'software engineer startup tech',
};

const careerController = {
  async getJobs(req, res) {
    const {
      companyType = 'product',
      role = '',
      location = '',
      experience = '',
      page = 1,
    } = req.query;

    const baseQuery = COMPANY_TYPE_QUERIES[companyType] || COMPANY_TYPE_QUERIES.product;
    const searchQuery = [
      role ? role : '',
      baseQuery,
      location ? `in ${location}` : '',
    ].filter(Boolean).join(' ');

    let employmentType = '';
    if (experience === 'intern') employmentType = 'INTERN';
    else if (experience === 'entry') employmentType = 'FULLTIME';
    else if (experience === 'mid') employmentType = 'FULLTIME';
    else if (experience === 'senior') employmentType = 'FULLTIME';

    // If no API key, return curated mock data (production-ready structure)
    if (!RAPIDAPI_KEY) {
      return res.json({ jobs: getMockJobs(companyType, experience), source: 'mock', page: 1, totalPages: 1 });
    }

    try {
      const { data } = await axios.get(JSEARCH_BASE, {
        params: {
          query: searchQuery,
          page: String(page),
          num_pages: '1',
          employment_types: employmentType || undefined,
          remote_jobs_only: location === 'remote' ? 'true' : undefined,
        },
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
        timeout: 8000,
      });

      const jobs = (data.data || []).map((j) => ({
        id: j.job_id,
        title: j.job_title,
        company: j.employer_name,
        companyLogo: j.employer_logo || null,
        location: j.job_city ? `${j.job_city}, ${j.job_country}` : j.job_country,
        isRemote: j.job_is_remote,
        type: j.job_employment_type || 'FULLTIME',
        salary: j.job_min_salary && j.job_max_salary
          ? `$${j.job_min_salary.toLocaleString()} – $${j.job_max_salary.toLocaleString()} / yr`
          : j.job_salary_currency && j.job_salary_period
          ? `Salary info available`
          : 'Not disclosed',
        description: (j.job_description || '').slice(0, 300) + '...',
        applyUrl: j.job_apply_link,
        postedAt: j.job_posted_at_datetime_utc,
        required: j.job_required_skills || [],
        highlights: j.job_highlights?.Qualifications?.slice(0, 3) || [],
        companyType,
      }));

      return res.json({ jobs, source: 'jsearch', page: parseInt(page), totalPages: data.num_pages || 1 });
    } catch (err) {
      console.error('[CareerHub JSearch Error]', err.message);
      // Graceful fallback
      return res.json({ jobs: getMockJobs(companyType, experience), source: 'mock', page: 1, totalPages: 1 });
    }
  },

  async matchResume(req, res) {
    try {
      const AiService = require('../services/AiService');
      const fs = require('fs');

      let resumeText = req.body.resumeText || '';

      if (req.file) {
        try {
          const fileContent = fs.readFileSync(req.file.path, 'utf-8');
          resumeText = fileContent;
          fs.unlink(req.file.path, () => {});
        } catch {}
      }

      if (!resumeText || !resumeText.trim()) {
        return res.status(400).json({ message: 'No resume content provided.' });
      }

      const parsed = await AiService.parseResumeAndMatch(resumeText);
      const targetRole = parsed.recommendedRoles?.[0] || 'Software Engineer';
      const expLevel = parsed.experienceLevel || 'entry';

      // Fetch matched jobs for the extracted profile
      let matchedJobs = getMockJobs('product', expLevel);
      if (RAPIDAPI_KEY) {
        try {
          const { data } = await axios.get(JSEARCH_BASE, {
            params: {
              query: `${targetRole} hiring`,
              num_pages: '1',
              employment_types: expLevel === 'intern' ? 'INTERN' : 'FULLTIME',
            },
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
            },
            timeout: 7000,
          });

          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            matchedJobs = data.data.map((j) => ({
              id: j.job_id,
              title: j.job_title,
              company: j.employer_name,
              companyLogo: j.employer_logo || null,
              location: j.job_city ? `${j.job_city}, ${j.job_country}` : j.job_country || 'Remote',
              isRemote: j.job_is_remote,
              type: j.job_employment_type || 'FULLTIME',
              salary: j.job_min_salary && j.job_max_salary
                ? `$${j.job_min_salary.toLocaleString()} – $${j.job_max_salary.toLocaleString()} / yr`
                : 'Competitive Salary',
              description: (j.job_description || '').slice(0, 300) + '...',
              applyUrl: j.job_apply_link,
              postedAt: j.job_posted_at_datetime_utc,
              required: j.job_required_skills || parsed.skills || [],
              companyType: 'product',
            }));
          }
        } catch (apiErr) {
          console.warn('[JSearch resume matching fallback]', apiErr.message);
        }
      }

      res.json({
        parsed,
        jobs: matchedJobs,
      });
    } catch (err) {
      console.error('[matchResume error]', err);
      res.status(500).json({ message: 'Failed to process resume', error: err.message });
    }
  },
};

function getMockJobs(companyType, experience) {
  const baseJobs = [
    {
      id: 'm-1', title: 'Senior Software Engineer', company: 'Google', companyLogo: null,
      location: 'Bangalore, India', isRemote: false, type: 'FULLTIME',
      salary: '$180,000 – $250,000 / yr', companyType: 'product',
      description: 'Build scalable distributed systems at Google. Work on Search, Ads, or Cloud infrastructure...',
      applyUrl: 'https://careers.google.com', postedAt: new Date().toISOString(),
      required: ['Go', 'Distributed Systems', 'Python'], highlights: ['5+ years experience', 'PhD or Masters preferred'],
    },
    {
      id: 'm-2', title: 'Full Stack Engineer', company: 'Microsoft', companyLogo: null,
      location: 'Remote', isRemote: true, type: 'FULLTIME',
      salary: '$140,000 – $200,000 / yr', companyType: 'product',
      description: 'Join Azure team to build cloud-native web applications and APIs...',
      applyUrl: 'https://careers.microsoft.com', postedAt: new Date().toISOString(),
      required: ['TypeScript', 'React', 'Azure'], highlights: ['3+ years full stack', 'Cloud experience'],
    },
    {
      id: 'm-3', title: 'Software Engineer Intern', company: 'Amazon', companyLogo: null,
      location: 'Hyderabad, India', isRemote: false, type: 'INTERN',
      salary: '₹80,000 / month', companyType: 'product',
      description: 'Summer internship on AWS or Amazon Retail teams. Real ownership, real impact...',
      applyUrl: 'https://amazon.jobs', postedAt: new Date().toISOString(),
      required: ['Java', 'Data Structures', 'OOP'], highlights: ['CS students only', 'Full-time offer possibility'],
    },
    {
      id: 'm-4', title: 'Backend Engineer', company: 'Razorpay', companyLogo: null,
      location: 'Bangalore, India', isRemote: false, type: 'FULLTIME',
      salary: '₹30 – 50 LPA', companyType: 'fintech',
      description: 'Build payment infrastructure handling millions of transactions daily at Razorpay...',
      applyUrl: 'https://razorpay.com/jobs', postedAt: new Date().toISOString(),
      required: ['Node.js', 'PostgreSQL', 'Redis'], highlights: ['2+ years backend', 'Payments domain experience a plus'],
    },
    {
      id: 'm-5', title: 'React Developer', company: 'Byju\'s', companyLogo: null,
      location: 'Remote', isRemote: true, type: 'FULLTIME',
      salary: '₹15 – 25 LPA', companyType: 'edutech',
      description: 'Build interactive learning experiences for millions of students across India...',
      applyUrl: 'https://byjus.com/careers', postedAt: new Date().toISOString(),
      required: ['React', 'JavaScript', 'EdTech'], highlights: ['2+ years frontend', 'Passion for education'],
    },
    {
      id: 'm-6', title: 'DevOps Engineer', company: 'TCS', companyLogo: null,
      location: 'Mumbai, India', isRemote: false, type: 'FULLTIME',
      salary: '₹12 – 20 LPA', companyType: 'service',
      description: 'Manage CI/CD pipelines, Kubernetes clusters and cloud deployments for enterprise clients...',
      applyUrl: 'https://www.tcs.com/careers', postedAt: new Date().toISOString(),
      required: ['Kubernetes', 'Docker', 'Jenkins'], highlights: ['3+ years DevOps', 'AWS/Azure certified preferred'],
    },
    {
      id: 'm-7', title: 'ML Engineer', company: 'PhonePe', companyLogo: null,
      location: 'Pune, India', isRemote: false, type: 'FULLTIME',
      salary: '₹25 – 45 LPA', companyType: 'fintech',
      description: 'Build fraud detection and recommendation systems using ML at PhonePe...',
      applyUrl: 'https://phonepe.com/en-in/careers', postedAt: new Date().toISOString(),
      required: ['Python', 'TensorFlow', 'Spark'], highlights: ['2+ years ML', 'Financial domain preferred'],
    },
    {
      id: 'm-8', title: 'Data Engineer', company: 'Infosys', companyLogo: null,
      location: 'Bengaluru, India', isRemote: false, type: 'FULLTIME',
      salary: '₹10 – 18 LPA', companyType: 'service',
      description: 'Design and maintain data pipelines for Fortune 500 clients worldwide...',
      applyUrl: 'https://www.infosys.com/careers', postedAt: new Date().toISOString(),
      required: ['Spark', 'Kafka', 'SQL'], highlights: ['Freshers welcome', 'Training provided'],
    },
  ];

  return baseJobs.filter(j => !companyType || j.companyType === companyType || companyType === 'other')
    .filter(j => !experience || 
      (experience === 'intern' && j.type === 'INTERN') ||
      (['entry', 'mid', 'senior'].includes(experience) && j.type === 'FULLTIME')
    );
}

module.exports = careerController;