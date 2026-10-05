/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const SaxonJS = require('saxon-js');
const { marked } = require('marked');
const {elapsed} = require('../elapsed');
const {findFiles, assertNoSymlinkPath, safeWriteFile} = require('../files');

/**
 * Escape special XML characters.
 * @param {String} str - Raw string
 * @return {String} XML-safe string
 */
function xmlEscape(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Applies XSLT to XMIR
 * @param {String} xmir - Text of XMIR file
 * @param {String} xsl - Text of XSL file
 * @return {String} HTML document
 */
function transformDocument(xmir, xsl) {
  const html = SaxonJS.XPath.evaluate(
    `transform(
        map {
            'source-node' : parse-xml($xml),
            'stylesheet-text' : $xslt,
            'delivery-format' : 'serialized'
        }
    )?output`,
    null,
    {
      params : {
        'xml' : xmir,
        'xslt' : xsl
      }
    }
  );
  return html;
}

/**
 * Converts Markdown blocks in documentation to HTML
 * @param {String} html - text of HTML file
 * @return {String} HTML document
 */
function convertMarkdownToHtml(html) {
  const regex = /(?<opening_tag><div\s+class\s*=\s*["']object-desc["'][^>]*>)(?<content>[\s\S]*?)(?<closing_tag><\/div>)/gi;
  const converted_html = html.replace(regex, (match, opening_tag, content, closing_tag) => `${opening_tag}${marked.parse(content)}${closing_tag}`);
  return converted_html;
}

/**
 * Creates documentation block from given XMIR
 * @param {String} filepath - path of XMIR
 * @return {String} HTML block
 */
function createXmirHtmlBlock(filepath) {
  try {
    const xmir = fs.readFileSync(filepath).toString();
    const xsl = fs.readFileSync(path.join(__dirname, '..', 'resources', 'xmir-transformer.xsl')).toString();
    return convertMarkdownToHtml(transformDocument(xmir, xsl));
  } catch(error) {
    throw new Error(`Error while applying XSL to XMIR: ${error.message}`, {cause: error});
  }
}

/**
 * Generates Package HTML
 * @param {String} name - Package name
 * @param {String[]} htmls - Array of xmirs htmls
 * @param {String} css - CSS file path
 * @return {String} HTML of the package
 */
function generatePackageHtml(name, htmls, css) {
  htmls = htmls.filter(item => item !== '<article class="app-block"></article>');
  const date = new Date();
  return `<!DOCTYPE html>
    <html>
      <head>
        <link href="${css}" rel="stylesheet" type="text/css">
        <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/tacit-css@1.9.1/dist/tacit-css.min.css"/>
      </head>
      <body>
        <section>
          <header>
            <nav>
              <h1>${name} documentation</h1>
              <p>Creation date: ${date.toUTCString()}</p>
            </nav>
          </header>
          ${htmls.join('\n')}
        </section>
      </body>
    </html>`;
}

/**
 * Wraps given html body
 * @param {String} name - File name
 * @param {String} html - HTML body
 * @param {String} css - CSS file path
 * @return {String} Ready HTML
 */
function wrapHtml(name, html, css) {
  return generatePackageHtml(name, [html], css);
}

/**
 * Make a normalized key for comparing output paths on case-insensitive filesystems.
 * @param {string} file - Path to normalize
 * @return {string} Normalized output key
 */
function outputKey(file) {
  return path.resolve(file).toLowerCase();
}

/**
 * Select a unique fallback path for an output that collides with another page.
 * @param {string} output - Documentation output directory
 * @param {string} kind - Output kind
 * @param {string} relative - Relative page path
 * @param {Set} reserved - Original output paths
 * @param {Set} used - Paths already assigned
 * @return {string} Unique fallback path
 */
function fallbackPath(output, kind, relative, reserved, used) {
  const parsed = path.parse(relative);
  let suffix = '';
  let index = 0;
  let candidate;
  do {
    const name = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`);
    candidate = path.join(output, '_eoc-conflicts', kind, name);
    suffix = `-${++index}`;
  } while (reserved.has(outputKey(candidate)) || used.has(outputKey(candidate)));
  return candidate;
}

/**
 * Assign the requested path or a unique fallback when it is already taken.
 * @param {string} requested - Requested output path
 * @param {string} output - Documentation output directory
 * @param {string} kind - Output kind
 * @param {string} relative - Relative page path
 * @param {Set} reserved - Original output paths
 * @param {Set} used - Paths already assigned
 * @return {string} Assigned output path
 */
function assignOutputPath(requested, output, kind, relative, reserved, used) {
  let selected = requested;
  if (used.has(outputKey(selected))) {
    selected = fallbackPath(output, kind, relative, reserved, used);
  }
  used.add(outputKey(selected));
  return selected;
}

/**
 * Command to generate documentation.
 * @param {Hash} opts - All options
 * @return {Promise<String>} Resolves to the message reporting the summary path
 */
module.exports = function(opts) {
  return elapsed(async (tracked) => {
    try {
      const input = path.resolve(opts.target, '1-parse');
      const output = path.resolve(opts.target, 'docs');
      assertNoSymlinkPath(opts.target, output);
      fs.mkdirSync(output, {recursive: true});
      const css = path.join(output, 'styles.css');
      if (!fs.existsSync(css)) {
        safeWriteFile(opts.target, css, '');
      } else {
        assertNoSymlinkPath(opts.target, css);
      }
      const packages_info = new Map();
      const all_xmir_htmls = [];
      const xmirs = findFiles(input, '.xmir').sort();
      const object_pages = new Map();
      const object_candidates = [];
      const package_names = new Set();
      for (const xmir of xmirs) {
        const relative = path.relative(input, xmir);
        const name = path.parse(xmir).name;
        const html = path.join(path.dirname(relative), `${name}.html`);
        const requested = name === 'packages' && path.dirname(relative) === '.'
          ? path.join(output, 'packages-object.html') : path.join(output, html);
        object_candidates.push({xmir, requested, relative: html});
        const package_dir = path.dirname(relative);
        if (package_dir !== '.') {
          package_names.add(package_dir.split(path.sep).join('.'));
        }
      }
      const package_candidates = [...package_names].sort().map((name) => ({
        name,
        requested: path.join(output, `package_${name}.html`),
        relative: `${name}.html`
      }));
      const static_paths = [
        css,
        path.join(output, 'packages.html'),
        path.join(output, 'summary.xml')
      ];
      const reserved = new Set([
        ...static_paths,
        ...object_candidates.map(item => item.requested),
        ...package_candidates.map(item => item.requested)
      ].map(outputKey));
      const used = new Set(static_paths.map(outputKey));
      for (const page of object_candidates) {
        object_pages.set(page.xmir, assignOutputPath(
          page.requested, output, 'objects', page.relative, reserved, used
        ));
      }
      const package_pages = new Map();
      for (const page of package_candidates) {
        package_pages.set(page.name, assignOutputPath(
          page.requested, output, 'packages', page.relative, reserved, used
        ));
      }
      for (const xmir of xmirs) {
        const relative = path.relative(input, xmir);
        const name = path.parse(xmir).name;
        const xmir_html = createXmirHtmlBlock(xmir);
        const page = object_pages.get(xmir);
        safeWriteFile(opts.target, page, wrapHtml(name, xmir_html, css));
        const package_dir = path.dirname(relative);
        if (package_dir !== '.') {
          const package_name = package_dir.split(path.sep).join('.');
          const html_package = package_pages.get(package_name);
          if (!packages_info.has(package_name)) {
            packages_info.set(package_name, {
              xmir_htmls : [],
              names: [],
              path: html_package
            });
          }
          packages_info.get(package_name).xmir_htmls.push(xmir_html);
          packages_info.get(package_name).names.push(name);
        }
        all_xmir_htmls.push(xmir_html);
      }
      for (const [package_name, info] of packages_info) {
        safeWriteFile(opts.target, info.path,
          generatePackageHtml(`${package_name} package`, info.xmir_htmls, css));
      }
      const packages = path.join(output, 'packages.html');
      safeWriteFile(
        opts.target, packages, generatePackageHtml('overall package', all_xmir_htmls, css)
      );
      const summary = path.join(output, 'summary.xml');
      const lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        `<eodoc packages="${packages_info.size}" objects="${xmirs.length}">`
      ];
      for (const [pkg, info] of packages_info) {
        lines.push(`  <package name="${xmlEscape(pkg)}">`);
        for (const obj of info.names) {
          lines.push(`    <object name="${xmlEscape(obj)}"/>`);
        }
        lines.push('  </package>');
      }
      lines.push('</eodoc>');
      safeWriteFile(opts.target, summary, lines.join('\n'));
      const located = tracked.print(`Summary XML generated at ${path.relative(process.cwd(), summary)}`);
      tracked.print(`Documentation generation completed in the ${output} directory`);
      return located;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw error;
    }
  });
};

module.exports.createXmirHtmlBlock = createXmirHtmlBlock;
