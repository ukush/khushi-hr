interface KeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function Keypad({ onDigit, onDelete }: KeypadProps) {
  return (
    <div className="keypad">
      {KEYS.map((key) => (
        <button
          key={key}
          type="button"
          className="keypad__key"
          onClick={() => onDigit(key)}
        >
          {key}
        </button>
      ))}
      <button type="button" className="keypad__key keypad__key--muted" onClick={onDelete}>
        ⌫
      </button>
      <button type="button" className="keypad__key" onClick={() => onDigit('0')}>
        0
      </button>
      <div aria-hidden="true" />
    </div>
  );
}
