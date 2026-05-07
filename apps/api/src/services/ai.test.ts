// jest.mock is hoisted above imports — factory must not reference outer let/const.
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn() },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';
import { analyzeClothingPhotos, ClothingAnalysisResult } from './ai';

const AnthropicMock = Anthropic as jest.MockedClass<typeof Anthropic>;

// The Anthropic client is created once at ai.ts module init; capture it here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockCreate: jest.MockedFunction<any>;

beforeAll(() => {
  // mock.results[0].value is the object returned by new Anthropic() in ai.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockCreate = (AnthropicMock.mock.results[0].value as any).messages.create;
});

beforeEach(() => {
  mockCreate.mockReset();
  delete process.env.MOCK_AI;
});

const MOCK_RESULT: ClothingAnalysisResult = {
  itemType: 'denim jacket',
  brand: "Levi's",
  size: 'M',
  color: ['blue'],
  pattern: 'solid',
  material: '100% cotton',
  condition: 'Excellent used condition with minimal wear',
  conditionGrade: 'EUC',
  conditionNotes: '',
  style: 'casual',
  gender: 'unisex',
  keywords: ['denim jacket', 'Levis', 'blue jacket', 'casual', 'cotton'],
};

function makeTextResponse(text: string) {
  return { content: [{ type: 'text', text }] };
}

const VALID_B64 = 'data:image/jpeg;base64,/9j/abc123';

describe('analyzeClothingPhotos', () => {
  it('returns parsed result for a valid base64 photo', async () => {
    mockCreate.mockResolvedValue(makeTextResponse(JSON.stringify(MOCK_RESULT)));
    const result = await analyzeClothingPhotos([VALID_B64]);
    expect(result).toEqual(MOCK_RESULT);
  });

  it('sends one image block per photo', async () => {
    mockCreate.mockResolvedValue(makeTextResponse(JSON.stringify(MOCK_RESULT)));
    await analyzeClothingPhotos([VALID_B64, VALID_B64]);
    const body = mockCreate.mock.calls[0][0];
    const imageBlocks = body.messages[0].content.filter((b: { type: string }) => b.type === 'image');
    expect(imageBlocks).toHaveLength(2);
  });

  it('attaches cache_control to the system prompt block', async () => {
    mockCreate.mockResolvedValue(makeTextResponse(JSON.stringify(MOCK_RESULT)));
    await analyzeClothingPhotos([VALID_B64]);
    const body = mockCreate.mock.calls[0][0];
    expect(body.system[0].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('accepts an HTTPS URL as a photo source', async () => {
    mockCreate.mockResolvedValue(makeTextResponse(JSON.stringify(MOCK_RESULT)));
    await analyzeClothingPhotos(['https://example.com/shirt.jpg']);
    const body = mockCreate.mock.calls[0][0];
    expect(body.messages[0].content[0].source).toEqual({
      type: 'url',
      url: 'https://example.com/shirt.jpg',
    });
  });

  it('throws for an unsupported photo format (HTTP, not HTTPS)', async () => {
    await expect(analyzeClothingPhotos(['http://insecure.com/img.jpg'])).rejects.toThrow(
      'Photos must be base64 data URIs or HTTPS URLs',
    );
  });

  it('throws for a malformed data URI', async () => {
    await expect(analyzeClothingPhotos(['data:image/bmp;base64,abc'])).rejects.toThrow(
      'Invalid image data URI',
    );
  });

  it('throws when the response contains no text block', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', id: 'x', name: 'y', input: {} }],
    });
    await expect(analyzeClothingPhotos([VALID_B64])).rejects.toThrow('No text response from Claude');
  });

  it('throws when the response text is not valid JSON', async () => {
    mockCreate.mockResolvedValue(makeTextResponse('not json at all'));
    await expect(analyzeClothingPhotos([VALID_B64])).rejects.toThrow(
      'Claude response was not valid JSON',
    );
  });
});

describe('mock mode (MOCK_AI=true)', () => {
  it('returns hardcoded result without calling the Anthropic API', async () => {
    process.env.MOCK_AI = 'true';
    const result = await analyzeClothingPhotos([VALID_B64]);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(result.itemType).toBeDefined();
    expect(result.conditionGrade).toMatch(/^(NWT|NWOT|EUC|GUC|Fair)$/);
  });
});
