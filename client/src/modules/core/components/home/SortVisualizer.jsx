import { useEffect, useState, useRef } from 'react';

const ARRAY_SIZE = 14;

const randomArray = () =>
  Array.from({ length: ARRAY_SIZE }, () => Math.floor(Math.random() * 80) + 10);

// A tiny, looping, self-contained bubble sort animation. Purely decorative,
// re-randomizes and re-sorts every cycle. No external deps.
const SortVisualizer = () => {
  const [arr, setArr] = useState(randomArray);
  const [activeIdx, setActiveIdx] = useState([-1, -1]);
  const timeoutRef = useRef(null);

  useEffect(() => {
    let current = randomArray();
    setArr([...current]);
    let i = 0;
    let j = 0;
    let cycle = 0;

    const step = () => {
      if (i >= current.length - 1) {
        // Pause at fully sorted, then restart with a new random array
        setActiveIdx([-1, -1]);
        timeoutRef.current = setTimeout(() => {
          current = randomArray();
          setArr([...current]);
          i = 0;
          j = 0;
          cycle += 1;
          step();
        }, 1400);
        return;
      }

      if (j >= current.length - i - 1) {
        i += 1;
        j = 0;
        timeoutRef.current = setTimeout(step, 80);
        return;
      }

      setActiveIdx([j, j + 1]);
      if (current[j] > current[j + 1]) {
        [current[j], current[j + 1]] = [current[j + 1], current[j]];
        setArr([...current]);
      }
      j += 1;
      timeoutRef.current = setTimeout(step, 110);
    };

    timeoutRef.current = setTimeout(step, 400);
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const maxVal = 90;

  return (
    <div className="flex items-end justify-center gap-1.5 h-48 px-4">
      {arr.map((val, idx) => {
        const isActive = activeIdx.includes(idx);
        return (
          <div
            key={idx}
            className="rounded-t-md transition-all duration-150 ease-out"
            style={{
              height: `${(val / maxVal) * 100}%`,
              width: '18px',
              backgroundColor: isActive ? 'var(--amber)' : 'var(--accent)',
              opacity: isActive ? 1 : 0.75,
            }}
          />
        );
      })}
    </div>
  );
};

export default SortVisualizer;
