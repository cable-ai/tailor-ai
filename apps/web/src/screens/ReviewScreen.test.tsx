import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { ReviewScreen } from './ReviewScreen';
import { ClothingAnalysisResult } from '../types';

const BASE: ClothingAnalysisResult = {
  itemType: 'denim jacket',
  brand: "Levi's",
  size: 'M',
  color: ['blue'],
  pattern: 'solid',
  material: '100% cotton',
  condition: 'Excellent used condition',
  conditionGrade: 'EUC',
  conditionNotes: '',
  style: 'casual',
  gender: 'unisex',
  keywords: ['denim', 'jacket', 'Levis'],
};

describe('ReviewScreen', () => {
  it('renders initial field values', () => {
    const { getByDisplayValue } = render(
      <ReviewScreen result={BASE} onBack={jest.fn()} onNext={jest.fn()} />,
    );
    expect(getByDisplayValue('denim jacket')).toBeTruthy();
    expect(getByDisplayValue("Levi's")).toBeTruthy();
    expect(getByDisplayValue('M')).toBeTruthy();
  });

  it('passes edited draft to onNext', () => {
    const onNext = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <ReviewScreen result={BASE} onBack={jest.fn()} onNext={onNext} />,
    );
    fireEvent.changeText(getByDisplayValue('denim jacket'), 'bomber jacket');
    fireEvent.press(getByText('Publish to eBay →'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ itemType: 'bomber jacket' }),
    );
  });

  it('selects a new condition grade and passes it to onNext', () => {
    const onNext = jest.fn();
    const { getAllByText, getByText } = render(
      <ReviewScreen result={BASE} onBack={jest.fn()} onNext={onNext} />,
    );
    fireEvent.press(getAllByText('NWT')[0]);
    fireEvent.press(getByText('Publish to eBay →'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ conditionGrade: 'NWT' }),
    );
  });

  it('calls onBack when Back is pressed', () => {
    const onBack = jest.fn();
    const { getByText } = render(
      <ReviewScreen result={BASE} onBack={onBack} onNext={jest.fn()} />,
    );
    fireEvent.press(getByText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('splits comma-separated colors into an array', () => {
    const onNext = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <ReviewScreen result={BASE} onBack={jest.fn()} onNext={onNext} />,
    );
    fireEvent.changeText(getByDisplayValue('blue'), 'blue, white, red');
    fireEvent.press(getByText('Publish to eBay →'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ color: ['blue', 'white', 'red'] }),
    );
  });

  it('splits comma-separated keywords into an array', () => {
    const onNext = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <ReviewScreen result={BASE} onBack={jest.fn()} onNext={onNext} />,
    );
    fireEvent.changeText(getByDisplayValue('denim, jacket, Levis'), 'jeans, denim, vintage');
    fireEvent.press(getByText('Publish to eBay →'));
    expect(onNext).toHaveBeenCalledWith(
      expect.objectContaining({ keywords: ['jeans', 'denim', 'vintage'] }),
    );
  });
});
