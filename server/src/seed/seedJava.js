/**
 * Dedicated Java Subject & Java Roadmap Seeder
 * Upserts Java Subject tree (Topics, Tracks, Chapters) and Java Roadmap DomainConfig in MongoDB.
 * Run: node server/src/seed/seedJava.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { mkSlug, extractHeadings } = require('./helpers');
const { Subject, Chapter } = require('../models');
const DomainConfig = require('../modules/roadmap/models/DomainConfig');

const javaContent = require('./content/java');

const JAVA_ROADMAP_DOMAIN = {
  key: 'engineering.java_developer',
  displayName: 'Java Backend & Enterprise Developer',
  parentDomain: 'engineering',
  icon: '☕',
  sortOrder: 2,
  careerGoals: [
    { key: 'java_backend_developer', label: 'Java Backend Developer', roadmapType: 'placement', prioritySkills: ['java_basics', 'java_oops', 'java_collections', 'spring_boot', 'sql'] },
    { key: 'enterprise_architect', label: 'Enterprise Java Architect', roadmapType: 'skill', prioritySkills: ['spring_boot', 'microservices', 'multithreading', 'system_design'] },
    { key: 'spring_boot_engineer', label: 'Spring Boot Specialist', roadmapType: 'certification', prioritySkills: ['spring_boot', 'spring_data_jpa', 'rest_apis'] },
  ],
  requiredSkills: [
    { key: 'java_basics', label: 'Java Basics & JVM Architecture', category: 'core', assessable: true, proficiencyThreshold: 70 },
    { key: 'java_oops', label: 'Object-Oriented Programming (OOPs)', category: 'core', assessable: true, proficiencyThreshold: 75 },
    { key: 'java_collections', label: 'Java Collections Framework', category: 'core', assessable: true, proficiencyThreshold: 70 },
    { key: 'stream_api', label: 'Java Stream API & Lambdas', category: 'core', assessable: true, proficiencyThreshold: 65 },
    { key: 'multithreading', label: 'Multithreading & Concurrency', category: 'advanced', assessable: true, proficiencyThreshold: 60 },
    { key: 'spring_boot', label: 'Spring Boot Framework & DI', category: 'core', assessable: true, proficiencyThreshold: 70 },
    { key: 'spring_data_jpa', label: 'Spring Data JPA & Hibernate', category: 'core', assessable: true, proficiencyThreshold: 65 },
  ],
  certifications: ['Oracle Certified Professional (OCP) Java SE', 'Spring Certified Professional'],
  industryKeywords: ['Java', 'Spring Boot', 'Hibernate', 'Microservices', 'JVM', 'REST API'],
};

async function seedJava() {
  await connectDB();
  console.log('🌱 Seeding Java Subject & Java Roadmap into MongoDB...\n');

  // 1. Seed Subject
  const slug = mkSlug(javaContent.subject.name);
  const subject = await Subject.findOneAndUpdate(
    { slug },
    { ...javaContent.subject, slug },
    { upsert: true, new: true }
  );
  console.log(`✅ Subject Upserted: ${subject.name} (ID: ${subject._id})`);

  // Clear existing chapters for this subject to ensure fresh numbers and data
  await Chapter.deleteMany({ subject: subject._id });

  let chapterCount = 0;
  for (const topicData of javaContent.topics) {
    console.log(`  └─ Topic: ${topicData.name}`);
    for (const trackData of topicData.tracks) {
      for (const chapData of trackData.chapters) {
        chapterCount++;
        const chapSlug = mkSlug(chapData.title);
        await Chapter.create({
          subject: subject._id,
          chapterNumber: chapterCount,
          title: chapData.title,
          slug: chapSlug,
          content: chapData.content,
          headings: extractHeadings(chapData.content),
          codeSnippets: chapData.codeSnippets || [],
          isFreePreview: !!chapData.isFreePreview,
          estimatedMinutes: chapData.estimatedMinutes || 15,
          order: chapterCount - 1,
          externalLinks: chapData.externalLinks || [],
        });
      }
    }
  }
  console.log(`\n✅ Created ${chapterCount} Java Chapters in Database.`);

  // 2. Seed Java Roadmap DomainConfig
  const domain = await DomainConfig.findOneAndUpdate(
    { key: JAVA_ROADMAP_DOMAIN.key },
    { $set: JAVA_ROADMAP_DOMAIN },
    { upsert: true, new: true }
  );
  console.log(`✅ Java Roadmap Domain Config Upserted: ${domain.displayName} (${domain.key})`);

  console.log('\n🎉 Java Content & Roadmap seeding complete!');
  await mongoose.disconnect();
}

if (require.main === module) {
  seedJava().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seedJava;
