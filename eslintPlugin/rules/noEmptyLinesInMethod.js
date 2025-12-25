/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2025 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

module.exports = {
  meta: {
    type: "layout",
    docs: {
      description: "Disallow empty lines inside method or function bodies"
    },
    fixable: "whitespace",
    schema: [],
    messages: {
      noEmptyLine: "Empty lines are not allowed inside a method or function body."
    }
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    function checkFunction(node) {
      if (!node.body || node.body.type !== "BlockStatement") {
        return;
      }
      const body = node.body;
      const lines = sourceCode.lines;
      const startLine = body.loc.start.line;
      const endLine = body.loc.end.line;
      for (let i = startLine; i < endLine - 1; i++) {
        if (lines[i].trim() === "") {
          context.report({
            node: body,
            loc: {
              start: { line: i + 1, column: 0 },
              end: { line: i + 1, column: lines[i].length }
            },
            messageId: "noEmptyLine",
            fix(fixer) {
              const rangeStart = sourceCode.getIndexFromLoc({
                line: i + 1,
                column: 0
              });
              const rangeEnd = rangeStart + lines[i].length + 1;
              return fixer.removeRange([rangeStart, rangeEnd]);
            }
          });
        }
      }
    }
    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
      MethodDefinition(node) {
        checkFunction(node.value);
      }
    };
  }
};
