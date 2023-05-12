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
  // Calculate the fastest path from origin to pickup
  const queue1: { position: Position; time: number; path: Position[] }[] = [
    { position: origin, time: 0, path: [] },
  ];
  const visited1: Record<Position, boolean> = {};

  while (queue1.length > 0) {
    queue1.sort((a, b) => a.time - b.time);
    const { position, time, path } = queue1.shift()!;

    if (position === pickup) {
      // Calculate the fastest path from pickup to destination
      const queue2: { position: Position; time: number; path: Position[] }[] = [
        { position: pickup, time, path },
      ];
      const visited2: Record<Position, boolean> = {};

      while (queue2.length > 0) {
        queue2.sort((a, b) => a.time - b.time);
        const { position, time, path } = queue2.shift()!;

        if (position === destination) {
          return { positions: path, time };
        } else if (!visited2[position]) {
          visited2[position] = true;
          const newQueue = Object.keys(timeMatrix[position]).map((nextPos) => ({
            position: nextPos,
            time: time + timeMatrix[position][nextPos],
            path: [...path, position],
          }));
          queue2.push(...newQueue);
        }
      }

      break;
    } else if (!visited1[position]) {
      visited1[position] = true;
      const newQueue = Object.keys(timeMatrix[position]).map((nextPos) => ({
        position: nextPos,
        time: time + timeMatrix[position][nextPos],
        path: [...path, position],
      }));
      queue1.push(...newQueue);
    }
  }

  throw new Error('Unable to find a path from origin to destination via pickup');
}



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { droneOrigin, objectPickup, deliveryDestination } = req.body;

  const timeMatrix = await fetchTimeMatrix();

  const { positions, time } = calculateFastestPath(timeMatrix, droneOrigin, objectPickup, deliveryDestination);

  res.json({ positions, time, timeMatrix });
}
