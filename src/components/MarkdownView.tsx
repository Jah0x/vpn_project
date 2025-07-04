import React from 'react';

interface MarkdownViewProps {
  markdown: string;
}

const renderMarkdown = (md: string): string => {
  let html = md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');

  html = html
    .replace(/^\- (.*)$/gm, '<li>$1</li>')
    .replace(/<li>(.*?)<\/li>(\n<li>)/g, '<ul><li>$1</li>$2')
    .replace(/(<li>.*<\/li>)(?!\n<li>)/g, '$1</ul>');

  html = html.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>');
  return '<p>' + html + '</p>';
};

const MarkdownView: React.FC<MarkdownViewProps> = ({ markdown }) => {
  const html = React.useMemo(() => renderMarkdown(markdown), [markdown]);

  return (
    <div
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MarkdownView;
