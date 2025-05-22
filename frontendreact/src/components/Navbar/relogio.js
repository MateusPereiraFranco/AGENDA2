import React, { useEffect, useRef } from "react";

function Relogio() {
  const secondRef = useRef(null);
  const minuteRef = useRef(null);
  const hourRef = useRef(null);

  useEffect(() => {
    const currentSec = getSecondsToday();

    const seconds = (currentSec / 60) % 1;
    const minutes = (currentSec / 3600) % 1;
    const hours = (currentSec / 43200) % 1;

    setTime(60 * seconds, secondRef.current);
    setTime(3600 * minutes, minuteRef.current);
    setTime(43200 * hours, hourRef.current);
  }, []);

  function setTime(left, element) {
    if (element) {
      element.style.animationDelay = `${-left}s`;
    }
  }

  function getSecondsToday() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((now - today) / 1000);
  }

  return (
    <div className="clock">
      <div className="clock__second" ref={secondRef}></div>
      <div className="clock__minute" ref={minuteRef}></div>
      <div className="clock__hour" ref={hourRef}></div>
      <div className="clock__axis"></div>
      {[...Array(60)].map((_, i) => (
        <section key={i} className="clock__indicator"></section>
      ))}
    </div>
  );
}

export default Relogio;