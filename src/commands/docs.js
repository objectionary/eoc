/**
 * Generates documentation from XMIR files.
 *
 * @module docs
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const marked = require('marked');

const inputDir = './xmir_files';
const outputDir = './docs';

const markedOptions = {
  breaks: true,
  gfm: true,
  pedantic: false,
  mangle: false,
  headerIds: false
};
marked.setOptions(markedOptions);

const parser = new xml2js.Parser();

const globalProcessedAbstracts = new Set();

/**
 * Reads all XMIR files from the specified directory.
 *
 * @param {string} dir - Path to the directory containing XMIR files.
 * @returns {Promise<Array<{ filename: string, content: string }>>} File contents.
 */
async function readxmirFiles(dir) {
  const files = await fs.promises.readdir(dir);
  const xmirFiles = files.filter(file => file.endsWith('.xmir'));
  const fileContents = [];
  for (const file of xmirFiles) {
    const content = await fs.promises.readFile(path.join(dir, file), 'utf-8');
    fileContents.push({ filename: file, content });
  }
  return fileContents;
}

/**
 * Parses XML content.
 *
 * @param {string} content - XML content.
 * @returns {Promise<Object>} Parsed object.
 */
async function parseXML(content) {
  return parser.parseStringPromise(content);
}

/**
 * Extracts comments from XML.
 *
 * @param {Array} commentsXml - XML comments.
 * @returns {Array<{ line: number, text: string }>} Extracted comments.
 */
function extractComments(commentsXml) {
  if (commentsXml && Array.isArray(commentsXml)) {
    return commentsXml.map(comment => ({
      line: parseInt(comment.$.line, 10),
      text: comment._
    }));
  }
  return [];
}

/**
 * Builds a map from lines to comments.
 *
 * @param {Array<{ line: number, text: string }>} comments - Comments.
 * @returns {Object} Line-to-comment map.
 */
function buildLineToCommentMap(comments) {
  const map = {};
  comments.forEach(comment => {
    map[comment.line] = comment.text.trim();
  });
  return map;
}

/**
 * Preprocesses Markdown text.
 *
 * @param {string} markdownText - Markdown text.
 * @returns {string} Processed Markdown text.
 */
function preprocessMarkdown(markdownText) {
  if (!markdownText) return '';
  return markdownText.replace(/'''([\s\S]*?)'''/g, '\n```\n$1\n```\n');
}

/**
 * Builds abstracts from objects.
 *
 * @param {Array} objects - Objects from XML.
 * @param {Object} lineToCommentMap - Line-to-comment map.
 * @param {Object|null} parentAbstract - Parent abstract.
 * @param {Array} abstracts - List of abstracts.
 * @param {boolean} skipUncommented - Skip objects without comments.
 * @returns {Array} List of abstracts.
 */
function buildAbstracts(objects, lineToCommentMap, parentAbstract = null, abstracts = [], skipUncommented = false) {
  objects.forEach(o => {
    const isAbstract = o.$ && o.$.abstract !== undefined;
    if (isAbstract) {
      const abstractName = o.$.name || 'Unnamed';

      if (globalProcessedAbstracts.has(abstractName)) {
        return;
      }
      globalProcessedAbstracts.add(abstractName);

      const abstractComments = lineToCommentMap[o.$.line] || '';

      if (skipUncommented && !abstractComments) {
        console.log(`Skipping abstract '${abstractName}' without comments.`);
        return;
      }

      const abstract = {
        name: abstractName,
        line: parseInt(o.$.line, 10),
        pos: parseInt(o.$.pos, 10),
        comments: abstractComments,
        parent: parentAbstract,
        childrenAbstracts: [],
        childObjects: []
      };
      abstracts.push(abstract);

      if (o.o) {
        o.o.forEach(child => {
          const childIsAbstract = child.$ && child.$.abstract !== undefined;
          if (childIsAbstract) {
            const childAbstract = buildAbstracts([child], lineToCommentMap, abstract, abstracts)[0];
            if (childAbstract && childAbstract.name !== abstract.name) { // Avoid self-references
              abstract.childrenAbstracts.push(childAbstract);
            }
          } else {
            const objComments = lineToCommentMap[child.$.line] || '';

            if (skipUncommented && !objComments) {
              console.log(`Skipping object '${child.$.name || 'Unnamed'}' without comments.`);
              return;
            }

            const obj = {
              name: child.$.name || 'Unnamed',
              line: parseInt(child.$.line, 10),
              pos: parseInt(child.$.pos, 10),
              comments: objComments,
              base: child.$.base || '',
              method: child.$.method || '',
              atom: child.$.atom || ''
            };
            abstract.childObjects.push(obj);
          }
        });
      }
    } else {
      if (parentAbstract && o.$ && o.$.line) {
        const objComments = lineToCommentMap[o.$.line] || '';

        if (skipUncommented && !objComments) {
          console.log(`Skipping object '${o.$.name || 'Unnamed'}' without comments.`);
          return;
        }

        const obj = {
          name: o.$.name || 'Unnamed',
          line: parseInt(o.$.line, 10),
          pos: parseInt(o.$.pos, 10),
          comments: objComments,
          base: o.$.base || '',
          method: o.$.method || '',
          atom: o.$.atom || ''
        };
        parentAbstract.childObjects.push(obj);
      }

      if (o.o) {
        o.o.forEach(child => {
          const childIsAbstract = child.$ && child.$.abstract !== undefined;
          if (childIsAbstract) {
            buildAbstracts([child], lineToCommentMap, parentAbstract, abstracts);
          } else if (parentAbstract) {
            const objComments = lineToCommentMap[child.$.line] || '';

            if (skipUncommented && !objComments) {
              console.log(`Skipping object '${child.$.name || 'Unnamed'}' without comments.`);
              return;
            }

            const obj = {
              name: child.$.name || 'Unnamed',
              line: parseInt(child.$.line, 10),
              pos: parseInt(child.$.pos, 10),
              comments: objComments,
              base: child.$.base || '',
              method: child.$.method || '',
              atom: child.$.atom || ''
            };
            parentAbstract.childObjects.push(obj);
          }
        });
      }
    }
  });
  return abstracts;
}

/**
 * Generates an HTML page for an abstract.
 *
 * @param {Object} abstract - Abstract.
 * @returns {string} HTML content.
 */
function generateAbstractPage(abstract) {
  const commentsHtml = abstract.comments ? marked.parse(preprocessMarkdown(abstract.comments)) : '';
  let childObjectsTable = '';
  let objectsSection = '';
  if (abstract.childObjects.length > 0) {
    childObjectsTable = `
      <table>
        <thead>
          <tr>
            <th>Object/Method</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${abstract.childObjects.map(obj => `
            <tr>
              <td>${obj.name}</td>
              <td>${obj.comments ? marked.parse(preprocessMarkdown(obj.comments)) : ''}</td>
            </tr>
          `).join('\n')}
        </tbody>
      </table>
    `;
    objectsSection = `
      <section>
        <h2>Objects and Methods</h2>
        ${childObjectsTable}
      </section>
    `;
  }

  let nestedAbstractsTable = '';
  if (abstract.childrenAbstracts.length > 0) {
    const uniqueChildren = [];
    const seen = new Set();
    abstract.childrenAbstracts.forEach(child => {
      if (!seen.has(child.name)) {
        seen.add(child.name);
        uniqueChildren.push(child);
      }
    });

    nestedAbstractsTable = `
      <table>
        <thead>
          <tr>
            <th>Nested Abstracts</th>
          </tr>
        </thead>
        <tbody>
          ${uniqueChildren.map(child => `
            <tr>
              <td><a href="${sanitizeFileName(child.name)}.html" class="full-link">${child.name}</a></td>
            </tr>
          `).join('\n')}
        </tbody>
      </table>
    `;
  }

  let nestedSection = '';
  if (abstract.childrenAbstracts.length > 0) {
    nestedSection = `
      <section>
        <h2>Nested Abstracts</h2>
        ${nestedAbstractsTable}
      </section>
    `;
  }

  const html = `<html>
<head>
  <title>Abstract: ${abstract.name}</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Abstract: ${abstract.name}</h1>
    ${abstract.parent ? `<p>Parent: <a href="${sanitizeFileName(abstract.parent.name)}.html">${abstract.parent.name}</a></p>` : ''}
  </header>
  ${abstract.comments ? `<section class="comments">${commentsHtml}</section>` : ''}
  
  ${objectsSection}
  
  ${nestedSection}
  
  <footer>
    <p><a href="index.html">Back to Index</a></p>
  </footer>
</body>
</html>`;
  return html;
}

/**
 * Sanitizes a file name.
 *
 * @param {string} name - Name.
 * @returns {string} Sanitized name.
 */
function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

/**
 * Generates the index HTML page.
 *
 * @param {Array} allAbstracts - All abstracts.
 * @returns {string} HTML content.
 */
function generateIndexPage(allAbstracts) {
  const topAbstracts = allAbstracts.filter(a => !a.parent);
  const html = `<html>
<head>
  <title>Documentation Index</title>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>Documentation Index</h1>
  </header>
  <section>
    <table>
      <thead>
        <tr>
          <th>Abstract</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${topAbstracts.map(abs => `
          <tr>
            <td><a href="${sanitizeFileName(abs.name)}.html" class="full-link">${abs.name}</a></td>
            <td>${abs.comments ? marked.parse(preprocessMarkdown(abs.comments)) : ''}</td>
          </tr>
        `).join('\n')}
      </tbody>
    </table>
  </section>
</body>
</html>`;
  return html;
}

/**
 * Generates the CSS file.
 *
 * @returns {Promise<void>}
 */
async function generateCSS() {
  const cssContent = `
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f4f4f4;
  color: #333;
}
header {
  background-color: #2980b9;
  color: white;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}
h1 {
  color: #f1f1f1;
}
h2 {
  color: #2980b9;
}
a {
  color: #2980b9;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
.comments {
  background-color: #fff;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.comments h1, .comments h2, .comments h3, .comments h4, .comments h5, .comments h6 {
  color: #2c3e50;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
thead {
  background-color: #2980b9;
  color: white;
}
th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
tbody tr:hover {
  background-color: #f1f1f1;
}
td a.full-link {
  display: block;
  width: 100%;
  height: 100%;
  text-decoration: none;
  color: inherit;
  padding: 0;
}
td a.full-link:hover {
  background-color: #e0e0e0;
  cursor: pointer;
}
section {
  margin-bottom: 20px;
}
footer {
  margin-top: 20px;
}
@media (max-width: 600px) {
  body {
    padding: 10px;
  }
  th, td {
    padding: 8px 10px;
  }
}
  `;
  await fs.promises.writeFile(path.join(outputDir, 'styles.css'), cssContent, 'utf-8');
}

/**
 * Generates the documentation.
 *
 * @param {Object} opts - Generation options.
 * @param {boolean} opts.skipUncommented - Skip objects without comments.
 * @returns {Promise<void>}
 */
async function generateDocumentation(opts) {
  const skipUncommented = opts.skipUncommented || false;
  try {
    await fs.promises.mkdir(outputDir, { recursive: true });
    await generateCSS();
    const xmirFiles = await readxmirFiles(inputDir);
    const allAbstracts = [];
    for (const file of xmirFiles) {
      // console.log(`Processing file: ${file.filename}`);

      const parsed = await parseXML(file.content);

      const programXML = parsed.program;

      const commentsXml = programXML.comments && programXML.comments[0] && programXML.comments[0].comment;
      // console.log('Comments:', commentsXml);

      const comments = extractComments(commentsXml);
      // console.log(comments);

      const lineToCommentMap = buildLineToCommentMap(comments);

      const objects = programXML.objects && programXML.objects[0] && programXML.objects[0].o;
      // console.log('Objects:', objects);

      buildAbstracts(objects, lineToCommentMap, null, allAbstracts, skipUncommented);
    }

    for (const abs of allAbstracts) {
      const html = generateAbstractPage(abs);
      const fileName = sanitizeFileName(abs.name) + '.html';
      await fs.promises.writeFile(path.join(outputDir, fileName), html, 'utf-8');
    }

    const indexHtml = generateIndexPage(allAbstracts);
    await fs.promises.writeFile(path.join(outputDir, 'index.html'), indexHtml, 'utf-8');

    console.log('Documentation successfully generated in the "docs" folder.');
  } catch (error) {
    console.error('Error generating documentation:', error);
  }
}

module.exports = function(opts) {
  generateDocumentation(opts);
};
