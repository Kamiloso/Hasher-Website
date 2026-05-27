export type TheoryBlock = {
  title: string;
  content: string;
};

interface TheoryPanelProps {
  blocks: TheoryBlock[];
}

const TheoryPanel = ({ blocks }: TheoryPanelProps) => {
  return (
    <aside className="theory-panel">
      {blocks.map((block) => (
        <article key={block.title} className="theory-block">
          <h4>{block.title}</h4>
          <p>{block.content}</p>
        </article>
      ))}
    </aside>
  );
};

export default TheoryPanel;