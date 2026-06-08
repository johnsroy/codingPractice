/**
 * Mentora database seed.
 *
 * Creates realistic demo data:
 *   - 1 admin
 *   - 6 retired professional teachers (varied subjects, grades, bios)
 *   - 8 published courses with lessons
 *   - Several materials with OCR data
 *   - Scheduled and completed class sessions
 *   - 1 guardian with 2 student children
 *   - Sample enrollments and payments
 *
 * Demo credentials are printed at the end.
 * Run: npm run db:seed (from apps/api)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const HASH_ROUNDS = 10;

async function hash(pw: string) {
  return bcrypt.hash(pw, HASH_ROUNDS);
}

async function main() {
  console.log('🌱 Seeding Mentora database...\n');

  // ─── Cleanup (idempotent re-seed) ──────────────────────────────────────────
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleared existing data');

  // ─── Admin ──────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      name: 'Mentora Admin',
      email: 'admin@mentora.app',
      passwordHash: await hash('Admin@1234!'),
      role: 'ADMIN',
      bio: 'Platform administrator.',
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ─── Teachers ────────────────────────────────────────────────────────────────
  const teachers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Margaret Chen',
        email: 'margaret.chen@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Retired MIT Professor | 35 Years in Mathematics Education',
        bio: 'I spent 35 years teaching mathematics at MIT and several top high schools. Now retired, I am passionate about making math accessible and enjoyable for every K-12 learner. My specialty is algebra, geometry, and calculus foundations.',
        subjects: ['math'],
        grades: ['grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12'],
        yearsExperience: 35,
        hourlyRateCents: 8500,
        verified: true,
        proTier: true,
        rating: 4.9,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. James Okafor',
        email: 'james.okafor@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Former NASA Scientist | K-12 Science Educator',
        bio: 'After a fulfilling career at NASA and Johns Hopkins Applied Physics Lab, I have dedicated my retirement to sparking scientific curiosity in young minds. I teach chemistry, physics, and earth science with real-world examples from my research days.',
        subjects: ['science'],
        grades: ['grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10'],
        yearsExperience: 28,
        hourlyRateCents: 9000,
        verified: true,
        proTier: true,
        rating: 4.8,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eleanor Vasquez',
        email: 'eleanor.vasquez@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Retired English Professor | Published Author',
        bio: 'I taught English literature and creative writing at UCLA for 28 years. I have published three novels and two collections of essays. I love helping students discover the power of words and develop their unique voice.',
        subjects: ['english'],
        grades: ['grade-5', 'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12'],
        yearsExperience: 28,
        hourlyRateCents: 7500,
        verified: true,
        proTier: false,
        rating: 4.7,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Robert Tanaka',
        email: 'robert.tanaka@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Retired Software Engineer | CS Education Advocate',
        bio: 'I spent 30 years as a senior engineer at Google and Microsoft. Now I teach computer science, programming fundamentals, and digital literacy to help the next generation thrive in a technology-driven world. Python, web development, and algorithmic thinking are my specialties.',
        subjects: ['computer-science'],
        grades: ['grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10', 'grade-11', 'grade-12'],
        yearsExperience: 30,
        hourlyRateCents: 9500,
        verified: true,
        proTier: true,
        rating: 4.9,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Patricia O\'Brien',
        email: 'patricia.obrien@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Former Smithsonian Curator | History & Social Studies',
        bio: 'I spent 25 years as a curator at the Smithsonian Institution and have authored several books on American and world history. History is not just dates and names — it\'s the story of humanity. I bring primary sources and storytelling to every lesson.',
        subjects: ['history', 'social-studies'],
        grades: ['grade-4', 'grade-5', 'grade-6', 'grade-7', 'grade-8', 'grade-9'],
        yearsExperience: 25,
        hourlyRateCents: 7000,
        verified: true,
        proTier: false,
        rating: 4.6,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dr. Amelia Krishnaswamy',
        email: 'amelia.krishnaswamy@mentora.app',
        passwordHash: await hash('Password123!'),
        role: 'TEACHER',
        headline: 'Retired Linguist | 5 Languages | K-12 Language Arts',
        bio: 'I am a retired professor of linguistics from the University of Chicago. I speak five languages fluently and have designed language learning curricula for schools across three continents. I teach English, Spanish, and academic writing skills.',
        subjects: ['english', 'languages'],
        grades: ['grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'],
        yearsExperience: 22,
        hourlyRateCents: 7000,
        verified: false,
        proTier: false,
        rating: 4.5,
      },
    }),
  ]);

  console.log(`  ✓ ${teachers.length} teachers created`);
  const [margaret, james, eleanor, robert, patricia, amelia] = teachers;

  // ─── Courses ─────────────────────────────────────────────────────────────────
  const courses = await Promise.all([
    // Margaret's math courses
    prisma.course.create({
      data: {
        teacherId: margaret.id,
        title: 'Algebra Fundamentals: From Confusion to Confidence',
        description: 'A comprehensive algebra course designed for students in grades 7-9 who want to build a rock-solid foundation. We cover variables, expressions, equations, inequalities, and graphing — with real-world applications at every step. Professor Chen brings 35 years of classroom experience to make abstract concepts tangible.',
        subjectId: 'math',
        gradeId: 'grade-8',
        priceCents: 4900,
        status: 'published',
        rating: 4.9,
      },
    }),
    prisma.course.create({
      data: {
        teacherId: margaret.id,
        title: 'Pre-Calculus Mastery',
        description: 'Bridge the gap between algebra and calculus. This course covers functions, trigonometry, exponential and logarithmic functions, sequences, and limits. Perfect for grades 10-12 students preparing for AP Calculus or college mathematics.',
        subjectId: 'math',
        gradeId: 'grade-11',
        priceCents: 5900,
        status: 'published',
        rating: 4.8,
      },
    }),

    // James's science courses
    prisma.course.create({
      data: {
        teacherId: james.id,
        title: 'Chemistry Essentials: The Periodic Table and Beyond',
        description: 'Dr. Okafor brings NASA-level scientific thinking to middle school chemistry. We start with atoms and elements, journey through chemical reactions, and explore how chemistry shapes everything from cooking to space exploration. No prior science knowledge needed.',
        subjectId: 'science',
        gradeId: 'grade-8',
        priceCents: 4900,
        status: 'published',
        rating: 4.8,
      },
    }),
    prisma.course.create({
      data: {
        teacherId: james.id,
        title: 'Physics for Curious Minds',
        description: 'Mechanics, energy, waves, and electricity — explained through stories from the real world and Dr. Okafor\'s research at NASA. Designed for grades 9-10, this course prepares students for advanced physics with engaging experiments and demonstrations.',
        subjectId: 'science',
        gradeId: 'grade-9',
        priceCents: 5400,
        status: 'published',
        rating: 4.9,
      },
    }),

    // Eleanor's English courses
    prisma.course.create({
      data: {
        teacherId: eleanor.id,
        title: 'Creative Writing Workshop: Finding Your Voice',
        description: 'Published author Professor Eleanor Vasquez guides students through the art of creative writing. From short stories to personal essays, you will learn narrative structure, character development, dialogue, and revision. Suitable for grades 8-12.',
        subjectId: 'english',
        gradeId: 'grade-9',
        priceCents: 3900,
        status: 'published',
        rating: 4.7,
      },
    }),

    // Robert's CS course
    prisma.course.create({
      data: {
        teacherId: robert.id,
        title: 'Introduction to Python Programming',
        description: 'Learn to code from scratch with a Google/Microsoft veteran. This course teaches Python fundamentals — variables, loops, functions, and basic data structures — through fun projects like games and mini-apps. No prior coding experience needed. Grades 7-10.',
        subjectId: 'computer-science',
        gradeId: 'grade-8',
        priceCents: 4900,
        status: 'published',
        rating: 4.9,
      },
    }),

    // Patricia's history course
    prisma.course.create({
      data: {
        teacherId: patricia.id,
        title: 'American History: The Stories Behind the Dates',
        description: 'History comes alive when you know the people and stories behind the events. Curator Patricia O\'Brien draws on primary sources, rare photographs, and decades of Smithsonian research to bring American history to life for grades 6-8.',
        subjectId: 'history',
        gradeId: 'grade-7',
        priceCents: 3900,
        status: 'published',
        rating: 4.6,
      },
    }),

    // Amelia's language course (free)
    prisma.course.create({
      data: {
        teacherId: amelia.id,
        title: 'Reading Foundations for Early Learners',
        description: 'A warm and patient introduction to reading for grades 1-3. Dr. Krishnaswamy uses phonics, sight words, and engaging stories to help early readers build confidence and love for books. Completely free — because every child deserves to read.',
        subjectId: 'english',
        gradeId: 'grade-2',
        priceCents: 0,
        status: 'published',
        rating: 4.5,
      },
    }),
  ]);

  console.log(`  ✓ ${courses.length} courses created`);
  const [algebraCourse, preCalgCourse, chemistryCourse, physicsCourse, writingCourse, pythonCourse, historyCourse, readingCourse] = courses;

  // ─── Lessons ─────────────────────────────────────────────────────────────────
  await prisma.lesson.createMany({
    data: [
      // Algebra course lessons
      { courseId: algebraCourse.id, title: 'Introduction to Variables and Expressions', order: 1, summary: 'What is a variable? Why do mathematicians use letters? We explore the language of algebra.' },
      { courseId: algebraCourse.id, title: 'Solving One-Step Equations', order: 2, summary: 'The balance method explained. Addition, subtraction, multiplication, and division equations.' },
      { courseId: algebraCourse.id, title: 'Two-Step and Multi-Step Equations', order: 3, summary: 'Combine operations to solve more complex equations. Word problems brought to life.' },
      { courseId: algebraCourse.id, title: 'Inequalities and the Number Line', order: 4, summary: 'Greater than, less than, and "or equal to". Graphing solutions on a number line.' },
      { courseId: algebraCourse.id, title: 'Introduction to Graphing Linear Functions', order: 5, summary: 'Coordinates, slope, and y-intercept. Drawing the equation as a picture.' },

      // Pre-calculus lessons
      { courseId: preCalgCourse.id, title: 'Functions and Their Notation', order: 1, summary: 'f(x), domain, range, and why functions are the building blocks of mathematics.' },
      { courseId: preCalgCourse.id, title: 'Polynomial Functions', order: 2, summary: 'Degree, roots, end behaviour, and graphing. The Factor Theorem explained.' },
      { courseId: preCalgCourse.id, title: 'Trigonometric Functions', order: 3, summary: 'Unit circle, sine, cosine, tangent, and their graphs. Periodic phenomena.' },

      // Chemistry lessons
      { courseId: chemistryCourse.id, title: 'Atoms: The Building Blocks of Everything', order: 1, summary: 'Protons, neutrons, electrons — and how scientists discovered them.' },
      { courseId: chemistryCourse.id, title: 'The Periodic Table: Nature\'s Organising Chart', order: 2, summary: 'Periods, groups, metals and non-metals. How to read an element\'s entry.' },
      { courseId: chemistryCourse.id, title: 'Chemical Bonding: How Atoms Stick Together', order: 3, summary: 'Ionic, covalent, and metallic bonds. Why water is a bent molecule.' },
      { courseId: chemistryCourse.id, title: 'Chemical Reactions and Equations', order: 4, summary: 'Balancing equations, types of reactions, conservation of mass.' },

      // Python lessons
      { courseId: pythonCourse.id, title: 'Your First Python Program', order: 1, summary: 'Installing Python, running Hello World, and understanding the interpreter.' },
      { courseId: pythonCourse.id, title: 'Variables, Data Types, and Input', order: 2, summary: 'Strings, integers, floats, booleans. Getting input from the user.' },
      { courseId: pythonCourse.id, title: 'Making Decisions with if/elif/else', order: 3, summary: 'Conditional logic, comparison operators, and building a guessing game.' },
      { courseId: pythonCourse.id, title: 'Loops: for and while', order: 4, summary: 'Repeating actions, iterating over lists, and writing a times-table printer.' },
      { courseId: pythonCourse.id, title: 'Functions: Reusable Building Blocks', order: 5, summary: 'Defining functions, parameters, return values, and scope.' },

      // Reading course lessons
      { courseId: readingCourse.id, title: 'The ABCs — Letter Recognition and Sounds', order: 1, summary: 'Learning all 26 letters and their primary sounds through songs and stories.' },
      { courseId: readingCourse.id, title: 'Blending Sounds: CVC Words', order: 2, summary: 'Consonant-Vowel-Consonant words. cat, dog, big — reading our first words!' },
      { courseId: readingCourse.id, title: 'Sight Words: The Most Common Words in English', order: 3, summary: 'The first 50 Dolch sight words. Flash cards, games, and reading practice.' },

      // Writing course lessons
      { courseId: writingCourse.id, title: 'The Writer\'s Toolbox: Show, Don\'t Tell', order: 1, summary: 'The cornerstone of good writing. Exercises to turn flat sentences into vivid scenes.' },
      { courseId: writingCourse.id, title: 'Character: Giving Your People Life', order: 2, summary: 'Physical description, voice, motivation, and flaw. Creating unforgettable characters.' },

      // History course lessons
      { courseId: historyCourse.id, title: 'The Founding Documents: More Than Just Paper', order: 1, summary: 'Declaration of Independence, Constitution, Bill of Rights — the stories behind the words.' },
      { courseId: historyCourse.id, title: 'The Civil War: A Nation Divided', order: 2, summary: 'Causes, key figures, major battles, and the long road to Reconstruction.' },
    ],
  });

  console.log('  ✓ Lessons created');

  // ─── Materials with OCR data ───────────────────────────────────────────────
  // Fetch lesson ids for materials
  const algebraLesson1 = await prisma.lesson.findFirst({ where: { courseId: algebraCourse.id, order: 1 } });
  const pythonLesson1 = await prisma.lesson.findFirst({ where: { courseId: pythonCourse.id, order: 1 } });
  const chemLesson2 = await prisma.lesson.findFirst({ where: { courseId: chemistryCourse.id, order: 2 } });

  await prisma.material.createMany({
    data: [
      {
        ownerId: margaret.id,
        courseId: algebraCourse.id,
        lessonId: algebraLesson1?.id,
        kind: 'pdf',
        title: 'Algebra Variables — Study Guide',
        fileUrl: 'https://example.com/placeholder/algebra-variables.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245760,
        ocrStatus: 'done',
        extractedText: 'Chapter 1: Variables and Expressions\n\nA variable is a symbol, usually a letter, that represents an unknown number or value. In algebra, we use variables to write expressions and equations that describe mathematical relationships.\n\nExpressions vs. Equations:\n- An expression is a combination of numbers, variables, and operations (e.g., 3x + 5).\n- An equation has an equals sign and states that two expressions are equal (e.g., 3x + 5 = 14).\n\nKey Vocabulary:\n- Coefficient: the number multiplied by a variable (in 3x, the coefficient is 3)\n- Constant: a fixed number in an expression (in 3x + 5, the constant is 5)\n- Term: each part of an expression separated by + or - signs\n\nEvaluating Expressions:\nTo evaluate an expression, substitute the given value for the variable and perform the arithmetic.\nExample: Evaluate 2x + 7 when x = 4.\nSolution: 2(4) + 7 = 8 + 7 = 15',
        aiSummary: 'This study guide covers the fundamentals of algebraic variables and expressions. Key topics include the difference between expressions (no equals sign) and equations (has equals sign), important vocabulary such as coefficient, constant, and term, and how to evaluate expressions by substituting values. The guide provides clear examples and step-by-step solutions suitable for grade 7-9 students.',
      },
      {
        ownerId: robert.id,
        courseId: pythonCourse.id,
        lessonId: pythonLesson1?.id,
        kind: 'doc',
        title: 'Python Installation Guide',
        fileUrl: 'https://example.com/placeholder/python-install.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 102400,
        ocrStatus: 'done',
        extractedText: 'Installing Python 3\n\nStep 1: Download Python\nGo to python.org and click the "Download Python 3.x.x" button. Choose the version appropriate for your operating system (Windows, macOS, or Linux).\n\nStep 2: Run the Installer\nWindows: Double-click the downloaded .exe file. IMPORTANT: Check the box that says "Add Python to PATH" before clicking Install.\nmacOS: Open the .pkg file and follow the prompts.\nLinux: Python is often pre-installed. Type python3 --version in the terminal to check.\n\nStep 3: Verify Installation\nOpen a terminal (Command Prompt on Windows, Terminal on Mac/Linux).\nType: python3 --version\nYou should see something like: Python 3.11.4\n\nStep 4: Install VS Code (Optional but Recommended)\nDownload Visual Studio Code from code.visualstudio.com. Install the Python extension for code completion and debugging.',
        aiSummary: 'This guide walks students through installing Python 3 on Windows, macOS, or Linux. Key steps include downloading from python.org, ensuring Python is added to the PATH during Windows installation, verifying the installation via the terminal, and optionally setting up VS Code as a development environment.',
      },
      {
        ownerId: james.id,
        courseId: chemistryCourse.id,
        lessonId: chemLesson2?.id,
        kind: 'image',
        title: 'Periodic Table Diagram',
        fileUrl: 'https://example.com/placeholder/periodic-table.png',
        mimeType: 'image/png',
        sizeBytes: 512000,
        ocrStatus: 'done',
        extractedText: 'THE PERIODIC TABLE OF ELEMENTS\n\nGroup 1 (Alkali Metals): H, Li, Na, K, Rb, Cs, Fr\nGroup 2 (Alkaline Earth Metals): Be, Mg, Ca, Sr, Ba, Ra\nTransition Metals: Sc-Zn, Y-Cd, Hf-Hg\nGroup 17 (Halogens): F, Cl, Br, I, At\nGroup 18 (Noble Gases): He, Ne, Ar, Kr, Xe, Rn\n\nPeriods: 7 horizontal rows\nGroups: 18 vertical columns\n\nAtomicNumber - Symbol - Name - AtomicMass',
        aiSummary: 'A periodic table diagram with element names, symbols, atomic numbers, and groupings. Elements are organized into 7 periods (rows) and 18 groups (columns). Key groups highlighted include alkali metals (Group 1), alkaline earth metals (Group 2), halogens (Group 17), and noble gases (Group 18). Transition metals occupy the middle block.',
      },
    ],
  });

  console.log('  ✓ Materials created');

  // ─── Class Sessions ───────────────────────────────────────────────────────
  const now = new Date();
  const soon = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const sessions = await Promise.all([
    // Margaret: group classroom (paid)
    prisma.classSession.create({
      data: {
        kind: 'classroom',
        teacherId: margaret.id,
        courseId: algebraCourse.id,
        title: 'Live Q&A: Solving Multi-Step Equations',
        startsAt: soon,
        durationMinutes: 60,
        priceCents: 0, // free for enrolled students
        capacity: 30,
        roomName: 'mentora-algebra-qa-001',
        status: 'scheduled',
      },
    }),
    // James: 1:1 coaching
    prisma.classSession.create({
      data: {
        kind: 'one_on_one',
        teacherId: james.id,
        title: '1:1 Chemistry Tutoring with Dr. Okafor',
        startsAt: nextWeek,
        durationMinutes: 60,
        priceCents: 9000,
        capacity: 1,
        roomName: 'mentora-james-1on1-001',
        status: 'scheduled',
      },
    }),
    // Robert: group workshop
    prisma.classSession.create({
      data: {
        kind: 'classroom',
        teacherId: robert.id,
        courseId: pythonCourse.id,
        title: 'Python Workshop: Build a Number Guessing Game',
        startsAt: nextWeek,
        durationMinutes: 90,
        priceCents: 0,
        capacity: 25,
        roomName: 'mentora-python-workshop-001',
        status: 'scheduled',
      },
    }),
    // Eleanor: writing workshop
    prisma.classSession.create({
      data: {
        kind: 'classroom',
        teacherId: eleanor.id,
        courseId: writingCourse.id,
        title: 'Live Writing Workshop: Peer Review & Feedback',
        startsAt: nextMonth,
        durationMinutes: 90,
        priceCents: 1500,
        capacity: 15,
        roomName: 'mentora-writing-workshop-001',
        status: 'scheduled',
      },
    }),
    // Margaret: a completed 1:1 session (for payment/earnings seed data)
    prisma.classSession.create({
      data: {
        kind: 'one_on_one',
        teacherId: margaret.id,
        title: 'Private Algebra Coaching',
        startsAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // last week
        durationMinutes: 60,
        priceCents: 8500,
        capacity: 1,
        roomName: 'mentora-margaret-1on1-completed-001',
        status: 'completed',
      },
    }),
  ]);

  console.log(`  ✓ ${sessions.length} sessions created`);

  // ─── Guardian + Students ──────────────────────────────────────────────────
  const guardian = await prisma.user.create({
    data: {
      name: 'David Park',
      email: 'david.park@example.com',
      passwordHash: await hash('Password123!'),
      role: 'GUARDIAN',
      bio: 'Parent of two wonderful learners.',
    },
  });

  const [lily, ethan] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Lily Park',
        email: 'lily.park@example.com',
        passwordHash: await hash('Password123!'),
        role: 'STUDENT',
        guardianId: guardian.id,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Ethan Park',
        email: 'ethan.park@example.com',
        passwordHash: await hash('Password123!'),
        role: 'STUDENT',
        guardianId: guardian.id,
      },
    }),
  ]);

  console.log(`  ✓ Guardian (${guardian.email}) with 2 students created`);

  // ─── A standalone student ─────────────────────────────────────────────────
  const student3 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'student@mentora.app',
      passwordHash: await hash('Password123!'),
      role: 'STUDENT',
    },
  });
  console.log(`  ✓ Demo student: ${student3.email}`);

  // ─── Enrollments ──────────────────────────────────────────────────────────
  const [completedSession] = sessions.slice(-1);

  await prisma.enrollment.createMany({
    data: [
      // Lily: enrolled in algebra course and free reading course
      { studentId: lily.id, courseId: algebraCourse.id, status: 'active' },
      { studentId: lily.id, courseId: readingCourse.id, status: 'active' },
      // Ethan: enrolled in Python course and chemistry
      { studentId: ethan.id, courseId: pythonCourse.id, status: 'active' },
      { studentId: ethan.id, courseId: chemistryCourse.id, status: 'active' },
      // Alex: enrolled in a few courses
      { studentId: student3.id, courseId: algebraCourse.id, status: 'active' },
      { studentId: student3.id, courseId: pythonCourse.id, status: 'active' },
      { studentId: student3.id, courseId: historyCourse.id, status: 'active' },
      // Completed session enrollment for Alex
      { studentId: student3.id, sessionId: completedSession.id, status: 'completed' },
    ],
  });

  console.log('  ✓ Enrollments created');

  // ─── Payments ─────────────────────────────────────────────────────────────
  // Lily's course payment (algebra, margaret is pro tier)
  await prisma.payment.create({
    data: {
      payerId: lily.id,
      amountCents: algebraCourse.priceCents, // 4900
      currency: 'USD',
      kind: 'course',
      status: 'succeeded',
      provider: 'mock',
      platformFeeCents: Math.round(algebraCourse.priceCents * 0.10), // pro = 10%
      payoutCents: Math.round(algebraCourse.priceCents * 0.90),
      payeeId: margaret.id,
    },
  });

  // Ethan's course payment (Python, robert is pro tier)
  await prisma.payment.create({
    data: {
      payerId: ethan.id,
      amountCents: pythonCourse.priceCents, // 4900
      currency: 'USD',
      kind: 'course',
      status: 'succeeded',
      provider: 'mock',
      platformFeeCents: Math.round(pythonCourse.priceCents * 0.10),
      payoutCents: Math.round(pythonCourse.priceCents * 0.90),
      payeeId: robert.id,
    },
  });

  // Alex's completed 1:1 session payment (margaret, pro tier)
  await prisma.payment.create({
    data: {
      payerId: student3.id,
      amountCents: completedSession.priceCents, // 8500
      currency: 'USD',
      kind: 'session',
      status: 'succeeded',
      provider: 'mock',
      platformFeeCents: Math.round(completedSession.priceCents * 0.10),
      payoutCents: Math.round(completedSession.priceCents * 0.90),
      payeeId: margaret.id,
    },
  });

  // Alex's Scholar subscription
  const subExpiry = new Date();
  subExpiry.setMonth(subExpiry.getMonth() + 1);
  await prisma.subscription.create({
    data: {
      userId: student3.id,
      planId: 'scholar',
      status: 'active',
      currentPeriodEnd: subExpiry,
      provider: 'mock',
    },
  });
  await prisma.payment.create({
    data: {
      payerId: student3.id,
      amountCents: 1900,
      currency: 'USD',
      kind: 'subscription',
      status: 'succeeded',
      provider: 'mock',
    },
  });

  console.log('  ✓ Payments and subscriptions created');

  // ─── Summary ──────────────────────────────────────────────────────────────
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.material.count(),
    prisma.classSession.count(),
    prisma.enrollment.count(),
    prisma.payment.count(),
  ]);

  console.log('\n' + '─'.repeat(60));
  console.log('✅ Seed complete!');
  console.log(`   Users: ${counts[0]} | Courses: ${counts[1]} | Lessons: ${counts[2]}`);
  console.log(`   Materials: ${counts[3]} | Sessions: ${counts[4]}`);
  console.log(`   Enrollments: ${counts[5]} | Payments: ${counts[6]}`);
  console.log('─'.repeat(60));
  console.log('\n🔑 Demo Credentials (all passwords: Password123!)\n');
  console.log('  Role      | Email');
  console.log('  ----------|----------------------------------------------');
  console.log('  ADMIN     | admin@mentora.app');
  console.log('  TEACHER   | margaret.chen@mentora.app   (Pro Tier, Math)');
  console.log('  TEACHER   | james.okafor@mentora.app    (Pro Tier, Science)');
  console.log('  TEACHER   | eleanor.vasquez@mentora.app (Standard, English)');
  console.log('  TEACHER   | robert.tanaka@mentora.app   (Pro Tier, CS)');
  console.log('  TEACHER   | patricia.obrien@mentora.app (Standard, History)');
  console.log('  TEACHER   | amelia.krishnaswamy@mentora.app (Standard, Languages)');
  console.log('  GUARDIAN  | david.park@example.com');
  console.log('  STUDENT   | student@mentora.app         (Alex, Scholar sub)');
  console.log('  STUDENT   | lily.park@example.com       (Lily Park)');
  console.log('  STUDENT   | ethan.park@example.com      (Ethan Park)');
  console.log('─'.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
