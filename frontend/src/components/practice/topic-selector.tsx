'use client';

import { SelectorTileGroup } from './selector-tile-group';

type TopicSelectorProps = {
  value: string;
  onChange: (value: string) => void;
  options: string[];
};

export function TopicSelector({ value, onChange, options }: TopicSelectorProps) {
  return (
    <SelectorTileGroup
      label="Topic or focus area"
      helper="Pick a topic to sharpen, or choose the one your recent performance suggests needs more attention."
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
