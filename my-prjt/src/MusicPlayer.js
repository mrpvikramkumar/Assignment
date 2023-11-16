import React, { useState, useRef, useEffect } from 'react';

function Apps1() {
  const [audioFile, setAudioFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
    setCurrentTime(0); 
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    updateProgressBar();
  };

  const updateProgressBar = () => {
    const currentTimeInSeconds = audioRef.current.currentTime;
    const durationInSeconds = audioRef.current.duration;

    const progressPercentage = (currentTimeInSeconds / durationInSeconds) * 100;
    progressRef.current.style.width = `${progressPercentage}%`;
  };

  useEffect(() => {
    if (audioFile) {
      const fileURL = URL.createObjectURL(audioFile);
      audioRef.current.src = fileURL;
    }
  }, [audioFile]);

  useEffect(() => {
    const setupAudioContext = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaElementSource(audioRef.current);

      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const canvasContext = canvasRef.current.getContext('2d');
      const width = canvasRef.current.width;
      const height = canvasRef.current.height;

      const drawWaveform = () => {
        analyser.getByteTimeDomainData(dataArray);

        canvasContext.clearRect(0, 0, width, height);
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = 'rgb(0, 0, 0)';
        canvasContext.beginPath();

        const sliceWidth = (width * 1.0) / analyser.frequencyBinCount;
        let x = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            canvasContext.moveTo(x, y);
          } else {
            canvasContext.lineTo(x, y);
          }

          x += sliceWidth;
        }

        canvasContext.lineTo(width, height / 2);
        canvasContext.stroke();
      };

      const animationFrame = () => {
        drawWaveform();
        requestAnimationFrame(animationFrame);
      };

      audioContext.resume().then(() => {
        analyserRef.current = analyser;
        animationFrame();
      });

      return () => {
        analyser.disconnect();
        audioContext.close();
      };
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('loadedmetadata', setupAudioContext);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadedmetadata', setupAudioContext);
      }
    };
  }, [audioFile]);

  return (
    <div className="App">
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      
      {audioFile && (
        <div>
          <audio ref={audioRef} controls onTimeUpdate={handleTimeUpdate}></audio>
          <div className="progress-container">
            <div ref={progressRef} className="progress-bar"></div>
          </div>
          <canvas ref={canvasRef} width="500" height="100"></canvas>
          <p>{`Current Time: ${currentTime.toFixed(2)} seconds`}</p>
        </div>
      )}
    </div>
  );
}

export default Apps1;
