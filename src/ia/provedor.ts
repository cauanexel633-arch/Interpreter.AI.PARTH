import OpenAI from 'openai';
import { config } from '../config.js';

export interface AIProvider {
  gerar(system: string, pedido: string, timeout: number): Promise<string>;
}

/**
 * Uses the OpenAI SDK against either OpenAI or an OpenAI-compatible endpoint
 * such as OpenRouter. OpenRouter is selected through AI_PROVIDER.
 */
export class OpenAIProvider implements AIProvider {
  private client = new OpenAI({
    apiKey: config.AI_API_KEY,
    ...(config.AI_BASE_URL
      ? { baseURL: config.AI_BASE_URL }
      : config.AI_PROVIDER === 'openrouter'
        ? { baseURL: 'https://openrouter.ai/api/v1' }
        : {}),
  });

  async gerar(system: string, pedido: string, timeout: number): Promise<string> {
    const response = await this.client.chat.completions.create(
      {
        model: config.AI_MODEL,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: '<pedido>\n' + pedido.replaceAll('</pedido>', '<\\/pedido>') + '\n</pedido>',
          },
        ],
      },
      { timeout, maxRetries: 0 },
    );

    const content = response.choices[0]?.message.content;
    if (!content) throw new Error('empty AI response');
    return content;
  }
}
