import { config } from '../config.js';

export interface AIProvider {
  gerar(system: string, pedido: string, timeout: number): Promise<string>;
}

/**
 * Calls OpenAI-compatible Chat Completions APIs directly using Node's fetch.
 * This supports both OpenAI and OpenRouter without an SDK peer-dependency
 * conflict with the project's Zod version.
 */
export class OpenAIProvider implements AIProvider {
  private readonly baseUrl = (
    config.AI_BASE_URL ??
    (config.AI_PROVIDER === 'openrouter'
      ? 'https://openrouter.ai/api/v1'
      : 'https://api.openai.com/v1')
  ).replace(/\/+$/, '');

  async gerar(system: string, pedido: string, timeout: number): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.AI_API_KEY}`,
        'Content-Type': 'application/json',
        ...(config.AI_PROVIDER === 'openrouter'
          ? {
              'HTTP-Referer': 'https://vercel.com',
              'X-Title': 'Interpreter.AI.PARTH',
            }
          : {}),
      },
      body: JSON.stringify({
        model: config.AI_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: '<pedido>\\n' + pedido.replaceAll('</pedido>', '<\\\\/pedido>') + '\\n</pedido>',
          },
        ],
      }),
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`AI provider HTTP ${response.status}: ${details.slice(0, 1000)}`);
    }

    const result: unknown = await response.json();
    if (
      typeof result !== 'object' ||
      result === null ||
      !('choices' in result) ||
      !Array.isArray(result.choices)
    ) {
      throw new Error('invalid AI provider response');
    }

    const first = result.choices[0] as { message?: { content?: unknown } } | undefined;
    const content = first?.message?.content;
    if (typeof content !== 'string' || !content) {
      throw new Error('empty AI response');
    }
    return content;
  }
}
