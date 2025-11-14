interface BoldTextProps {
  children: string;
  className?: string;
}

const BoldText = ({ children, className = "" }: BoldTextProps) => {
  const words = children.split(' ');
  
  const processWord = (word: string) => {
    const splitPoint = Math.ceil(word.length / 2);
    const boldPart = word.slice(0, splitPoint);
    const normalPart = word.slice(splitPoint);
    
    return (
      <>
        <span className="font-semibold">{boldPart}</span>
        <span className="font-normal">{normalPart}</span>
      </>
    );
  };
  
  return (
    <span className={className}>
      {words.map((word, index) => (
        <span key={index}>
          {processWord(word)}
          {index < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};

export default BoldText;
