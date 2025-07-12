"use client";
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return (
      <div style={{ 
        padding: '12px', 
        background: '#2d1b1b', 
        border: '1px solid #ff6b6b', 
        borderRadius: '4px', 
        color: '#ff6b6b',
        fontSize: '0.9rem'
      }}>
        No content available
      </div>
    );
  }

  // Split content into lines for processing
  const lines = content.split('\n');
  const renderedLines: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: string[] = [];

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    // Handle bold text: **text** or __text__
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Handle italic text: *text* or _text_
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    text = text.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Handle inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  const renderList = (items: string[]) => {
    if (items.length === 0) return null;
    
    return (
      <ul style={{ 
        margin: '12px 0', 
        paddingLeft: '24px', 
        color: '#e0e0e0',
        lineHeight: '1.6'
      }}>
        {items.map((item, index) => (
          <li key={index} style={{ margin: '4px 0' }}>
            {renderInlineMarkdown(item)}
          </li>
        ))}
      </ul>
    );
  };

  const renderCodeBlock = (content: string[]) => {
    if (content.length === 0) return null;
    
    return (
      <div style={{ margin: '16px 0' }}>
        <pre
          style={{
            background: '#181920',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            border: '1px solid #333',
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          <code style={{ 
            color: '#e0e0e0', 
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            {content.join('\n')}
          </code>
        </pre>
      </div>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        renderedLines.push(renderCodeBlock(codeBlockContent));
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        if (listItems.length > 0) {
          renderedLines.push(renderList(listItems));
          listItems = [];
          inList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Handle headers
    if (trimmedLine.startsWith('#')) {
      if (listItems.length > 0) {
        renderedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const headerText = trimmedLine.replace(/^#+\s*/, '');
      
      const headerLevel = Math.min(level, 6);
      const headerStyle = {
        margin: '16px 0 8px 0' as const,
        color: '#fff' as const,
        fontWeight: 600 as const,
        fontSize: headerLevel === 1 ? '2rem' : 
                 headerLevel === 2 ? '1.5rem' : 
                 headerLevel === 3 ? '1.25rem' : '1.1rem',
        lineHeight: '1.3' as const
      };

      if (headerLevel === 1) {
        renderedLines.push(
          <h1 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h1>
        );
      } else if (headerLevel === 2) {
        renderedLines.push(
          <h2 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h2>
        );
      } else if (headerLevel === 3) {
        renderedLines.push(
          <h3 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h3>
        );
      } else if (headerLevel === 4) {
        renderedLines.push(
          <h4 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h4>
        );
      } else if (headerLevel === 5) {
        renderedLines.push(
          <h5 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h5>
        );
      } else {
        renderedLines.push(
          <h6 key={i} style={headerStyle}>
            {renderInlineMarkdown(headerText)}
          </h6>
        );
      }
      continue;
    }

    // Handle lists
    if (trimmedLine.startsWith('• ') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) {
        inList = true;
      }
      listItems.push(trimmedLine.substring(2));
      continue;
    }

    // Handle quotes
    if (trimmedLine.startsWith('> ')) {
      if (listItems.length > 0) {
        renderedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      
      const quoteText = trimmedLine.substring(2);
      renderedLines.push(
        <blockquote 
          key={i}
          style={{
            margin: '16px 0',
            padding: '12px 20px',
            borderLeft: '4px solid #2d7be5',
            background: '#181920',
            borderRadius: '4px',
            fontStyle: 'italic',
            color: '#e0e0e0'
          }}
        >
          {renderInlineMarkdown(quoteText)}
        </blockquote>
      );
      continue;
    }

    // Handle dividers
    if (trimmedLine === '---' || trimmedLine === '***' || trimmedLine === '___') {
      if (listItems.length > 0) {
        renderedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      
      renderedLines.push(
        <hr 
          key={i}
          style={{
            margin: '24px 0',
            border: 'none',
            height: '1px',
            background: '#333',
            opacity: 0.5
          }}
        />
      );
      continue;
    }

    // Handle regular paragraphs
    if (trimmedLine) {
      if (listItems.length > 0) {
        renderedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      
      renderedLines.push(
        <p 
          key={i}
          style={{ 
            margin: '12px 0', 
            lineHeight: '1.7', 
            color: '#e0e0e0',
            fontSize: '1rem',
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          {renderInlineMarkdown(trimmedLine)}
        </p>
      );
    } else {
      // Empty line - end current list if any
      if (listItems.length > 0) {
        renderedLines.push(renderList(listItems));
        listItems = [];
        inList = false;
      }
      
      // Add spacing
      renderedLines.push(
        <p 
          key={i}
          style={{ 
            margin: '12px 0', 
            lineHeight: '1.7', 
            color: '#e0e0e0',
            fontSize: '1rem',
            minHeight: '1.7em'
          }}
        />
      );
    }
  }

  // Handle any remaining list items
  if (listItems.length > 0) {
    renderedLines.push(renderList(listItems));
  }

  // Handle any remaining code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    renderedLines.push(renderCodeBlock(codeBlockContent));
  }

  return (
    <div style={{ color: '#e0e0e0' }}>
      {renderedLines}
    </div>
  );
};

export default MarkdownRenderer; 