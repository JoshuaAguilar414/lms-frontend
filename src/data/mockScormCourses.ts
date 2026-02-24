/**
 * Mock SCORM courses for dashboard demo.
 * Matches the 8 SCORM packages under public/scorm/.
 */

export interface MockScormCourse {
  id: string;
  title: string;
  scormUrl: string;
  thumbnail: string;
  totalLessons: number;
}

function scormPath(folderName: string): string {
  return `/scorm/${encodeURIComponent(folderName)}/index.html`;
}

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=112&h=112&fit=crop';

export const MOCK_SCORM_COURSES: MockScormCourse[] = [
  {
    id: 'mock-scorm-1',
    title: 'Understanding Climate Risk for Businesses',
    scormUrl: scormPath('Understanding Climate Risk for Businesses'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-2',
    title: 'Strategic ESG Global Standards',
    scormUrl: scormPath('Strategic ESG Global Standards'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-3',
    title: 'Root Cause Analysis Detection to Prevention',
    scormUrl: scormPath('Root Cause Analysis Detection to Prevention'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-4',
    title: 'How to Recognize the Signs of Forced Labor in Manufacturing',
    scormUrl: scormPath('How_to_Recognize_the_Signs_of_Forced_Labor_in_Manufacturing_dynamic'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-5',
    title: 'How to Recognize the Signs of Forced Labor in Agriculture',
    scormUrl: scormPath('How_to_Recognize_the_Signs_of_Forced_Labor_in_Agriculture_dynamic'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-6',
    title: 'Grievance Resolution Partnership Guide',
    scormUrl: scormPath('Grievance Resolution Partnership Guide'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-7',
    title: 'Grievance Mechanism in Workplace',
    scormUrl: scormPath('Grievance Mechanism in Workplace'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
  {
    id: 'mock-scorm-8',
    title: 'Signs of Forced Labor in Food Industry',
    scormUrl: scormPath('Signs of Forced Labor in Food Industry'),
    thumbnail: PLACEHOLDER_IMAGE,
    totalLessons: 1,
  },
];

export function getMockScormCourse(id: string): MockScormCourse | undefined {
  return MOCK_SCORM_COURSES.find((c) => c.id === id);
}

export function isMockScormId(id: string): boolean {
  return id.startsWith('mock-scorm-');
}
