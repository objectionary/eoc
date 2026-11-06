/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2026 Objectionary.com
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');

globalThis.fetch = async (input, init) => {
  fs.writeFileSync(process.env.EOC_OPENAI_REQUEST, JSON.stringify({
    url: typeof input === 'string' ? input : input.url || String(input),
    method: init?.method || 'GET'
  }));
  return new Response(JSON.stringify({
    id: 'chatcmpl-local-test',
    object: 'chat.completion',
    created: 1,
    model: 'gpt-4o-mini',
    choices: [{
      index: 0,
      message: {role: 'assistant', content: 'Local test response.'},
      finish_reason: 'stop'
    }],
    usage: {prompt_tokens: 1, completion_tokens: 1, total_tokens: 2}
  }), {status: 200, headers: {'Content-Type': 'application/json'}});
};
