import "./App.css";

import React, { useState, useRef } from 'react';

function Apps() {
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          setVideoURL(videoURL);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <div className="App">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>

      <div className="button-container">
        {isRecording ? (
          <button onClick={stopRecording}>Stop Recording</button>
        ) : (
          <button onClick={startRecording}>Start Recording</button>
        )}
      </div>

      {videoURL && (
        <div className="preview-container">
          <p>Preview:</p>
          <video controls src={videoURL} />
        </div>
      )}
    </div>
  );
}

export default Apps;
