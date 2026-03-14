import type { Category, Scenario } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'school',
    title: 'School',
    emoji: '🎒',
    color: '#7c3aed',
    lightColor: '#ede9fe',
    description: 'Talk to teachers and school office',
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    emoji: '🏥',
    color: '#db2777',
    lightColor: '#fce7f3',
    description: 'Appointments and describing symptoms',
  },
  {
    id: 'everyday',
    title: 'Everyday Life',
    emoji: '🛒',
    color: '#d97706',
    lightColor: '#fef3c7',
    description: 'Shopping, directions, and daily tasks',
  },
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'school-absent',
    categoryId: 'school',
    title: 'My child is sick today',
    description: 'Call the school to report your child absent',
    aiRole: 'school office staff member',
    openingLine: 'Hello, this is Maple Grove School office. How can I help you today?',
    maxTurns: 3,
  },
  {
    id: 'school-teacher',
    categoryId: 'school',
    title: 'Talk to the teacher',
    description: "Ask the teacher about your child's progress",
    aiRole: 'friendly elementary school teacher',
    openingLine: "Hi there! I'm so glad you came in. How can I help you today?",
    maxTurns: 3,
  },
  {
    id: 'healthcare-appointment',
    categoryId: 'healthcare',
    title: 'Book a doctor appointment',
    description: 'Call the clinic to make an appointment for your child',
    aiRole: "doctor's receptionist at a family clinic",
    openingLine: 'Good morning, Sunrise Family Clinic. How can I help you?',
    maxTurns: 3,
  },
  {
    id: 'healthcare-symptoms',
    categoryId: 'healthcare',
    title: 'Describe symptoms',
    description: 'Tell the nurse what your child is feeling',
    aiRole: 'kind and patient clinic nurse',
    openingLine: "Hello! I'm here to help. Can you tell me what symptoms your child is having?",
    maxTurns: 3,
  },
  {
    id: 'everyday-store',
    categoryId: 'everyday',
    title: 'Find something in a store',
    description: 'Ask a store worker for help finding an item',
    aiRole: 'helpful store employee',
    openingLine: 'Hi there! Welcome. Can I help you find something today?',
    maxTurns: 3,
  },
  {
    id: 'everyday-directions',
    categoryId: 'everyday',
    title: 'Ask for directions',
    description: 'Ask someone how to get somewhere',
    aiRole: 'friendly local person',
    openingLine:
      'Hi there! You look like you might need some help. Are you looking for something?',
    maxTurns: 3,
  },
];

export function getScenariosForCategory(categoryId: string): Scenario[] {
  return SCENARIOS.filter((s) => s.categoryId === categoryId);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
