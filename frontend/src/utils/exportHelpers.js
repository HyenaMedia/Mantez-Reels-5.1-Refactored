/**
 * Export System - Week 11
 * Export page to multiple formats
 */

export const exportHelpers = {
  // Export as clean HTML/CSS/JS
  exportHTML: (pageState) => {
    const html = generateHTML(pageState);
    const css = generateCSS(pageState);
    const js = generateJS(pageState);
    
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageState.page.meta.settings.seo.title || 'My Page'}</title>
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>${js}</script>
</body>
</html>`;
    
    return fullHTML;
  },

  // Export as React components
  exportReact: (pageState) => {
    const componentCode = `import React from 'react';
import './styles.css';

const Page = () => {
  return (
    <>
      ${generateReactJSX(pageState)}
    </>
  );
};

export default Page;`;

    const stylesCode = generateCSS(pageState);
    
    return {
      'Page.jsx': componentCode,
      'styles.css': stylesCode
    };
  },

  // Download file helper
  downloadFile: (content, filename, mimeType = 'text/html') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
};

function generateHTML(pageState) {
  let html = '';
  pageState.page.sections.forEach(section => {
    html += `<section id="${section.id}" class="section-${section.id}">\n`;
    html += `  <div class="container">\n`;
    
    section.elements.forEach(element => {
      html += generateElementHTML(element);
    });
    
    html += `  </div>\n`;
    html += `</section>\n`;
  });
  
  return html;
}

function generateElementHTML(element) {
  switch (element.type) {
    case 'heading': {
      const tag = element.props.tag || 'h2';
      return `    <${tag} class="el-${element.id}">${element.props.text}</${tag}>\n`;
    }
    case 'text':
      return `    <p class="el-${element.id}">${element.props.text}</p>\n`;
    case 'button':
      return `    <a href="${element.props.link}" class="el-${element.id} btn">${element.props.text}</a>\n`;
    case 'image':
      return `    <img src="${element.props.src}" alt="${element.props.alt}" class="el-${element.id}" />\n`;
    default:
      return '';
  }
}

function generateCSS(pageState) {
  let css = `/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Inter, sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Sections */\n`;

  pageState.page.sections.forEach(section => {
    css += `.section-${section.id} {\n`;
    
    if (section.styles?.background?.type === 'gradient') {
      const g = section.styles.background.gradient;
      css += `  background: linear-gradient(${g.angle}deg, ${g.colors[0]}, ${g.colors[1]});\n`;
    }
    
    if (section.styles?.padding) {
      const p = section.styles.padding;
      css += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
    }
    
    if (section.styles?.minHeight) {
      css += `  min-height: ${section.styles.minHeight};\n`;
    }
    
    css += `}\n\n`;
    
    // Element styles
    section.elements.forEach(element => {
      css += `.el-${element.id} {\n`;
      
      if (element.styles?.typography) {
        const t = element.styles.typography;
        if (t.fontSize) css += `  font-size: ${t.fontSize}px;\n`;
        if (t.fontWeight) css += `  font-weight: ${t.fontWeight};\n`;
        if (t.color) css += `  color: ${t.color};\n`;
        if (t.textAlign) css += `  text-align: ${t.textAlign};\n`;
      }
      
      if (element.styles?.spacing) {
        const s = element.styles.spacing;
        if (s.marginBottom) css += `  margin-bottom: ${s.marginBottom}px;\n`;
      }
      
      if (element.type === 'button') {
        if (element.styles?.background) css += `  background: ${element.styles.background};\n`;
        if (element.styles?.borderRadius) css += `  border-radius: ${element.styles.borderRadius}px;\n`;
        if (element.styles?.padding) {
          const p = element.styles.padding;
          css += `  padding: ${p.top}px ${p.right}px ${p.bottom}px ${p.left}px;\n`;
        }
        css += `  text-decoration: none;\n  display: inline-block;\n`;
      }
      
      css += `}\n\n`;
    });
  });

  // Responsive
  css += `/* Responsive */
@media (max-width: 768px) {
  .container { padding: 0 16px; }
}`;

  return css;
}

function generateJS(_pageState) {
  return `// Add interactivity here`;
}

function generateReactJSX(pageState) {
  let jsx = '';
  
  pageState.page.sections.forEach(section => {
    jsx += `      <section className="section-${section.id}">\n`;
    jsx += `        <div className="container">\n`;
    
    section.elements.forEach(element => {
      switch (element.type) {
        case 'heading': {
          const Tag = element.props.tag || 'h2';
          jsx += `          <${Tag} className="el-${element.id}">${element.props.text}</${Tag}>\n`;
          break;
        }
        case 'text':
          jsx += `          <p className="el-${element.id}">${element.props.text}</p>\n`;
          break;
        case 'button':
          jsx += `          <a href="${element.props.link}" className="el-${element.id} btn">${element.props.text}</a>\n`;
          break;
      }
    });
    
    jsx += `        </div>\n`;
    jsx += `      </section>\n`;
  });
  
  return jsx;
}
