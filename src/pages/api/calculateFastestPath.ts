import { NextApiRequest, NextApiResponse } from 'next';

type Position = string;
type Distance = number;

type Path = {
  positions: Position[];
  time: number;
};

type TimeMatrix = Record<Position, Record<Position, Distance>>;

async function fetchTimeMatrix(): Promise<TimeMatrix> {
  const response = await fetch('https://mocki.io/v1/10404696-fd43-4481-a7ed-f9369073252f');
  const json = await response.json();
  return json;
}

function calculateFastestPath(
  timeMatrix: TimeMatrix,
  origin: Position,
  pickup: Position,
  destination: Position,
): Path {
  const queue: { position: Position; time: number; path: Position[] }[] = [    { position: origin, time: 0, path: [] },
  ];
  const visited: Record<Position, boolean> = {};

  while (queue.length > 0) {
    queue.sort((a, b) => a.time - b.time);
    const { position, time, path } = queue.shift()!;

    if (position === pickup) {
        const newPath = [...path, pickup];
        const newQueue = Object.keys(timeMatrix[pickup]).map((nextPos) => ({
          position: nextPos,
          time: time + timeMatrix[pickup][nextPos],
          path: newPath,
        }));
        queue.push(...newQueue);
    } else if (position === destination) {
      return { positions: [...path, destination], time };
    } else if (!visited[position]) {
      visited[position] = true;
      const newQueue = Object.keys(timeMatrix[position]).map((nextPos) => ({
        position: nextPos,
        time: time + timeMatrix[position][nextPos],
        path: [...path, position],
      }));
      queue.push(...newQueue);
    }
  }

  console.log('queue', queue.toString());

  if (origin === destination) {
    return { positions: [destination], time: 0 };
  }

  throw new Error('Unable to find a path');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { droneOrigin, objectPickup, deliveryDestination } = req.body;

  const timeMatrix = await fetchTimeMatrix();

  const { positions, time } = calculateFastestPath(timeMatrix, droneOrigin, objectPickup, deliveryDestination);

  res.json({ positions, time, timeMatrix });
}
