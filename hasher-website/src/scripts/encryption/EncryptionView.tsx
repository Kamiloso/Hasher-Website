import type { ReactNode } from 'react';
import TheoryPanel, { type TheoryBlock } from '../../components/TheoryPanel';

type EncryptionViewProps = {
  title: string;
  algorithmSelect: ReactNode;
  mainInput: ReactNode;
  generateAction: ReactNode | null;
  keyControls: ReactNode;
  byteFields: ReactNode[];
  counterControl: ReactNode | null;
  saltControl: ReactNode | null;
  keySelectionControl: ReactNode | null;
  actionButtons: ReactNode;
  outputControl: ReactNode | null;
  theoryBlocks: TheoryBlock[];
};

const EncryptionView = ({
  title,
  algorithmSelect,
  mainInput,
  generateAction,
  keyControls,
  byteFields,
  counterControl,
  saltControl,
  keySelectionControl,
  actionButtons,
  outputControl,
  theoryBlocks
}: EncryptionViewProps) => {
  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>{title}</h2>
        {algorithmSelect}
        {mainInput}
        {generateAction}
        {keyControls}
        {byteFields}
        {counterControl}
        {saltControl}
        {keySelectionControl}
        {actionButtons}
        {outputControl}
      </div>

      <TheoryPanel blocks={theoryBlocks} />
    </section>
  );
};

export default EncryptionView;