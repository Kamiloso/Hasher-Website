import type { ReactNode } from 'react';
import TheoryPanel, { type TheoryBlock } from '../TheoryPanel';

type HashingViewProps = {
  title: string;
  algorithmSelect: ReactNode;
  kdfControl: ReactNode | null;
  iterationsControl: ReactNode | null;
  argon2Controls: ReactNode | null;
  inputControl: ReactNode;
  saltControl: ReactNode | null;
  actionButtons: ReactNode;
  outputControl: ReactNode;
  theoryBlocks: TheoryBlock[];
};

const HashingView = ({
  title,
  algorithmSelect,
  kdfControl,
  iterationsControl,
  argon2Controls,
  inputControl,
  saltControl,
  actionButtons,
  outputControl,
  theoryBlocks
}: HashingViewProps) => {
  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>{title}</h2>
        {algorithmSelect}
        {kdfControl}
        {iterationsControl}
        {argon2Controls}
        {inputControl}
        {saltControl}
        {actionButtons}
        {outputControl}
      </div>

      <TheoryPanel blocks={theoryBlocks} />
    </section>
  );
};

export default HashingView;