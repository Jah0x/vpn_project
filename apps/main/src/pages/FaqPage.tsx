import React from 'react';
import MarkdownView from '../components/MarkdownView';
import faq from '../../../docs/faq.md?raw';

const FaqPage: React.FC = () => (
  <div className="min-h-screen bg-gray-900 pt-16 p-6">
    <MarkdownView markdown={faq} />
  </div>
);

export default FaqPage;
