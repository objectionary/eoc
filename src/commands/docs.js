/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const SaxonJS = require('saxon-js');
const { marked } = require('marked');

/**
 * Recursively reads all .xmir files from a directory.
 * @param {string} dir - Directory path
 * @return {string[]} Array of file paths
 */
function readXmirsRecursively(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readXmirsRecursively(full));
    } else if (entry.name.endsWith('.xmir')) {
      files.push(full);
    }
  }
  return files;
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
  const regex = /(?<opening_tag><p\s+class\s*=\s*["']object-desc["'][^>]*>)(?<content>[\s\S]*?)(?<closing_tag><\/p>)/gi;
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
    throw new Error(`Error while applying XSL to XMIR: ${error.message}`, error);
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
 * Command to generate documentation.
 * @param {Hash} opts - All options
 */
module.exports = async function(opts) {
  try {
    const input = path.resolve(opts.target, '1-parse');
    const output = path.resolve(opts.target, 'docs');
    fs.mkdirSync(output, {recursive: true});
    const css = path.join(output, 'styles.css');
    fs.writeFileSync(css, '');
    const packages_info = {};
    const all_xmir_htmls = [];
    const xmirs = readXmirsRecursively(input);
    for (const xmir of xmirs) {
      const relative = path.relative(input, xmir);
      const name = path.parse(xmir).name;
      const xmir_html = createXmirHtmlBlock(xmir);
      const html_app = path.join(output, path.dirname(relative),`${name}.html`);
      fs.mkdirSync(path.dirname(html_app), {recursive: true});
      fs.writeFileSync(html_app, wrapHtml(name, xmir_html, css));
      const packages = path.dirname(relative).split(path.sep).join('.');
      const html_package = path.join(output, `package_${packages}.html`);
      if (!(packages in packages_info)) {
        packages_info[packages] = {
          xmir_htmls : [],
          path: html_package
        };
      }
      packages_info[packages].xmir_htmls.push(xmir_html);
      all_xmir_htmls.push(xmir_html);
    }
    for (const package_name of Object.keys(packages_info)) {
      fs.mkdirSync(path.dirname(packages_info[package_name].path), {recursive: true});
      fs.writeFileSync(packages_info[package_name].path,
        generatePackageHtml(`${package_name} package`, packages_info[package_name].xmir_htmls, css));
    }
    const packages = path.join(output, 'packages.html');
    fs.writeFileSync(packages, generatePackageHtml('overall package', all_xmir_htmls, css));
    console.info('Documentation generation completed in the %s directory', output);
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
};
