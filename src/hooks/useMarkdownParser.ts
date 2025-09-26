'use client';

import { useEffect, useState, useCallback } from 'react';

// Simple fallback markdown parser
const simpleMarkdownParser = (markdown: string): string => {
  console.log('Using simple markdown parser for:', markdown);
  const lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let inBulletList = false;
  let inNumberedList = false;
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableAlignments: string[] = [];
  const footnotes = new Map<string, string>();
  const footnoteRefs = new Set<string>();
  
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const processInlineFormatting = (text: string): string => {
    let processed = escapeHtml(text);
    
    // Bold
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic
    processed = processed.replace(/\*([^*\s][^*]*[^*\s]|\S)\*/g, '<em>$1</em>');
    processed = processed.replace(/_([^_\s][^_]*[^_\s]|\S)_/g, '<em>$1</em>');
    
    // Footnote references
    processed = processed.replace(/\[\^([^\]]+)\]/g, (match, ref) => {
      footnoteRefs.add(ref);
      return `<sup><a href="#footnote-${ref}" id="footnote-ref-${ref}" class="footnote-ref">${ref}</a></sup>`;
    });
    
    // Images with links (badge style) - handle complex patterns first
    processed = processed.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (match, altText, imageUrl, linkUrl) => {
      const unescapedImageUrl = imageUrl.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      const unescapedLinkUrl = linkUrl.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      return `<a href="${unescapedLinkUrl}" target="_blank" rel="noopener noreferrer"><img src="${unescapedImageUrl}" alt="${altText}" /></a>`;
    });
    
    // Regular images
    processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, url) => {
      const unescapedUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      return `<img src="${unescapedUrl}" alt="${altText}" />`;
    });
    
    // Regular links
    processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const unescapedUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      return `<a href="${unescapedUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
    
    // Inline code
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return processed;
  };
  
  const parseTableRow = (line: string): string[] => {
    // Split by | but handle escaped pipes
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    return cells;
  };
  
  const isTableSeparatorRow = (line: string): boolean => {
    const trimmed = line.trim();
    return /^\|?[\s\-\|:]+\|?$/.test(trimmed) && trimmed.includes('-');
  };
  
  const parseTableAlignment = (line: string): string[] => {
    const cells = parseTableRow(line);
    return cells.map(cell => {
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      return 'left';
    });
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Code blocks
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        html += '</code></pre>\n';
        inCodeBlock = false;
      } else {
        if (inBulletList) {
          html += '</ul>\n';
          inBulletList = false;
        }
        if (inNumberedList) {
          html += '</ol>\n';
          inNumberedList = false;
        }
        if (inTable) {
          html += '</tbody>\n</table>\n';
          inTable = false;
          tableHeaders = [];
          tableAlignments = [];
        }
        const language = trimmedLine.substring(3).trim();
        html += `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>`;
        inCodeBlock = true;
      }
      continue;
    }
    
    if (inCodeBlock) {
      html += escapeHtml(line) + '\n';
      continue;
    }
    
    // Check for table start (line with pipes)
    if (!inTable && trimmedLine.includes('|') && !inCodeBlock) {
      const nextLineIndex = i + 1;
      if (nextLineIndex < lines.length && isTableSeparatorRow(lines[nextLineIndex])) {
        // This is a table header
        if (inBulletList) {
          html += '</ul>\n';
          inBulletList = false;
        }
        if (inNumberedList) {
          html += '</ol>\n';
          inNumberedList = false;
        }
        
        tableHeaders = parseTableRow(trimmedLine);
        tableAlignments = parseTableAlignment(lines[nextLineIndex]);
        
        html += '<table>\n<thead>\n<tr>\n';
        tableHeaders.forEach((header, index) => {
          const alignment = tableAlignments[index] || 'left';
          const alignStyle = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
          html += `  <th${alignStyle}>${processInlineFormatting(header)}</th>\n`;
        });
        html += '</tr>\n</thead>\n<tbody>\n';
        inTable = true;
        
        // Skip the separator row
        i++;
        continue;
      }
    }
    
    // Handle table rows
    if (inTable && trimmedLine.includes('|') && !inCodeBlock) {
      const cells = parseTableRow(trimmedLine);
      html += '<tr>\n';
      cells.forEach((cell, index) => {
        const alignment = tableAlignments[index] || 'left';
        const alignStyle = alignment !== 'left' ? ` style="text-align: ${alignment}"` : '';
        html += `  <td${alignStyle}>${processInlineFormatting(cell)}</td>\n`;
      });
      html += '</tr>\n';
      continue;
    }
    
    // End table if we're in one and encounter non-table content
    if (inTable && !trimmedLine.includes('|') && trimmedLine !== '') {
      html += '</tbody>\n</table>\n';
      inTable = false;
      tableHeaders = [];
      tableAlignments = [];
    }

    // Headers
    if (trimmedLine.match(/^#{1,6}\s+/)) {
      const level = trimmedLine.match(/^#+/)?.[0].length || 1;
      const content = processInlineFormatting(trimmedLine.substring(level + 1).trim());
      
      if (inBulletList) {
        html += '</ul>\n';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>\n';
        inNumberedList = false;
      }
      if (inTable) {
        html += '</tbody>\n</table>\n';
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
      }
      
      html += `<h${level}>${content}</h${level}>\n`;
    }
    // Horizontal Rules (Dividers)
    else if (trimmedLine.match(/^-{3,}$/) || trimmedLine.match(/^\*{3,}$/) || trimmedLine.match(/^_{3,}$/)) {
      console.log('Found horizontal rule:', trimmedLine);
      if (inBulletList) {
        html += '</ul>\n';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>\n';
        inNumberedList = false;
      }
      if (inTable) {
        html += '</tbody>\n</table>\n';
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
      }
      
      html += '<hr>\n';
      console.log('Added horizontal rule');
    }
    // Blockquotes
    else if (trimmedLine.startsWith('> ')) {
      if (inBulletList) {
        html += '</ul>\n';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>\n';
        inNumberedList = false;
      }
      if (inTable) {
        html += '</tbody>\n</table>\n';
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
      }
      const quoteContent = processInlineFormatting(trimmedLine.substring(2));
      html += `<blockquote><p>${quoteContent}</p></blockquote>\n`;
    }
    // Bullet Lists
    else if (trimmedLine.match(/^[-*+]\s/) || trimmedLine.match(/^\s+[-*+]\s/)) {
      console.log('Found bullet list item:', trimmedLine);
      
      // Check indentation level
      const indent = line.length - line.trimStart().length;
      const isIndented = indent >= 2; // Nested if indented by 2+ spaces
      
      // Check if this is a task list item
      const taskMatch = trimmedLine.match(/^[-*+]\s+\[([ xX])\]\s+(.*)$/) || 
                       trimmedLine.match(/^\s+[-*+]\s+\[([ xX])\]\s+(.*)$/);
      
      if (taskMatch) {
        console.log('Found task list item:', trimmedLine);
        const [, checkState, taskText] = taskMatch;
        const isChecked = checkState.toLowerCase() === 'x';
        
        if (!inBulletList) {
          // Only end numbered list if this is not nested (not indented)
          if (inNumberedList && !isIndented) {
            html += '</ol>\n';
            inNumberedList = false;
          }
          if (inTable) {
            html += '</tbody>\n</table>\n';
            inTable = false;
            tableHeaders = [];
            tableAlignments = [];
          }
          html += '<ul class="task-list">\n';
          inBulletList = true;
          console.log('Started task list');
        }
        
        const content = processInlineFormatting(taskText);
        const checkedAttr = isChecked ? ' checked' : '';
        const checkedClass = isChecked ? ' task-list-item-checked' : '';
        html += `  <li class="task-list-item${checkedClass}">`;
        html += `<input type="checkbox"${checkedAttr} disabled> `;
        html += `<span class="task-text">${content}</span></li>\n`;
        console.log('Added task item:', content, 'checked:', isChecked);
      } else {
        // Regular bullet list item
        if (!inBulletList) {
          // Only end numbered list if this is not nested (not indented)
          if (inNumberedList && !isIndented) {
            html += '</ol>\n';
            inNumberedList = false;
          }
          if (inTable) {
            html += '</tbody>\n</table>\n';
            inTable = false;
            tableHeaders = [];
            tableAlignments = [];
          }
          html += '<ul>\n';
          inBulletList = true;
          console.log('Started bullet list');
        }
        
        // Handle both regular and indented bullet points
        const bulletContent = isIndented ? 
          trimmedLine.replace(/^[-*+]\s/, '') : 
          trimmedLine.substring(2);
        const content = processInlineFormatting(bulletContent);
        html += `  <li>${content}</li>\n`;
        console.log('Added bullet item:', content);
      }
    }
    // Numbered Lists
    else if (trimmedLine.match(/^\d+\.\s/)) {
      console.log('Found numbered list item:', trimmedLine);
      if (!inNumberedList) {
        if (inBulletList) {
          html += '</ul>\n';
          inBulletList = false;
        }
        if (inTable) {
          html += '</tbody>\n</table>\n';
          inTable = false;
          tableHeaders = [];
          tableAlignments = [];
        }
        html += '<ol>\n';
        inNumberedList = true;
        console.log('Started numbered list');
      }
      const content = processInlineFormatting(trimmedLine.replace(/^\d+\.\s/, ''));
      html += `  <li>${content}</li>\n`;
      console.log('Added numbered item:', content);
    }
    // Footnote definitions
    else if (trimmedLine.match(/^\[\^([^\]]+)\]:\s*/)) {
      const match = trimmedLine.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
      if (match) {
        const [, ref, content] = match;
        footnotes.set(ref, content);
        console.log('Found footnote definition:', ref, content);
      }
      // Don't render footnote definitions in the main content
      continue;
    }
    // Empty lines
    else if (trimmedLine === '') {
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextLineRaw = i + 1 < lines.length ? lines[i + 1] : '';
      
      // End table on empty line
      if (inTable) {
        html += '</tbody>\n</table>\n';
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
      }
      
      // Check if next line is a nested list item (indented)
      const isNextLineNestedBullet = /^\s{2,}[-*+]\s/.test(nextLineRaw);
      const isNextLineNestedNumber = /^\s{2,}\d+\.\s/.test(nextLineRaw);
      const isNextLineNormalBullet = /^[-*+]\s/.test(nextLine);
      const isNextLineNormalNumber = /^\d+\.\s/.test(nextLine);
      
      // Only end bullet list if next line is not a bullet or nested item
      if (inBulletList && !isNextLineNestedBullet && !isNextLineNormalBullet) {
        html += '</ul>\n';
        inBulletList = false;
      }
      
      // Only end numbered list if next line is not a number or nested item
      if (inNumberedList && !isNextLineNestedNumber && !isNextLineNormalNumber) {
        html += '</ol>\n';
        inNumberedList = false;
      }
      
      if (!inBulletList && !inNumberedList) {
        html += '\n';
      }
    }
    // Regular paragraphs
    else if (trimmedLine !== '') {
      if (inBulletList) {
        html += '</ul>\n';
        inBulletList = false;
      }
      if (inNumberedList) {
        html += '</ol>\n';
        inNumberedList = false;
      }
      if (inTable) {
        html += '</tbody>\n</table>\n';
        inTable = false;
        tableHeaders = [];
        tableAlignments = [];
      }
      
      const processedLine = processInlineFormatting(trimmedLine);
      
      // Check if the next line is also a non-empty paragraph line
      const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
      const nextLineRaw = i + 1 < lines.length ? lines[i + 1] : '';
      const isNextLineAlsoParagraph = nextLine !== '' && 
        !nextLine.match(/^#{1,6}\s+/) && // not header
        !nextLine.startsWith('> ') && // not blockquote
        !nextLine.match(/^[-*+]\s/) && // not bullet list
        !/^\s{2,}[-*+]\s/.test(nextLineRaw) && // not nested bullet list
        !nextLine.match(/^\d+\.\s/) && // not numbered list
        !/^\s{2,}\d+\.\s/.test(nextLineRaw) && // not nested numbered list
        !nextLine.startsWith('```') && // not code block
        !nextLine.match(/^\[\^([^\]]+)\]:\s*/) && // not footnote definition
        !nextLine.includes('|') && // not table
        !nextLine.match(/^-{3,}$/) && !nextLine.match(/^\*{3,}$/) && !nextLine.match(/^_{3,}$/); // not horizontal rule
      
      if (isNextLineAlsoParagraph) {
        // Add line break for continuous paragraphs
        html += `<p>${processedLine}<br></p>\n`;
      } else {
        html += `<p>${processedLine}</p>\n`;
      }
    }
  }
  
  // Close any open tags at the end
  if (inCodeBlock) {
    html += '</code></pre>\n';
  }
  if (inBulletList) {
    html += '</ul>\n';
  }
  if (inNumberedList) {
    html += '</ol>\n';
  }
  if (inTable) {
    html += '</tbody>\n</table>\n';
  }
  
  // Add footnotes section if there are any
  if (footnotes.size > 0) {
    html += '<div class="footnotes">\n<hr>\n<ol>\n';
    
    // Only include footnotes that were actually referenced
    Array.from(footnoteRefs).forEach(ref => {
      const content = footnotes.get(ref);
      if (content) {
        const processedContent = processInlineFormatting(content);
        html += `<li id="footnote-${ref}">${processedContent} <a href="#footnote-ref-${ref}" class="footnote-backref">↩</a></li>\n`;
      }
    });
    
    html += '</ol>\n</div>\n';
    console.log('Added footnotes section with', footnoteRefs.size, 'footnotes');
  }
  
  console.log('Simple parser final HTML:', html);
  return html;
};

interface MarkdownParser {
  parseMarkdown: (markdown: string) => Promise<string>;
}

let parserInstance: MarkdownParser | null = null;

export const useMarkdownParser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadParser = async () => {
      if (parserInstance) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        try {
          const [{ unified }, remarkParse, remarkRehype, rehypeStringify, rehypeSanitize] =
            await Promise.all([
              import('unified'),
              import('remark-parse'),
              import('remark-rehype'),
              import('rehype-stringify'),
              import('rehype-sanitize')
            ]);

          parserInstance = {
            parseMarkdown: async (markdown: string) => {
              try {
                // Check if markdown contains footnotes - if so, use fallback parser
                if (markdown.includes('[^') && /\[\^[^\]]+\]/.test(markdown)) {
                  console.log('Footnotes detected, using fallback parser for better support');
                  return simpleMarkdownParser(markdown);
                }
                
                // Check if markdown contains image badges or complex images - if so, use fallback parser
                if (markdown.includes('![') && (/!\[[^\]]*\]\([^)]*[&?][^)]*\)/.test(markdown) || /\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/.test(markdown))) {
                  console.log('Complex images detected, using fallback parser for better support');
                  return simpleMarkdownParser(markdown);
                }
                
                // Check if markdown contains tables - if so, use fallback parser
                if (markdown.includes('|') && /\|.*\|/.test(markdown)) {
                  console.log('Tables detected, using fallback parser for better support');
                  return simpleMarkdownParser(markdown);
                }
                
                // Check if markdown contains task lists - if so, use fallback parser
                if (/^[-*+]\s+\[[ xX]\]\s+/.test(markdown) || markdown.includes('- [') || markdown.includes('- [x]')) {
                  console.log('Task lists detected, using fallback parser for better support');
                  return simpleMarkdownParser(markdown);
                }
                
                // Check if markdown contains horizontal rules - if so, use fallback parser
                if (/^-{3,}$/m.test(markdown) || /^\*{3,}$/m.test(markdown) || /^_{3,}$/m.test(markdown)) {
                  console.log('Horizontal rules detected, using fallback parser for better support');
                  return simpleMarkdownParser(markdown);
                }
                
                // Check if markdown has consecutive non-empty lines (line break preservation needed)
                const lines = markdown.split('\n');
                let hasConsecutiveLines = false;
                for (let i = 0; i < lines.length - 1; i++) {
                  const currentLine = lines[i].trim();
                  const nextLine = lines[i + 1].trim();
                  if (currentLine !== '' && nextLine !== '' && 
                      !currentLine.match(/^#{1,6}\s+/) && !nextLine.match(/^#{1,6}\s+/) &&
                      !currentLine.startsWith('> ') && !nextLine.startsWith('> ') &&
                      !currentLine.match(/^[-*+]\s/) && !nextLine.match(/^[-*+]\s/) &&
                      !currentLine.match(/^\d+\.\s/) && !nextLine.match(/^\d+\.\s/)) {
                    hasConsecutiveLines = true;
                    break;
                  }
                }
                
                if (hasConsecutiveLines) {
                  console.log('Consecutive lines detected, using fallback parser for line break preservation');
                  return simpleMarkdownParser(markdown);
                }
                
                console.log('Attempting unified parser...');
                const processor = unified()
                  .use(remarkParse.default)
                  .use(remarkRehype.default, { allowDangerousHtml: false })
                  .use(rehypeSanitize.default)
                  .use(rehypeStringify.default);

                const file = await processor.process(markdown);
                const result = String(file);
                console.log('Unified parser succeeded:', result);
                return result;
              } catch (processingError) {
                console.warn('Unified parser failed, using fallback:', processingError);
                return simpleMarkdownParser(markdown);
              }
            }
          };
          
          console.log('Unified parser loaded successfully');
        } catch (loadError) {
          console.warn('Failed to load unified parser, using fallback:', loadError);
          
          parserInstance = {
            parseMarkdown: async (markdown: string) => {
              console.log('Using fallback parser only');
              return simpleMarkdownParser(markdown);
            }
          };
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Critical parser error:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    loadParser();
  }, []);

  const parseMarkdown = useCallback(async (markdown: string): Promise<string> => {
    console.log('parseMarkdown called with:', markdown);
    
    if (!parserInstance) {
      throw new Error('Parser not loaded yet');
    }
    
    const result = await parserInstance.parseMarkdown(markdown);
    console.log('parseMarkdown result:', result);
    
    return result;
  }, []);

  return { parseMarkdown, isLoading, error };
};
