import { ClassCurriculum, EventItem, ResourceItem } from '../types';

export const PRIMARY_CURRICULUM: ClassCurriculum[] = [
  {
    classLevel: 'P7',
    title: 'Primary Seven (P.7) - Candidate Class',
    level: 'primary',
    description: 'Complete UNEB PLE examination preparation across all core subjects with past paper breakdowns and topical mastery.',
    subjects: [
      {
        id: 'p7-math',
        name: 'Mathematics',
        code: 'MTC-P7',
        icon: 'Calculator',
        color: 'from-amber-500 to-orange-600',
        topics: [
          {
            id: 'p7-math-t1',
            name: 'Sets and Venn Diagrams',
            lessons: [
              {
                id: 'p7-m-l1',
                title: 'Solving Word Problems using 3-Set Venn Diagrams',
                durationMinutes: 18,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder or real video embed
                thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
                description: 'Step-by-step masterclass by Tr. Ojok on finding intersections, complements, and solving UNEB PLE Section B Venn diagram questions.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P7_Math_Venn_Diagrams_Summary_Notes.pdf',
                pdfFileSize: '2.4 MB',
                isFree: true,
                quiz: [
                  {
                    id: 'q1',
                    question: 'If Set A has 15 elements, Set B has 12 elements, and n(A ∩ B) = 5, what is n(A ∪ B)?',
                    options: ['22', '27', '32', '17'],
                    correctAnswerIndex: 0,
                    explanation: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 15 + 12 - 5 = 22.'
                  },
                  {
                    id: 'q2',
                    question: 'Which of the following describes two sets that have no elements in common?',
                    options: ['Disjoint Sets', 'Subset', 'Equivalent Sets', 'Infinite Sets'],
                    correctAnswerIndex: 0,
                    explanation: 'Disjoint sets are sets whose intersection is empty (A ∩ B = ∅).'
                  },
                  {
                    id: 'q3',
                    question: 'In a class of 40 pupils, 25 like Posho, 20 like Rice, and 5 like neither. How many like both?',
                    options: ['10', '15', '5', '8'],
                    correctAnswerIndex: 0,
                    explanation: 'Total pupils = 40 - 5 (neither) = 35 like at least one. Both = 25 + 20 - 35 = 10 pupils.'
                  },
                  {
                    id: 'q4',
                    question: 'What is the complement of a Universal set?',
                    options: ['Empty set (∅)', 'Universal set itself', 'Subset', 'Equal set'],
                    correctAnswerIndex: 0,
                    explanation: 'The complement of the universal set contains no elements, which is the empty set (∅).'
                  }
                ]
              },
              {
                id: 'p7-m-l2',
                title: 'Fractions, Decimals and Percentages Conversion',
                durationMinutes: 22,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
                description: 'Converting recurring decimals to proper fractions and solving practical shopping percentage discounts.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'Fractions_Decimals_Percentages_Worksheet.pdf',
                pdfFileSize: '1.8 MB',
                isFree: true,
                quiz: [
                  {
                    id: 'q1',
                    question: 'Convert 0.375 into a simple fraction in its lowest terms.',
                    options: ['3/8', '375/100', '3/4', '7/16'],
                    correctAnswerIndex: 0,
                    explanation: '375/1000 divided by 125/125 equals 3/8.'
                  },
                  {
                    id: 'q2',
                    question: 'A trader offers a 15% discount on a book priced at 20,000 UGX. How much does a pupil pay?',
                    options: ['17,000 UGX', '18,500 UGX', '3,000 UGX', '15,000 UGX'],
                    correctAnswerIndex: 0,
                    explanation: 'Discount = 15% of 20,000 = 3,000 UGX. Pupil pays 20,000 - 3,000 = 17,000 UGX.'
                  }
                ]
              }
            ]
          },
          {
            id: 'p7-math-t2',
            name: 'Algebra and Linear Equations',
            lessons: [
              {
                id: 'p7-m-l3',
                title: 'Solving Linear Equations with Unknowns on Both Sides',
                durationMinutes: 19,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
                description: 'Master collecting like terms, working with brackets, and solving UNEB word equations.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P7_Algebra_Equations_Exercises.pdf',
                pdfFileSize: '1.5 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 'p7-sci',
        name: 'Integrated Science',
        code: 'SCI-P7',
        icon: 'FlaskConical',
        color: 'from-emerald-500 to-teal-700',
        topics: [
          {
            id: 'p7-sci-t1',
            name: 'The Human Circulatory System',
            lessons: [
              {
                id: 'p7-sci-l1',
                title: 'Heart Structure, Blood Vessels & Circulation',
                durationMinutes: 25,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80',
                description: 'Detailed anatomical diagrams of the human heart: ventricles, atria, valves, pulmonary artery, and aorta.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'Human_Circulatory_System_Full_Coloured_Charts.pdf',
                pdfFileSize: '3.1 MB',
                isFree: true,
                quiz: [
                  {
                    id: 'q1',
                    question: 'Which chamber of the human heart pumps oxygenated blood to the rest of the body?',
                    options: ['Left Ventricle', 'Right Atrium', 'Left Atrium', 'Right Ventricle'],
                    correctAnswerIndex: 0,
                    explanation: 'The left ventricle has thick muscular walls to pump oxygenated blood through the aorta to the entire body.'
                  },
                  {
                    id: 'q2',
                    question: 'Which blood vessel carries deoxygenated blood from the heart to the lungs?',
                    options: ['Pulmonary Artery', 'Pulmonary Vein', 'Aorta', 'Vena Cava'],
                    correctAnswerIndex: 0,
                    explanation: 'The pulmonary artery is the only artery that carries deoxygenated blood (from right ventricle to lungs).'
                  }
                ]
              }
            ]
          },
          {
            id: 'p7-sci-t2',
            name: 'Matter and Energy: Electricity & Magnetism',
            lessons: [
              {
                id: 'p7-sci-l2',
                title: 'Simple Electric Circuits, Conductors and Insulators',
                durationMinutes: 20,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
                description: 'Circuit components, series vs parallel connections, and electrical safety in Ugandan homes.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'Electricity_Circuits_Revision_Notes.pdf',
                pdfFileSize: '2.0 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 'p7-sst',
        name: 'Social Studies & RE',
        code: 'SST-P7',
        icon: 'Globe',
        color: 'from-blue-600 to-indigo-800',
        topics: [
          {
            id: 'p7-sst-t1',
            name: 'The Location, Climate and Physical Features of Africa',
            lessons: [
              {
                id: 'p7-sst-l1',
                title: 'The Great Rift Valley, Mountains and Lakes of East Africa',
                durationMinutes: 21,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
                description: 'Physical geography, formation processes (Faulting & Vulcanicity), and economic importance to Uganda and the EAC region.',
                teacherName: 'Tr. Kato Patrick',
                pdfUrl: '#',
                pdfFileName: 'Africa_Physical_Features_Maps_and_Questions.pdf',
                pdfFileSize: '4.5 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 'p7-eng',
        name: 'English Language',
        code: 'ENG-P7',
        icon: 'BookOpen',
        color: 'from-rose-500 to-pink-700',
        topics: [
          {
            id: 'p7-eng-t1',
            name: 'Grammar: Conditional Sentences (If 1, If 2, If 3)',
            lessons: [
              {
                id: 'p7-eng-l1',
                title: 'Mastering If-Clauses for PLE Section A',
                durationMinutes: 17,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
                description: 'Sentence transformation formulas, common traps, and past examination practice questions.',
                teacherName: 'Tr. Akello Grace',
                pdfUrl: '#',
                pdfFileName: 'English_Conditional_Clauses_Formula_Sheet.pdf',
                pdfFileSize: '1.2 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P6',
    title: 'Primary Six (P.6)',
    level: 'primary',
    description: 'Foundational upper primary curriculum building deep competence for PLE readiness.',
    subjects: [
      {
        id: 'p6-math',
        name: 'Mathematics',
        code: 'MTC-P6',
        icon: 'Calculator',
        color: 'from-amber-500 to-orange-600',
        topics: [
          {
            id: 'p6-math-t1',
            name: 'Geometry: Angles and Lines',
            lessons: [
              {
                id: 'p6-m-l1',
                title: 'Angles on Parallel Lines: Alternate, Corresponding & Co-interior',
                durationMinutes: 19,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
                description: 'Recognizing F, Z, and C angle patterns and finding missing degrees.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P6_Geometry_Angles_Guide.pdf',
                pdfFileSize: '2.1 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 'p6-sci',
        name: 'Integrated Science',
        code: 'SCI-P6',
        icon: 'FlaskConical',
        color: 'from-emerald-500 to-teal-700',
        topics: [
          {
            id: 'p6-sci-t1',
            name: 'Resources in the Environment',
            lessons: [
              {
                id: 'p6-sci-l1',
                title: 'Renewable and Non-Renewable Energy Sources',
                durationMinutes: 16,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80',
                description: 'Solar, wind, hydro-power, and bio-gas systems in Uganda.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'Energy_Resources_P6_Notes.pdf',
                pdfFileSize: '1.9 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P5',
    title: 'Primary Five (P.5)',
    level: 'primary',
    description: 'Transitioning into upper primary thinking with practical concept exploration.',
    subjects: [
      {
        id: 'p5-math',
        name: 'Mathematics',
        code: 'MTC-P5',
        icon: 'Calculator',
        color: 'from-amber-500 to-orange-600',
        topics: [
          {
            id: 'p5-math-t1',
            name: 'Whole Numbers and Place Values',
            lessons: [
              {
                id: 'p5-m-l1',
                title: 'Reading, Writing & Rounding off Large Numbers',
                durationMinutes: 15,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
                description: 'Numbers up to 1,000,000 and Roman numerals conversion.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P5_Numbers_Place_Value.pdf',
                pdfFileSize: '1.4 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P4',
    title: 'Primary Four (P.4)',
    level: 'primary',
    description: 'Foundational concepts in English medium learning.',
    subjects: [
      {
        id: 'p4-sci',
        name: 'Integrated Science',
        code: 'SCI-P4',
        icon: 'FlaskConical',
        color: 'from-emerald-500 to-teal-700',
        topics: [
          {
            id: 'p4-sci-t1',
            name: 'Plant Life and Germination',
            lessons: [
              {
                id: 'p4-sci-l1',
                title: 'Conditions Necessary for Seed Germination',
                durationMinutes: 14,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
                description: 'Experiments with beans, warmth, oxygen, and water.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'P4_Plant_Life_Handout.pdf',
                pdfFileSize: '1.1 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P3',
    title: 'Primary Three (P.3)',
    level: 'primary',
    description: 'Lower primary numeracy, literacy, and environmental knowledge.',
    subjects: [
      {
        id: 'p3-math',
        name: 'Mathematics',
        code: 'MTC-P3',
        icon: 'Calculator',
        color: 'from-amber-500 to-orange-600',
        topics: [
          {
            id: 'p3-math-t1',
            name: 'Multiplication Tables and Division',
            lessons: [
              {
                id: 'p3-m-l1',
                title: 'Fun Tricks for 6x, 7x, 8x, and 9x Tables',
                durationMinutes: 12,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
                description: 'Memory tricks and rhymes to master multiplication easily.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P3_Multiplication_Chart.pdf',
                pdfFileSize: '0.9 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P2',
    title: 'Primary Two (P.2)',
    level: 'primary',
    description: 'Playful and visual learning for early literacy and numbers.',
    subjects: [
      {
        id: 'p2-eng',
        name: 'Literacy and Reading',
        code: 'LIT-P2',
        icon: 'BookOpen',
        color: 'from-rose-500 to-pink-700',
        topics: [
          {
            id: 'p2-lit-t1',
            name: 'Phonics and Sentence Formation',
            lessons: [
              {
                id: 'p2-l1',
                title: 'Blending Consonants and Vowels',
                durationMinutes: 10,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
                description: 'Interactive letter sounds with songs and pictures.',
                teacherName: 'Tr. Akello Grace',
                pdfUrl: '#',
                pdfFileName: 'P2_Phonics_Flashcards.pdf',
                pdfFileSize: '1.5 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'P1',
    title: 'Primary One (P.1)',
    level: 'primary',
    description: 'First steps in counting, shapes, sounds, and social hygiene.',
    subjects: [
      {
        id: 'p1-num',
        name: 'Numeracy (Counting & Shapes)',
        code: 'NUM-P1',
        icon: 'Calculator',
        color: 'from-amber-500 to-orange-600',
        topics: [
          {
            id: 'p1-num-t1',
            name: 'Counting 1 to 50',
            lessons: [
              {
                id: 'p1-l1',
                title: 'Counting with Everyday Objects (Bottle Tops & Fruits)',
                durationMinutes: 8,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80',
                description: 'Clear, fun visual count-along video.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'P1_Colouring_and_Counting.pdf',
                pdfFileSize: '1.8 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const SECONDARY_CURRICULUM: ClassCurriculum[] = [
  {
    classLevel: 'S4',
    title: 'Senior Four (S.4) - O-Level Candidate Class',
    level: 'secondary',
    division: 'O-Level',
    description: 'Comprehensive UNEB UCE preparation adhering to both the updated competence-based lower secondary framework and traditional exam standards.',
    subjects: [
      {
        id: 's4-phy',
        name: 'Physics',
        code: 'PHY-S4',
        icon: 'Atom',
        color: 'from-cyan-600 to-blue-800',
        topics: [
          {
            id: 's4-phy-t1',
            name: 'Geometrical Optics: Reflection & Refraction of Light',
            lessons: [
              {
                id: 's4-phy-l1',
                title: 'Ray Diagrams for Curved Mirrors and Snell\'s Law',
                durationMinutes: 28,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=80',
                description: 'Concave and convex mirrors formulas (1/f = 1/u + 1/v), magnification, critical angle, and total internal reflection experiments.',
                teacherName: 'Tr. Mugisha Ronald',
                pdfUrl: '#',
                pdfFileName: 'S4_Physics_Optics_Comprehensive_Derivations.pdf',
                pdfFileSize: '3.6 MB',
                isFree: true,
                quiz: [
                  {
                    id: 'q1',
                    question: 'What is the critical angle of glass with a refractive index of 1.5 into air?',
                    options: ['41.8°', '48.6°', '30.0°', '45.0°'],
                    correctAnswerIndex: 0,
                    explanation: 'sin(c) = 1/n = 1/1.5 = 0.6667. Therefore c = arcsin(0.6667) ≈ 41.8°.'
                  },
                  {
                    id: 'q2',
                    question: 'Which mirror is used as a vehicle driving rear-view mirror in Uganda?',
                    options: ['Convex mirror (gives wide field of view)', 'Concave mirror', 'Plane mirror', 'Parabolic mirror'],
                    correctAnswerIndex: 0,
                    explanation: 'Convex mirrors always form erect, diminished virtual images and give drivers a broad field of view.'
                  }
                ]
              }
            ]
          },
          {
            id: 's4-phy-t2',
            name: 'Current Electricity and Domestic Wiring',
            lessons: [
              {
                id: 's4-phy-l2',
                title: 'Ohm\'s Law, Electrical Energy and Cost Calculation (Umeme/Yaka)',
                durationMinutes: 24,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80',
                description: 'Real-life calculations of electricity units (kWh) consumed by Ugandan households and circuit protection fuses.',
                teacherName: 'Tr. Mugisha Ronald',
                pdfUrl: '#',
                pdfFileName: 'Domestic_Electricity_and_Yaka_Problems.pdf',
                pdfFileSize: '2.5 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 's4-chem',
        name: 'Chemistry',
        code: 'CHM-S4',
        icon: 'FlaskConical',
        color: 'from-emerald-600 to-green-900',
        topics: [
          {
            id: 's4-chem-t1',
            name: 'Mole Concept and Volumetric Analysis',
            lessons: [
              {
                id: 's4-chem-l1',
                title: 'Molar Mass, Empirical Formulae and Titration Calculations',
                durationMinutes: 32,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80',
                description: 'Demystifying Paper 500/1 and 500/2 calculations step-by-step with previous UNEB questions.',
                teacherName: 'Tr. Barasa Emmanuel',
                pdfUrl: '#',
                pdfFileName: 'S4_Mole_Concept_Worked_Examples_UNEB.pdf',
                pdfFileSize: '4.2 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 's4-bio',
        name: 'Biology',
        code: 'BIO-S4',
        icon: 'Dna',
        color: 'from-teal-600 to-emerald-800',
        topics: [
          {
            id: 's4-bio-t1',
            name: 'Genetics, Cell Division and Evolution',
            lessons: [
              {
                id: 's4-bio-l1',
                title: 'Mendel\'s Monohybrid Crosses and Blood Group Inheritance',
                durationMinutes: 26,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=600&q=80',
                description: 'Punnett squares, dominant/recessive alleles, sickle-cell inheritance, and ABO blood grouping in Uganda.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'Genetics_ABO_Blood_Groups_Revision.pdf',
                pdfFileSize: '2.8 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 's4-math',
        name: 'Mathematics',
        code: 'MTC-S4',
        icon: 'Calculator',
        color: 'from-amber-600 to-orange-800',
        topics: [
          {
            id: 's4-math-t1',
            name: 'Trigonometry and Bearings',
            lessons: [
              {
                id: 's4-m-l1',
                title: 'Three-Figure Bearings and 3D Trigonometry',
                durationMinutes: 30,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
                description: 'Sine rule, cosine rule, angles of elevation and depression, and solving navigation problems.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'S4_Trigonometry_Bearings_Mastery.pdf',
                pdfFileSize: '3.0 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'S3',
    title: 'Senior Three (S.3)',
    level: 'secondary',
    division: 'O-Level',
    description: 'Consolidation of science theories and introduction to advanced calculation skills.',
    subjects: [
      {
        id: 's3-phy',
        name: 'Physics',
        code: 'PHY-S3',
        icon: 'Atom',
        color: 'from-cyan-600 to-blue-800',
        topics: [
          {
            id: 's3-phy-t1',
            name: 'Machines and Work, Energy & Power',
            lessons: [
              {
                id: 's3-phy-l1',
                title: 'Mechanical Advantage, Velocity Ratio, and Efficiency',
                durationMinutes: 23,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                description: 'Pulley systems, inclined planes, levers, and gears.',
                teacherName: 'Tr. Mugisha Ronald',
                pdfUrl: '#',
                pdfFileName: 'S3_Simple_Machines_Notes.pdf',
                pdfFileSize: '2.1 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'S2',
    title: 'Senior Two (S.2)',
    level: 'secondary',
    division: 'O-Level',
    description: 'New lower secondary curriculum activities of integration and project-based investigations.',
    subjects: [
      {
        id: 's2-bio',
        name: 'Biology',
        code: 'BIO-S2',
        icon: 'Dna',
        color: 'from-teal-600 to-emerald-800',
        topics: [
          {
            id: 's2-bio-t1',
            name: 'Transport in Plants and Transpiration',
            lessons: [
              {
                id: 's2-bio-l1',
                title: 'Xylem and Phloem Structure & Potometer Experiments',
                durationMinutes: 20,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80',
                description: 'Factors affecting transpiration rates and water absorption in crops.',
                teacherName: 'Tr. Namubiru Sarah',
                pdfUrl: '#',
                pdfFileName: 'Plant_Transport_S2.pdf',
                pdfFileSize: '1.9 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'S1',
    title: 'Senior One (S.1)',
    level: 'secondary',
    division: 'O-Level',
    description: 'Orientation to secondary education subjects, laboratory equipment, and inquiry-based learning.',
    subjects: [
      {
        id: 's1-chem',
        name: 'Chemistry',
        code: 'CHM-S1',
        icon: 'FlaskConical',
        color: 'from-emerald-600 to-green-900',
        topics: [
          {
            id: 's1-chem-t1',
            name: 'Introduction to Chemistry & Lab Safety',
            lessons: [
              {
                id: 's1-chm-l1',
                title: 'The Bunsen Burner: Luminous vs Non-Luminous Flames',
                durationMinutes: 18,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
                description: 'Parts of the burner, air hole adjustments, strike back, and safety precautions.',
                teacherName: 'Tr. Barasa Emmanuel',
                pdfUrl: '#',
                pdfFileName: 'S1_Lab_Safety_and_Apparatus.pdf',
                pdfFileSize: '2.4 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'S6',
    title: 'Senior Six (S.6) - A-Level Candidate Class',
    level: 'secondary',
    division: 'A-Level',
    description: 'Advanced UNEB UACE preparation for university entry in Principal subjects (Sciences & Arts).',
    subjects: [
      {
        id: 's6-pmtc',
        name: 'Pure Mathematics (P425)',
        code: 'PMTC-S6',
        icon: 'Calculator',
        color: 'from-purple-600 to-indigo-900',
        topics: [
          {
            id: 's6-pm-t1',
            name: 'Calculus: Integration by Parts & Differential Equations',
            lessons: [
              {
                id: 's6-pm-l1',
                title: 'Solving Second-Order Differential Equations and Applications',
                durationMinutes: 35,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
                description: 'Homogeneous and non-homogeneous equations, integrating factors, and decay/growth models.',
                teacherName: 'Tr. Ojok Mtn',
                pdfUrl: '#',
                pdfFileName: 'UACE_Differential_Equations_Derivations.pdf',
                pdfFileSize: '3.8 MB',
                isFree: true
              }
            ]
          }
        ]
      },
      {
        id: 's6-econ',
        name: 'Economics (P220)',
        code: 'ECON-S6',
        icon: 'TrendingUp',
        color: 'from-amber-600 to-yellow-900',
        topics: [
          {
            id: 's6-econ-t1',
            name: 'Public Finance and Taxation in Developing Economies',
            lessons: [
              {
                id: 's6-ec-l1',
                title: 'Direct vs Indirect Taxes: Uganda Revenue Authority (URA) Case Study',
                durationMinutes: 28,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
                description: 'Tax incidence, elasticity of demand, VAT, PAYE, and domestic debt management in Uganda.',
                teacherName: 'Tr. Kato Patrick',
                pdfUrl: '#',
                pdfFileName: 'S6_Economics_Public_Finance_Summary.pdf',
                pdfFileSize: '2.9 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    classLevel: 'S5',
    title: 'Senior Five (S.5)',
    level: 'secondary',
    division: 'A-Level',
    description: 'Transition to principal subject rigor, research methodology, and paper 1 foundation.',
    subjects: [
      {
        id: 's5-submath',
        name: 'Sub-Math / General Paper',
        code: 'GP-S5',
        icon: 'BookOpen',
        color: 'from-blue-600 to-slate-800',
        topics: [
          {
            id: 's5-gp-t1',
            name: 'Essay Writing Techniques & Contemporary Issues in East Africa',
            lessons: [
              {
                id: 's5-gp-l1',
                title: 'Structuring High-Scoring General Paper Essays for UACE',
                durationMinutes: 25,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
                description: 'Introduction strategies, thesis formulation, balanced counter-arguments, and concluding remarks.',
                teacherName: 'Tr. Akello Grace',
                pdfUrl: '#',
                pdfFileName: 'UACE_General_Paper_Exemplar_Essays.pdf',
                pdfFileSize: '2.1 MB',
                isFree: true
              }
            ]
          }
        ]
      }
    ]
  }
];

export const EVENTS_DATA: EventItem[] = [
  {
    id: 'evt-1',
    title: 'National Primary Schools PLE Mathematics Quiz Championship 2026',
    type: 'Quiz Competition',
    audience: 'Primary',
    date: 'Saturday, November 14, 2026',
    time: '9:00 AM - 1:00 PM EAT',
    venue: 'Makerere University Main Hall & Online Live Stream',
    joiningLink: 'https://meet.google.com/ug-vlearn-quiz',
    description: 'An exhilarating nationwide Kahoot-style quiz challenge for P.6 and P.7 candidates. Schools compete live for scholastic prizes, trophies, and fee bursaries. Questions cover whole numbers, Venn diagrams, geometry, and word problems.',
    organizer: 'Teacher Ojok Mtn & Uganda Primary Educators Association',
    bannerImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    status: 'Upcoming',
    maxRegistrations: 500,
    currentRegistrations: 382,
    downloadableMaterials: [
      {
        name: 'Championship_Rules_and_Syllabus_Breakdown.pdf',
        url: '#',
        size: '1.4 MB'
      },
      {
        name: 'Sample_Kahoot_Math_Warmup_Questions.pdf',
        url: '#',
        size: '850 KB'
      }
    ]
  },
  {
    id: 'evt-2',
    title: 'O-Level (S.4) Physics & Chemistry UNEB Practical Preparation Seminar',
    type: 'Seminar',
    audience: 'Secondary',
    date: 'Friday, November 20, 2026',
    time: '10:00 AM - 3:30 PM EAT',
    venue: 'Kololo Airstrip Exhibition Hall, Kampala',
    joiningLink: 'https://v-learn.ug/live/s4-practical-seminar',
    description: 'Senior examiners demonstrate hands-on techniques for Physics optics, mechanics, Chemistry titrations, and salt analysis. Participants receive direct feedback on how to avoid losing marks in table recordings and graph plotting.',
    organizer: 'Video Learning Uganda Science Faculty',
    bannerImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    status: 'Upcoming',
    maxRegistrations: 650,
    currentRegistrations: 512,
    downloadableMaterials: [
      {
        name: 'UNEB_Science_Practicals_Checklist_2026.pdf',
        url: '#',
        size: '3.2 MB'
      }
    ]
  },
  {
    id: 'evt-3',
    title: 'Teachers\' Digital Pedagogy & Audio-Visual Content Creation Workshop',
    type: 'Workshop',
    audience: 'Teachers',
    date: 'Saturday, December 5, 2026',
    time: '2:00 PM - 5:30 PM EAT',
    venue: 'Online Interactive Webinar via Zoom',
    joiningLink: 'https://zoom.us/j/vlearn-teachers-ug',
    description: 'For Ugandan teachers who want to record engaging video lessons using smartphones, prepare print-ready PDF revision summaries, and build gamified Kahoot quizzes for their classrooms.',
    organizer: 'Tr. Ojok Mtn & EdTech Uganda Guild',
    bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    status: 'Upcoming',
    maxRegistrations: 300,
    currentRegistrations: 198,
    downloadableMaterials: [
      {
        name: 'Smartphone_Video_Recording_Guide_For_Teachers.pdf',
        url: '#',
        size: '2.1 MB'
      }
    ]
  },
  {
    id: 'evt-past-1',
    title: 'P.7 Mid-Term PLE Science & SST Mega Clinic 2026',
    type: 'Seminar',
    audience: 'Primary',
    date: 'September 12, 2026',
    time: '8:30 AM - 2:00 PM',
    venue: 'Gulu Youth Centre Auditorium, Gulu City',
    description: 'Over 400 candidates gathered for intensive topical revision in human anatomy, immunization, and East African geography. All participants received free revision booklet copies.',
    organizer: 'Teacher Ojok Mtn',
    bannerImage: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1000&q=80',
    status: 'Past Event',
    currentRegistrations: 420,
    photos: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80'
    ],
    recordingVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    downloadableMaterials: [
      {
        name: 'Gulu_Clinic_Full_Questions_and_Marking_Guide.pdf',
        url: '#',
        size: '5.2 MB'
      }
    ]
  }
];

export const RESOURCES_DATA: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'UNEB PLE Mathematics Past Papers (2020 - 2025) with Step-by-Step Solutions',
    level: 'primary',
    classLevel: 'P7',
    subject: 'Mathematics',
    type: 'Past Paper',
    year: '2025',
    fileSize: '4.8 MB',
    downloadsCount: 1420,
    downloadUrl: '#'
  },
  {
    id: 'res-2',
    title: 'UNEB PLE Integrated Science Comprehensive Topical Revision Manual',
    level: 'primary',
    classLevel: 'P7',
    subject: 'Integrated Science',
    type: 'Revision Notes',
    year: '2026',
    fileSize: '6.2 MB',
    downloadsCount: 2180,
    downloadUrl: '#'
  },
  {
    id: 'res-3',
    title: 'UNEB UCE Physics Paper 1 & 2 Past Examination Papers with Official Marking Scheme',
    level: 'secondary',
    classLevel: 'S4',
    subject: 'Physics',
    type: 'Past Paper',
    year: '2024',
    fileSize: '5.5 MB',
    downloadsCount: 3105,
    downloadUrl: '#'
  },
  {
    id: 'res-4',
    title: 'O-Level Chemistry Practical Titration & Qualitative Analysis Guide',
    level: 'secondary',
    classLevel: 'S4',
    subject: 'Chemistry',
    type: 'Worksheet',
    year: '2025',
    fileSize: '3.1 MB',
    downloadsCount: 1890,
    downloadUrl: '#'
  },
  {
    id: 'res-5',
    title: 'UACE Pure Mathematics (P425) Calculus & Vectors Handout with Solved Questions',
    level: 'secondary',
    classLevel: 'S6',
    subject: 'Mathematics',
    type: 'Revision Notes',
    year: '2025',
    fileSize: '7.4 MB',
    downloadsCount: 950,
    downloadUrl: '#'
  },
  {
    id: 'res-6',
    title: 'P.6 & P.7 Social Studies Atlas & Map Interpretation Handbook',
    level: 'primary',
    classLevel: 'P6',
    subject: 'Social Studies',
    type: 'Revision Notes',
    year: '2026',
    fileSize: '8.1 MB',
    downloadsCount: 1670,
    downloadUrl: '#'
  }
];

export const KAHOOT_SAMPLE_QUESTIONS = [
  {
    id: 'k-q1',
    question: 'What is the capital city of Uganda?',
    options: ['Kampala', 'Entebbe', 'Jinja', 'Gulu'],
    correctAnswerIndex: 0,
    explanation: 'Kampala is the capital and largest city of Uganda.'
  },
  {
    id: 'k-q2',
    question: 'Which is the longest river in the world that originates from Lake Victoria in Jinja?',
    options: ['River Nile', 'River Congo', 'River Niger', 'River Zambezi'],
    correctAnswerIndex: 0,
    explanation: 'The River Nile starts its 6,650 km journey to the Mediterranean Sea right from Jinja, Uganda.'
  },
  {
    id: 'k-q3',
    question: 'In Primary Mathematics, what is the value of 3/4 + 1/2 in simplest form?',
    options: ['1 1/4 (5/4)', '4/6', '7/8', '2/3'],
    correctAnswerIndex: 0,
    explanation: '3/4 + 2/4 = 5/4 = 1 1/4.'
  },
  {
    id: 'k-q4',
    question: 'Which of the following blood cells protects the human body against diseases?',
    options: ['White Blood Cells (Leucocytes)', 'Red Blood Cells (Erythrocytes)', 'Platelets (Thrombocytes)', 'Blood Plasma'],
    correctAnswerIndex: 0,
    explanation: 'White blood cells produce antibodies and engulf harmful pathogens to protect the body.'
  },
  {
    id: 'k-q5',
    question: 'What is the SI unit of electric resistance in Secondary Physics?',
    options: ['Ohm (Ω)', 'Volt (V)', 'Ampere (A)', 'Watt (W)'],
    correctAnswerIndex: 0,
    explanation: 'Resistance is measured in Ohms (Ω), named after Georg Simon Ohm.'
  }
];
