import { Question, SubjectCategory } from '../types';

export const QUESTIONS_BANK: Question[] = [
  {
    id: 'q1',
    subject: 'Physiology & Biochemistry',
    topic: 'Cardiology (Action Potential)',
    question: 'A 45-year-old female presents with palpitations. An ECG shows prolonged QT interval. During Phase 3 of the ventricular action potential, which of the following ion currents is primarily responsible for repolarization?',
    options: [
      'Rapid influx of Sodium (Na+) via fast channels',
      'Influx of Calcium (Ca2+) via L-type channels',
      'Efflux of Potassium (K+) via delayed rectifier channels',
      'Efflux of Sodium (Na+) via the Na+/K+ ATPase pump',
      'Transient outward Potassium (K+) current'
    ],
    correctAnswerIndex: 2,
    explanation: 'Phase 3 (rapid repolarization) of the cardiac action potential is primarily driven by the efflux of potassium (K+) through delayed rectifier potassium channels (IKr and IKs). Prolongation of the QT interval is frequently due to congenital mutations or drug-induced blockage of these channels, leading to delayed ventricular repolarization.',
    reference: "Ganong's Review of Medical Physiology, 26th Ed, Chapter 30"
  },
  {
    id: 'q2',
    subject: 'Anatomy',
    topic: 'Abdominal Wall (Hernia)',
    question: 'A elderly patient presents with a swelling in the groin area. During surgical exploration, the hernia sac is noted to emerge medial to the inferior epigastric artery. Which of the following hernia types is most likely present?',
    options: [
      'Indirect Inguinal Hernia',
      'Direct Inguinal Hernia',
      'Femoral Hernia',
      'Obturator Hernia',
      'Umbilical Hernia'
    ],
    correctAnswerIndex: 1,
    explanation: 'A direct inguinal hernia emerges through Hesselbach’s triangle, which is medial to the inferior epigastric artery. An indirect inguinal hernia, by contrast, passes lateral to the inferior epigastric artery through the deep inguinal ring. Direct hernias are caused by weakness in the posterior wall of the inguinal canal (transversalis fascia).',
    reference: "Gray's Anatomy for Students, 4th Ed, p. 288"
  },
  {
    id: 'q3',
    subject: 'Medicine & Allied',
    topic: 'Endocrinology (Adrenal)',
    question: 'A 32-year-old male presents with worsening weakness, hyperpigmentation, weight loss, and recurrent postural dizziness. His laboratory results reveal a serum glucose of 65 mg/dL, potassium of 5.8 mEq/L, and sodium of 128 mEq/L. Which of the following diagnostic tests is the single best next step to confirm primary adrenal insufficiency?',
    options: [
      '24-Hour Urinary Free Cortisol measurement',
      'High-dose ACTH stimulation (Cosyntropin) test',
      'Overnight 1 mg Dexamethasone suppression test',
      'Morning plasma aldosterone-to-renin ratio',
      'Insulin-induced hypoglycemia test'
    ],
    correctAnswerIndex: 1,
    explanation: 'Primary adrenal insufficiency (Addison\'s disease) presents with hyperpigmentation due to high ACTH levels (which stimulates melanocytes via alpha-MSH cleavage), along with hyponatremia, hyperkalemia, and hypoglycemia. The high-dose ACTH (cosyntropin) stimulation test is the gold standard diagnostic test: a failure of serum cortisol to rise above 18-20 mcg/dL confirmed primary adrenal hypofunction.',
    reference: "Harrison's Principles of Internal Medicine, 21st Ed, Chapter 379"
  },
  {
    id: 'q4',
    subject: 'Pathology & Microbiology',
    topic: 'Hematology (Leukemia)',
    question: 'A 63-year-old male is evaluated for generalized fatigue and easy bruising. Physical examination reveals painless lymphadenopathy and splenomegaly. Complete blood count shows a marked leukocytosis (WBC 85,000/μL) consisting predominantly of small, mature-appearing lymphocytes. Smudged cells are prominent on the peripheral blood smear. What is the most likely diagnosis?',
    options: [
      'Acute Myeloid Leukemia (AML)',
      'Chronic Lymphocytic Leukemia (CLL)',
      'Chronic Myeloid Leukemia (CML)',
      'Acute Lymphoblastic Leukemia (ALL)',
      'Hairy Cell Leukemia'
    ],
    correctAnswerIndex: 1,
    explanation: 'Chronic Lymphocytic Leukemia (CLL) is characterized by a clonal proliferation of mature B lymphocytes, typically diagnosed in elderly adults. Key diagnostic markers in the peripheral smear include small, mature-looking lymphocytes and "smudge cells" or "basket cells", which are fragile lymphocytes ruptured during smear preparation.',
    reference: "Robbins & Cotran Pathologic Basis of Disease, 10th Ed, Chapter 13"
  },
  {
    id: 'q5',
    subject: 'Surgery & Allied',
    topic: 'Gastroenterology (Perforation)',
    question: 'A 28-year-old male presents to the Emergency Department with sudden-onset, severe, generalized abdominal pain. On examination, he has a rigid, board-like abdomen and diffuse tenderness. An erect chest X-ray reveals subdiaphragmatic free air. What is the immediate definitive management required for this patient?',
    options: [
      'High-dose intravenous broad-spectrum antibiotics and observation',
      'Nasogastric tube decompression and fluid resuscitation',
      'Emergency exploratory laparotomy or laparoscopy with repair of perforated viscus',
      'Contrast-enhanced CT scan of the abdomen to locate the perforation site',
      'Esophagogastroduodenoscopy (EGD) to seal the perforation endoscopically'
    ],
    correctAnswerIndex: 2,
    explanation: 'Free air under the diaphragm on an erect chest X-ray indicates pneumoperitoneum, usually due to a perforated hollow viscus (such as a duodenal ulcer or appendicitis). Combined with a "board-like" abdomen indicating generalized peritonitis, this is a surgical emergency that requires immediate resuscitation and emergency exploratory laparotomy or laparoscopy to repair the perforation.',
    reference: "Bailey & Love's Short Practice of Surgery, 27th Ed, Chapter 60"
  },
  {
    id: 'q6',
    subject: 'Gynecology & Obstetrics',
    topic: 'Hypertension in Pregnancy',
    question: 'A 24-year-old primigravida at 34 weeks of gestation presents with a blood pressure of 165/110 mmHg on two separate readings and 3+ proteinuria. She complains of severe persistent headache and epigastric pain. Which of the following drugs is the best choice to prevent seizures in this patient?',
    options: [
      'Phenytoin',
      'Diazepam',
      'Magnesium Sulfate',
      'Phenobarbital',
      'Labetalol'
    ],
    correctAnswerIndex: 2,
    explanation: 'This patient has preeclampsia with severe features (BP >= 160/110, severe headache, epigastric pain indicating hepatic capsule distension, and significant proteinuria). Magnesium sulfate is the therapy of choice for active seizure prophylaxis in severe preeclampsia, significantly outperforming phenytoin and diazepam.',
    reference: "William's Obstetrics, 26th Ed, Chapter 40"
  },
  {
    id: 'q7',
    subject: 'Pediatrics',
    topic: 'Dehydration & Rehydration',
    question: 'A 14-month-old infant is brought to the clinic with watery diarrhea and vomiting of 2 days duration. Physical examination shows sunken eyes, dry mucous membranes, a sluggish skin pinch (retracts in 1.5 seconds), and extreme restlessness. What is the WHO assessment of dehydration and the appropriate management category?',
    options: [
      'No Dehydration; Plan A (Home therapy with ORS)',
      'Severe Dehydration; Plan C (Immediate IV fluids)',
      'Some Dehydration; Plan B (Oral rehydration with ORS)',
      'Moderate Dehydration; Plan C (IV fluids over 6 hours)',
      'Hypernatremic Dehydration; Plan A (Oral water only)'
    ],
    correctAnswerIndex: 2,
    explanation: 'According to WHO guidelines for IMCI (Integrated Management of Childhood Illness), the presence of two or more signs including restless/irritable behavior, sunken eyes, dry mucous membranes, and a slow skin pinch (under 2 seconds) classifies the child as having "Some Dehydration". This should be treated under Plan B, which consists of oral rehydration therapy (ORT) with low-osmolality ORS under clinic supervision over 4 hours.',
    reference: "Nelson Textbook of Pediatrics, 21st Ed, Chapter 363"
  }
];

export const LIVE_EXAMS_DATA = [
  {
    id: 'live1',
    title: 'FCPS Part I - National Grand Mock Examination',
    subject: 'Medicine & Allied' as SubjectCategory,
    questionCount: 100,
    durationMinutes: 120,
    startTime: 'Scheduled for Today: 8:00 PM',
    status: 'Active' as const,
    questions: QUESTIONS_BANK
  },
  {
    id: 'live2',
    title: 'Paper I Booster Mock - Core Basic Sciences',
    subject: 'Anatomy' as SubjectCategory,
    questionCount: 50,
    durationMinutes: 60,
    startTime: 'Starts Tomorrow: 10:00 AM',
    status: 'Upcoming' as const,
    questions: QUESTIONS_BANK.filter(q => q.subject === 'Anatomy' || q.subject === 'Physiology & Biochemistry')
  },
  {
    id: 'live3',
    title: 'Surgical Foundations Mock - Paper II',
    subject: 'Surgery & Allied' as SubjectCategory,
    questionCount: 80,
    durationMinutes: 90,
    startTime: 'Completed 2 Days Ago',
    status: 'Completed' as const,
    questions: QUESTIONS_BANK.filter(q => q.subject === 'Surgery & Allied' || q.subject === 'Pathology & Microbiology')
  }
];
