
export interface Question {
  id: string;
  roleId: string;
  text: string;
  type: 'text' | 'code' | 'multiple-choice';
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

export const questions: Record<string, Question[]> = {
  'frontend-dev': [
    {
      id: 'fe-1',
      roleId: 'frontend-dev',
      text: "What's the difference between let, const, and var in JavaScript?",
      type: 'text',
      explanation: "var is function-scoped and can be redeclared, while let and const are block-scoped. const variables cannot be reassigned after declaration, but let variables can be."
    },
    {
      id: 'fe-2',
      roleId: 'frontend-dev',
      text: "How would you use CSS to center a div both horizontally and vertically?",
      type: 'text',
      explanation: "You can use flexbox (display: flex; justify-content: center; align-items: center;) or CSS Grid, or a combination of position: absolute with transform."
    },
    {
      id: 'fe-3',
      roleId: 'frontend-dev',
      text: "Write a JavaScript function that returns the sum of all numbers in an array.",
      type: 'code',
      explanation: "You can use the reduce method to iterate over the array and sum the values, or a for loop to accomplish this task."
    },
    {
      id: 'fe-4',
      roleId: 'frontend-dev',
      text: "Which of these is not a valid way to declare a function in JavaScript?",
      type: 'multiple-choice',
      options: [
        "function myFunc() {}",
        "const myFunc = function() {}",
        "const myFunc = () => {}",
        "function = myFunc() {}"
      ],
      correctAnswer: "function = myFunc() {}",
      explanation: "The correct syntax for function declarations in JavaScript are: traditional function declaration (function myFunc() {}), function expression (const myFunc = function() {}), and arrow function (const myFunc = () => {})."
    }
  ],
  'backend-dev': [
    {
      id: 'be-1',
      roleId: 'backend-dev',
      text: "What are the key differences between REST and GraphQL APIs?",
      type: 'text',
      explanation: "REST uses multiple endpoints with fixed data structures, while GraphQL uses a single endpoint where clients can specify exactly what data they need. REST can require multiple requests for complex data, while GraphQL can retrieve all needed data in a single request."
    },
    {
      id: 'be-2',
      roleId: 'backend-dev',
      text: "Explain the concept of database normalization and when you might want to denormalize.",
      type: 'text',
      explanation: "Normalization organizes data to reduce redundancy and improve data integrity by dividing large tables into smaller ones and defining relationships. Denormalization might be preferred for read-heavy applications where query performance is more important than write performance."
    },
    {
      id: 'be-3',
      roleId: 'backend-dev',
      text: "Write a function that checks if a string is a valid JSON.",
      type: 'code',
      explanation: "You can use JSON.parse inside a try/catch block to check if a string is valid JSON."
    }
  ],
  'qa-specialist': [
    {
      id: 'qa-1',
      roleId: 'qa-specialist',
      text: "What's the difference between black box and white box testing?",
      type: 'text',
      explanation: "Black box testing examines functionality without knowing the internal code structure, while white box testing involves knowledge of the internal logic and code structure to design tests."
    },
    {
      id: 'qa-2',
      roleId: 'qa-specialist',
      text: "Explain the concept of test coverage and its importance.",
      type: 'text',
      explanation: "Test coverage measures the amount of code that is being tested by automated tests, helping identify untested parts of an application. High coverage doesn't guarantee quality but low coverage definitely indicates insufficient testing."
    }
  ],
  'data-specialist': [
    {
      id: 'ds-1',
      roleId: 'data-specialist',
      text: "What's the difference between a LEFT JOIN and an INNER JOIN in SQL?",
      type: 'text',
      explanation: "An INNER JOIN returns only the matching rows between tables. A LEFT JOIN returns all rows from the left table and matching rows from the right table, with NULL values for non-matches."
    },
    {
      id: 'ds-2',
      roleId: 'data-specialist',
      text: "Explain the concept of overfitting in machine learning models.",
      type: 'text',
      explanation: "Overfitting occurs when a model learns the training data too well, including noise and outliers, causing it to perform poorly on new, unseen data. It happens when a model is too complex relative to the amount and noisiness of the training data."
    }
  ]
};
