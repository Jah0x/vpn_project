import React from 'react';
import MarkdownView from '../components/MarkdownView';
import policy from '../../../docs/privacy-policy.md?raw';

const PrivacyPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 pt-16 p-6">
    <MarkdownView markdown={policy} />
  </div>
);

export default PrivacyPolicyPage;
