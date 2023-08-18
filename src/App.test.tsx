// Importing necessary modules from their respective packages.
import React from 'react'; // Core React library.
import { render, screen } from '@testing-library/react'; // Testing utilities from the React Testing Library.
import App from './App'; // The main App component that will be tested.

// Defining a test suite for the App component.
test('renders learn react link', () => {
  // Rendering the App component in a virtual DOM for testing.
  // If the App component's structure or behavior changes, it may affect the outcome of this test.
  render(<App />);

  // Using a query to find an element with the text "learn react" (case-insensitive) in the rendered output.
  // If the text or its casing changes in the App component, this query might fail.
  const linkElement = screen.getByText(/learn react/i);

  // Expectation: The queried element should be present in the document.
  // If the element is removed or its text changes, this test will fail.
  expect(linkElement).toBeInTheDocument();
});
