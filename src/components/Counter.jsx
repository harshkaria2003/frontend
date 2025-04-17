 import { useState } from "react";
import "../styles/Counter.css";

const Counter = () => {
  const [count, setCount] = useState(0);
  const [customValue, setCustomValue] = useState("");

  const handleDecrement = () => {
    if (count === 0) {
      alert("Cannot decrement below 0!");
    } else {
      setCount(count - 1);
    }
  };

  const handleSetValue = () => {
    const parsedValue = parseInt(customValue, 10);
    if (!isNaN(parsedValue)) {
      setCount(parsedValue);
      setCustomValue("");
    } else {
      alert("Please enter a valid number!");
    }
  };

  return (
    <div className="counter-container">
      <h2>Counter App</h2>
      <div className="counter-display">{count}</div>
      <div className="counter-buttons">
        <button className="decrement-btn" onClick={handleDecrement}>
          Decrement
        </button>
        <button className="increment-btn" onClick={() => setCount(count + 1)}>
          Increment
        </button>
      </div>
      <div className="set-counter">
        <input
          type="number"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Set Counter"
        />
        <button className="set-btn" onClick={handleSetValue}>
          Set
        </button>
      </div>
    </div>
  );
};

export default Counter;
 

/* import React, { useState, useMemo, useCallback } from "react";

const Counter = () => {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

 
  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);


  const isEven = useMemo(() => {
    console.log("Checking time ");
    return count % 2 === 0;
  }, [count]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Counter: {count}</h2>
      <p>{isEven ? "Even" : "Odd"}</p>
      <button onClick={decrement} disabled={count === 0}>
        -
      </button>
      <button onClick={increment}>+</button>

      <hr />

      
      <input
        type="text"
        placeholder="Type something..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}; */

