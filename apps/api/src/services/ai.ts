import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Switch to claude-sonnet-4-6 for premium tier via CLAUDE_MODEL env var.
const DEFAULT_MODEL = 'claude-haiku-4-5';

export interface ClothingAnalysisResult {
  itemType: string;
  brand: string;
  size: string;
  color: string[];
  pattern: string;
  material: string;
  condition: string;
  conditionGrade: 'NWT' | 'NWOT' | 'EUC' | 'GUC' | 'Fair';
  conditionNotes: string;
  style: string;
  gender: string;
  keywords: string[];
}

// Stable system prompt — cached on first request, ~90% cost reduction on repeats.
const SYSTEM_PROMPT = `You are an expert clothing analyst for resale platforms like eBay, Poshmark, and Mercari. Analyze clothing photos and extract detailed, accurate information for creating resale listings.

Respond with only a valid JSON object — no markdown, no explanation — with these exact fields:
{
  "itemType": "specific clothing item (e.g. 'denim jacket', 'polo shirt', 'midi dress')",
  "brand": "brand name from labels or tags, or 'Unknown' if not visible",
  "size": "size from tag (e.g. 'M', 'L', '32x30', 'XL'), or 'Unknown' if not visible",
  "color": ["primary color", "secondary color if present"],
  "pattern": "pattern description (e.g. 'solid', 'striped', 'plaid', 'floral', 'graphic print')",
  "material": "fabric composition from care label (e.g. '100% cotton', '60% polyester 40% rayon'), or 'Unknown' if not visible",
  "condition": "brief human-readable condition description for the listing",
  "conditionGrade": "NWT | NWOT | EUC | GUC | Fair",
  "conditionNotes": "specific visible flaws, stains, or damage — empty string if none",
  "style": "style category (e.g. 'casual', 'formal', 'athletic', 'streetwear', 'vintage')",
  "gender": "men | women | unisex | kids",
  "keywords": ["5 to 10 relevant eBay search keywords"]
}

Condition grade guide:
- NWT: New With Tags (tag still attached, unworn)
- NWOT: New Without Tags (unworn but tag removed)
- EUC: Excellent Used Condition (light wear, no visible flaws)
- GUC: Good Used Condition (normal wear, minor flaws)
- Fair: Visible flaws, heavy wear, or notable damage`;

type MediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

type ImageSource =
  | { type: 'base64'; media_type: MediaType; data: string }
  | { type: 'url'; url: string };

function parsePhoto(photo: string): ImageSource {
  if (photo.startsWith('data:')) {
    const match = photo.match(/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid image data URI — expected data:image/<type>;base64,...');
    }
    return {
      type: 'base64',
      media_type: match[1] as MediaType,
      data: match[2],
    };
  }
  if (photo.startsWith('https://')) {
    return { type: 'url', url: photo };
  }
  throw new Error('Photos must be base64 data URIs or HTTPS URLs');
}

export async function analyzeClothingPhotos(photos: string[]): Promise<ClothingAnalysisResult> {
  const imageBlocks = photos.map((photo): Anthropic.ImageBlockParam => ({
    type: 'image',
    source: parsePhoto(photo) as Anthropic.ImageBlockParam['source'],
  }));

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || DEFAULT_MODEL,
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.TextBlockParam[],
    messages: [
      {
        role: 'user',
        content: [
          ...imageBlocks,
          {
            type: 'text',
            text: 'Analyze these clothing photos and return the JSON object.',
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
  if (!textBlock) {
    throw new Error('No text response from Claude');
  }

  try {
    return JSON.parse(textBlock.text) as ClothingAnalysisResult;
  } catch {
    throw new Error(`Claude response was not valid JSON: ${textBlock.text.slice(0, 300)}`);
  }
}
