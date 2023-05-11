"use client";
import React, { useEffect, useState } from 'react';
import ResultDisplay from './resultDisplay';

function ChessboardForm() {
  const [droneOrigin, setDroneOrigin] = useState('');
  const [objectPickup, setObjectPickup] = useState('');
  const [deliveryDestination, setDeliveryDestination] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState('');
  const [queryCache, setQueryCache] = useState();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      let queries = window.localStorage.getItem('queries');
      if (queries) {
        queries = JSON.parse(queries);
        setQueryCache(queries);
      }
    }
  }, []);

  const handleSubmit = async (event) => {
    console.log(queryCache);
    event.preventDefault();
  
    // Validate that the coordinates are valid chessboard coordinates
    const isValidCoordinate = /^([A-H][1-8])$/;
    if (!isValidCoordinate.test(droneOrigin) || !isValidCoordinate.test(objectPickup) || !isValidCoordinate.test(deliveryDestination)) {
      setErrorMessage('Invalid coordinates');
      return;
    }
  
    // Submit the form data to the server
    fetch('/api/calculateFastestPath', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ droneOrigin, objectPickup, deliveryDestination }),
    })
    .then((response) => {
      if (response.ok) {
        return response.json(); // Parse the response body as JSON
      }
      throw new Error('Network response was not ok.');
    })
    .then((data) => {
      setResult(data); // Set the parsed response as the result state
      if (typeof window !== "undefined" && window.localStorage) {
        let queries = window.localStorage.getItem('queries');
        if (queries) {
          queries = JSON.parse(queries);
          if (queries.length >= 10) {
            queries.shift();
          }
          queries.push({ droneOrigin, objectPickup, deliveryDestination, time: data.time });
          window.localStorage.setItem('queries', JSON.stringify(queries));
        } else {
          window.localStorage.setItem('queries', JSON.stringify([{ droneOrigin, objectPickup, deliveryDestination }]));
        }
      }
    })
    .catch((error) => {
      console.error(error);
      setErrorMessage('An error occurred while processing the request');
    });
  };
  

  return (
    <div>
      <h1>Chessboard Coordinates Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Drone Origin:
          <input type="text" className='dark:text-black' value={droneOrigin} onChange={(event) => setDroneOrigin(event.target.value)} />
        </label>
        <label>
          Object Pickup:
          <input type="text" className='dark:text-black' value={objectPickup} onChange={(event) => setObjectPickup(event.target.value)} />
        </label>
        <label>
          Delivery Destination:
          <input type="text" className='dark:text-black' value={deliveryDestination} onChange={(event) => setDeliveryDestination(event.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {errorMessage && <p>{errorMessage}</p>}
      {result && <ResultDisplay result={result} />}
      {queryCache && <div>
        <h2>Query Cache</h2>
        <ol type='1'>
          {queryCache.map((query, index) => (
            <li key={index}>{query.droneOrigin} {query.objectPickup} {query.deliveryDestination} {query.time} seconds</li>
          ))}
        </ol>
      </div>}
    </div>
  );
}


export default ChessboardForm;
