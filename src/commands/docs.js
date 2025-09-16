/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');
const path = require('path');
const SaxonJS = require('saxon-js');

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

const BLOCK_XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <div class="app-block">
      <xsl:for-each select="//o[(@name and @name != 'φ') and (not(@base) or (@base != '∅' and @base != 'ξ'))]">
        <xsl:if test="//comments/comment[@line = current()/@line]">
          <div class="object-block">
            <xsl:variable name="fullname">
              <xsl:for-each select="ancestor-or-self::o[@name and @name != 'φ']">
                <xsl:value-of select="@name"/>
                <xsl:choose>
                  <xsl:when test="position() != last()">.</xsl:when>
                </xsl:choose>
              </xsl:for-each>
            </xsl:variable>
            <h2 class="object-title"><xsl:value-of select="$fullname"/></h2>
            <p class="object-sign">
              <xsl:value-of select="$fullname"/>(<xsl:for-each select="current()/o[@base and @base = '∅']">
                <xsl:value-of select="@name"/>
                <xsl:choose>
                  <xsl:when test="position() != last()">, </xsl:when>
                </xsl:choose>
              </xsl:for-each>)</p>
            <p class="object-desc">
              <xsl:call-template name="break">
                <xsl:with-param name="text" select="//comments/comment[@line = current()/@line]"/>
              </xsl:call-template>
            </p>
          </div>
        </xsl:if>
      </xsl:for-each>
    </div>
  </xsl:template>

  <xsl:template name="break">
    <xsl:param name="text" select="string(.)"/>
    <xsl:choose>
      <xsl:when test="contains($text, '\\n')">
        <xsl:value-of select="substring-before($text, '\\n')"/>
        <br/>
        <xsl:call-template name="break">
          <xsl:with-param 
            name="text" 
            select="substring-after($text, '\\n')"
          />
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>`;

/**
 * Creates documentation block from given XMIR
 * @param {String} path - path of XMIR
 * @return {String} HTML block
 */
function createXmirHtmlBlock(path) {
  try {
    const xmir = fs.readFileSync(path).toString();
    return transformDocument(xmir, BLOCK_XSL);
  } catch(error) {
    throw new Error('Error while applying XSL to XMIR:', error);
  }
}

/**
 * Generates Package HTML
 * @param {String} name - Package name
 * @param {String[]} xmir_htmls - Array of xmirs htmls
 * @param {String} css_path - CSS file path
 * @return {String} HTML of the package
 */
function generatePackageHtml(name, xmir_htmls, css_path) {
  const title = `<h1 class="package-title">Package ${name} documentation</h1>`;
  return `<!DOCTYPE html>
    <html>
      <head>
        <link href="${css_path}" rel="stylesheet" type="text/css">
        ${title}
      </head>
      <body>
        ${xmir_htmls.join('\n')}
      </body>
    </html>`;
}

/**
 * Wraps given html body
 * @param {String} html - HTML body
 * @param {String} css_path - CSS file path
 * @return {String} Ready HTML
 */
function wrapHtml(html, css_path) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="${css_path}" rel="stylesheet" type="text/css">
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;
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
      fs.writeFileSync(html_app, wrapHtml(xmir_html, css));

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
        generatePackageHtml(package_name, packages_info[package_name].xmir_htmls, css));
    }

    const packages = path.join(output, 'packages.html');
    fs.writeFileSync(packages, generatePackageHtml('', all_xmir_htmls, css));

    console.info('Documentation generation completed in the %s directory', output);
  } catch (error) {
    console.error('Error generating documentation:', error);
    throw error;
  }
};
