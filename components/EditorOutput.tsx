import React from 'react';

type EditorOutputProps = {
  data: any;
};

const EditorOutput: React.FC<EditorOutputProps> = ({ data }) => {
  if (!data || !data.blocks) {
    console.warn('EditorOutput: No data or blocks found', data);
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
  
  // Helper function to safely extract text content
  const extractTextContent = (block: any): string => {
    if (!block.data) return '';
    
    try {
      // Handle different text formats
      if (typeof block.data.text === 'string') {
        return block.data.text;
      }
      
      // Handle rich text objects
      if (block.data.text && typeof block.data.text === 'object') {
        // If it's a rich text object, try to extract the text
        if (block.data.text.blocks) {
          return block.data.text.blocks.map((b: any) => b.text || '').join('');
        }
        return block.data.text.text || block.data.text.content || '';
      }
      
      // Handle other possible text properties
      if (block.data.content) {
        return typeof block.data.content === 'string' ? block.data.content : '';
      }
      
      return '';
    } catch (error) {
      console.error('Error extracting text content:', error, block);
      return '';
    }
  };

  // Helper function to render rich text content
  const renderRichText = (text: string) => {
    if (!text) return null;
    
    // Handle basic HTML tags safely
    const sanitizedText = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, ''); // Remove embeds
    
    return (
      <span dangerouslySetInnerHTML={{ __html: sanitizedText }} />
    );
  };

  // Fallback renderer for unknown or malformed blocks
  const renderFallbackBlock = (block: any, index: number) => {
    console.warn('Rendering fallback for block:', block);
    
    // Try to extract any text content
    let textContent = '';
    
    if (block.data) {
      if (typeof block.data === 'string') {
        textContent = block.data;
      } else if (block.data.text) {
        textContent = extractTextContent(block);
      } else if (block.data.content) {
        textContent = block.data.content;
      } else {
        // Try to find any string property
        for (const key in block.data) {
          if (typeof block.data[key] === 'string' && block.data[key].trim()) {
            textContent = block.data[key];
            break;
          }
        }
      }
    }
    
    if (textContent.trim()) {
      return (
        <p 
          key={index} 
          style={{ 
            margin: '12px 0', 
            lineHeight: '1.7', 
            color: '#e0e0e0',
            fontSize: '1rem',
            fontStyle: 'italic',
            opacity: 0.8,
            padding: '8px',
            background: '#181920',
            borderRadius: '4px',
            border: '1px solid #333'
          }}
        >
          {renderRichText(textContent)}
        </p>
      );
    }
    
    return (
      <div 
        key={index}
        style={{
          padding: '8px',
          background: '#2d1b1b',
          border: '1px solid #ff6b6b',
          borderRadius: '4px',
          color: '#ff6b6b',
          fontSize: '0.8rem',
          margin: '8px 0'
        }}
      >
        Unable to render block type: {block.type || 'unknown'}
      </div>
    );
  };

  const renderBlock = (block: any, index: number) => {
    try {
      if (!block || !block.type) {
        console.warn('Invalid block:', block);
        return renderFallbackBlock(block, index);
      }

      switch (block.type) {
        case 'header':
          if (block.data && block.data.text) {
            const headerLevel = block.data.level || 2;
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
              return (
                <h1 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h1>
              );
            } else if (headerLevel === 2) {
              return (
                <h2 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h2>
              );
            } else if (headerLevel === 3) {
              return (
                <h3 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h3>
              );
            } else if (headerLevel === 4) {
              return (
                <h4 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h4>
              );
            } else if (headerLevel === 5) {
              return (
                <h5 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h5>
              );
            } else {
              return (
                <h6 key={index} style={headerStyle}>
                  {renderRichText(block.data.text)}
                </h6>
              );
            }
          }
          return renderFallbackBlock(block, index);

        case 'paragraph':
          try {
            const paragraphText = extractTextContent(block);
            if (paragraphText.trim()) {
              return (
                <p 
                  key={index} 
                  style={{ 
                    margin: '12px 0', 
                    lineHeight: '1.7', 
                    color: '#e0e0e0',
                    fontSize: '1rem',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {renderRichText(paragraphText)}
                </p>
              );
            }
            // Return empty paragraph for spacing
            return (
              <p 
                key={index} 
                style={{ 
                  margin: '12px 0', 
                  lineHeight: '1.7', 
                  color: '#e0e0e0',
                  fontSize: '1rem',
                  minHeight: '1.7em'
                }}
              />
            );
          } catch (error) {
            console.error('Error rendering paragraph block:', error, block);
            return renderFallbackBlock(block, index);
          }

        case 'list':
          if (block.data && block.data.items && Array.isArray(block.data.items)) {
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag 
                key={index} 
                style={{ 
                  margin: '12px 0', 
                  paddingLeft: '24px', 
                  color: '#e0e0e0',
                  lineHeight: '1.6'
                }}
              >
                {block.data.items.map((item: any, idx: number) => {
                  const itemText = typeof item === 'string' ? item : extractTextContent({ data: { text: item } });
                  return (
                    <li key={idx} style={{ margin: '4px 0' }}>
                      {renderRichText(itemText)}
                    </li>
                  );
                })}
              </ListTag>
            );
          }
          return renderFallbackBlock(block, index);

        case 'quote':
          if (block.data && block.data.text) {
            const quoteText = extractTextContent(block);
            return (
              <blockquote 
                key={index}
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
                <div>{renderRichText(quoteText)}</div>
                {block.data.caption && (
                  <cite style={{ 
                    display: 'block', 
                    marginTop: '8px', 
                    fontSize: '0.9rem', 
                    color: '#b3b3b3',
                    fontStyle: 'normal'
                  }}>
                    — {block.data.caption}
                  </cite>
                )}
              </blockquote>
            );
          }
          return renderFallbackBlock(block, index);

        case 'code':
          if (block.data && block.data.code) {
            return (
              <div key={index} style={{ margin: '16px 0' }}>
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
                    {block.data.code}
                  </code>
                </pre>
              </div>
            );
          }
          return renderFallbackBlock(block, index);

        case 'delimiter':
          return (
            <hr 
              key={index}
              style={{
                margin: '24px 0',
                border: 'none',
                height: '1px',
                background: '#333',
                opacity: 0.5
              }}
            />
          );

        case 'marker':
          if (block.data && block.data.text) {
            const markerText = extractTextContent(block);
            return (
              <mark 
                key={index}
                style={{
                  background: '#2d7be5',
                  color: '#fff',
                  padding: '2px 4px',
                  borderRadius: '3px'
                }}
              >
                {renderRichText(markerText)}
              </mark>
            );
          }
          return renderFallbackBlock(block, index);

        case 'inlineCode':
          if (block.data && block.data.text) {
            const inlineCodeText = extractTextContent(block);
            return (
              <code 
                key={index}
                style={{
                  background: '#181920',
                  color: '#2d7be5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                  border: '1px solid #333'
                }}
              >
                {inlineCodeText}
              </code>
            );
          }
          return renderFallbackBlock(block, index);

        case 'linkTool':
          if (block.data && block.data.link) {
            return (
              <div key={index} style={{ margin: '16px 0' }}>
                <a 
                  href={block.data.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    padding: '12px',
                    background: '#181920',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    textDecoration: 'none',
                    color: '#2d7be5'
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                    {block.data.meta?.title || block.data.link}
                  </div>
                  {block.data.meta?.description && (
                    <div style={{ fontSize: '0.9rem', color: '#b3b3b3', marginBottom: '4px' }}>
                      {block.data.meta.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {block.data.link}
                  </div>
                </a>
              </div>
            );
          }
          return renderFallbackBlock(block, index);

        case 'checklist':
          if (block.data && block.data.items && Array.isArray(block.data.items)) {
            return (
              <div key={index} style={{ margin: '12px 0' }}>
                {block.data.items.map((item: any, idx: number) => {
                  const itemText = typeof item === 'string' ? item : 
                    (item.text || extractTextContent({ data: { text: item } }));
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={item.checked || false} 
                        readOnly 
                        style={{ marginTop: '2px' }}
                      />
                      <span 
                        style={{ 
                          color: '#e0e0e0',
                          textDecoration: item.checked ? 'line-through' : 'none',
                          opacity: item.checked ? 0.7 : 1
                        }}
                      >
                        {renderRichText(itemText)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }
          return renderFallbackBlock(block, index);

        case 'table':
          if (block.data && block.data.content && Array.isArray(block.data.content)) {
            return (
              <div key={index} style={{ margin: '16px 0', overflow: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  background: '#181920',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <tbody>
                    {block.data.content.map((row: string[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        {row.map((cell: string, cellIdx: number) => (
                          <td 
                            key={cellIdx}
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #333',
                              color: '#e0e0e0',
                              fontSize: '0.9rem'
                            }}
                          >
                            {renderRichText(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return renderFallbackBlock(block, index);

        default:
          console.warn(`Unknown block type: ${block.type}`, block);
          return renderFallbackBlock(block, index);
      }
    } catch (error) {
      console.error('Error rendering block:', error, block);
      return renderFallbackBlock(block, index);
    }
  };

  return (
    <div style={{ color: '#e0e0e0' }}>
      {data.blocks.map((block: any, index: number) => renderBlock(block, index))}
    </div>
  );
};

export default EditorOutput; 