// components/EmailTemplate.tsx
import * as React from "react";

interface SurveyEmailProps {
  surveyLink: string;
}

export const SurveyEmail: React.FC<SurveyEmailProps> = ({ surveyLink }) => (
  <div>
    <h1>How Did We Do?</h1>
    <p>Please click below to complete our survey:</p>
    <a href={surveyLink}>Start Survey</a>
    <p>Questions include:</p>
    <ul>
      <li>Global service rating (1-5)</li>
      <li>Service quality feedback</li>
      <li>Improvement suggestions</li>
    </ul>
  </div>
);
