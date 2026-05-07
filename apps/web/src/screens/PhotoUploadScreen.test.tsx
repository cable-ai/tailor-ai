import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';

import { PhotoUploadScreen } from './PhotoUploadScreen';
import { ClothingAnalysisResult } from '../types';

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));

const mockPicker = ImagePicker.launchImageLibraryAsync as jest.Mock;

function fakePickResult(i: number) {
  return {
    canceled: false,
    assets: [{ uri: `blob:fake-${i}`, base64: `abc${i}`, mimeType: 'image/jpeg' }],
  };
}

const MOCK_RESULT: ClothingAnalysisResult = {
  itemType: 'denim jacket',
  brand: "Levi's",
  size: 'M',
  color: ['blue'],
  pattern: 'solid',
  material: '100% cotton',
  condition: 'Excellent',
  conditionGrade: 'EUC',
  conditionNotes: '',
  style: 'casual',
  gender: 'unisex',
  keywords: ['denim'],
};

beforeEach(() => {
  mockPicker.mockReset();
  (global as { fetch?: unknown }).fetch = jest.fn();
});

async function addPhotos(utils: ReturnType<typeof render>, count: number) {
  for (let i = 0; i < count; i++) {
    mockPicker.mockResolvedValueOnce(fakePickResult(i));
    await act(async () => {
      fireEvent.press(utils.getAllByText('Upload')[0]);
    });
  }
}

describe('PhotoUploadScreen', () => {
  it('shows 0 / 6 photos uploaded initially', () => {
    const { getByText } = render(<PhotoUploadScreen onNext={jest.fn()} />);
    expect(getByText('0 / 6 photos uploaded')).toBeTruthy();
  });

  it('increments progress text as photos are added', async () => {
    const utils = render(<PhotoUploadScreen onNext={jest.fn()} />);
    await addPhotos(utils, 3);
    expect(utils.getByText('3 / 6 photos uploaded')).toBeTruthy();
  });

  it('calls POST /api/analyze with base64 data URIs', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESULT,
    });
    (global as { fetch?: unknown }).fetch = fetchMock;

    const utils = render(<PhotoUploadScreen onNext={jest.fn()} />);
    await addPhotos(utils, 5);

    await act(async () => {
      fireEvent.press(utils.getByText('Continue to AI Analysis'));
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4000/api/analyze',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"photos"'),
      }),
    );

    const body = JSON.parse((fetchMock.mock.calls[0][1] as { body: string }).body);
    expect(body.photos).toHaveLength(5);
    expect(body.photos[0]).toMatch(/^data:image\/jpeg;base64,/);
  });

  it('calls onNext with the parsed result on success', async () => {
    const onNext = jest.fn();
    (global as { fetch?: unknown }).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESULT,
    });

    const utils = render(<PhotoUploadScreen onNext={onNext} />);
    await addPhotos(utils, 5);

    await act(async () => {
      fireEvent.press(utils.getByText('Continue to AI Analysis'));
    });

    await waitFor(() => expect(onNext).toHaveBeenCalledWith(MOCK_RESULT));
  });

  it('shows an error message when the API returns an error', async () => {
    (global as { fetch?: unknown }).fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Analysis failed' }),
    });

    const utils = render(<PhotoUploadScreen onNext={jest.fn()} />);
    await addPhotos(utils, 5);

    await act(async () => {
      fireEvent.press(utils.getByText('Continue to AI Analysis'));
    });

    await waitFor(() => expect(utils.getByText('Analysis failed')).toBeTruthy());
  });

  it('shows loading indicator while analyzing', async () => {
    let resolveFetch!: (v: unknown) => void;
    (global as { fetch?: unknown }).fetch = jest.fn().mockReturnValue(
      new Promise((r) => { resolveFetch = r; }),
    );

    const utils = render(<PhotoUploadScreen onNext={jest.fn()} />);
    await addPhotos(utils, 5);

    act(() => {
      fireEvent.press(utils.getByText('Continue to AI Analysis'));
    });

    expect(utils.getByText('Analyzing with Claude AI…')).toBeTruthy();

    // Clean up the pending promise
    resolveFetch({ ok: true, json: async () => MOCK_RESULT });
  });
});
