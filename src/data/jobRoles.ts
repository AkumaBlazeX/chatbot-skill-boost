
export interface JobRole {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: string[];
}

export const jobRoles: JobRole[] = [
  {
    id: 'frontend-dev',
    title: 'Front-End Developer',
    description: 'Build user interfaces and interactive web applications',
    icon: '💻',
    skills: [
      'HTML/CSS',
      'JavaScript',
      'React/Vue/Angular',
      'Responsive Design',
      'Web Performance',
      'Accessibility'
    ]
  },
  {
    id: 'backend-dev',
    title: 'Back-End Developer',
    description: 'Create server-side logic and APIs for web applications',
    icon: '🔧',
    skills: [
      'Server-side Languages',
      'API Design',
      'Database Management',
      'Authentication',
      'Performance Optimization',
      'Security'
    ]
  },
  {
    id: 'qa-specialist',
    title: 'QA Specialist',
    description: 'Ensure product quality through testing and quality processes',
    icon: '🔍',
    skills: [
      'Test Planning',
      'Manual Testing',
      'Automated Testing',
      'Bug Reporting',
      'Test Frameworks',
      'Performance Testing'
    ]
  },
  {
    id: 'data-specialist',
    title: 'Data Specialist',
    description: 'Analyze and manage data to support business decisions',
    icon: '📊',
    skills: [
      'Data Analysis',
      'SQL',
      'Data Visualization',
      'ETL Processes',
      'Statistical Analysis',
      'Machine Learning Basics'
    ]
  }
];
