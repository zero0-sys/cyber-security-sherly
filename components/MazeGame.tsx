import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Target, Code, Zap, CheckCircle, XCircle, AlertCircle, Volume2, VolumeX } from 'lucide-react';

type CellType = 'empty' | 'wall' | 'start' | 'end' | 'path' | 'visited';

interface Cell {
    x: number;
    y: number;
    type: CellType;
}

interface Position {
    x: number;
    y: number;
}

// Generate random maze using DFS algorithm with guaranteed solution
const generateMaze = (size: number): Cell[][] => {
    const maze: Cell[][] = [];

    // Initialize all walls
    for (let y = 0; y < size; y++) {
        maze[y] = [];
        for (let x = 0; x < size; x++) {
            maze[y][x] = { x, y, type: 'wall' };
        }
    }

    const stack: Position[] = [];
    const startX = 1;
    const startY = 1;

    // Ensure odd coordinates for path carving consistency
    maze[startY][startX].type = 'empty';
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors: { x: number, y: number, dx: number, dy: number }[] = [];

        // Check neighbors (jump 2 cells)
        const dirs = [
            { x: 0, y: -2 },
            { x: 0, y: 2 },
            { x: -2, y: 0 },
            { x: 2, y: 0 }
        ];

        for (const dir of dirs) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;

            if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && maze[ny][nx].type === 'wall') {
                neighbors.push({ x: nx, y: ny, dx: dir.x / 2, dy: dir.y / 2 });
            }
        }

        if (neighbors.length > 0) {
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

            // Carve path
            maze[randomNeighbor.y][randomNeighbor.x].type = 'empty';
            maze[current.y + randomNeighbor.dy][current.x + randomNeighbor.dx].type = 'empty';

            stack.push({ x: randomNeighbor.x, y: randomNeighbor.y });
        } else {
            stack.pop();
        }
    }

    // Ensure end is reachable - clear path to exit
    const endX = size - 2;
    const endY = size - 2;
    maze[endY][endX].type = 'empty';

    // Make sure at least one neighbor of exit is open
    if (maze[endY - 1][endX].type === 'wall' && maze[endY][endX - 1].type === 'wall') {
        maze[endY - 1][endX].type = 'empty';
    }

    // Set start and end markers
    maze[1][1].type = 'start';
    maze[endY][endX].type = 'end';

    return maze;
};

// Python to JavaScript transpiler examples
const PYTHON_TEMPLATE = `# Python Pathfinding Code (BFS for Shortest Path)
# Available functions:
# - move_up(), move_down(), move_left(), move_right()
# - get_position(): Returns {'x': x, 'y': y}
# - is_wall(x, y): Returns True/False
# - is_end(x, y): Returns True/False

def find_shortest_path():
    # Breadth-First Search (BFS) for optimal path
    start_pos = get_position()
    start_key = str(start_pos['x']) + ',' + str(start_pos['y'])
    
    queue = [start_pos]
    visited = {start_key}
    parent = {} # To reconstruct path
    
    while len(queue) > 0:
        current = queue.pop(0)
        curr_key = str(current['x']) + ',' + str(current['y'])
        
        if is_end(current['x'], current['y']):
            # Backtrack to find path
            path = []
            while curr_key in parent:
                prev_info = parent[curr_key]
                path.insert(0, prev_info['dir'])
                curr_key = prev_info['key']
            return path
            
        # Check all 4 directions
        moves = [
            {'dx': 0, 'dy': -1, 'name': 'up'},
            {'dx': 0, 'dy': 1, 'name': 'down'},
            {'dx': -1, 'dy': 0, 'name': 'left'},
            {'dx': 1, 'dy': 0, 'name': 'right'}
        ]
        
        for move in moves:
            nx = current['x'] + move['dx']
            ny = current['y'] + move['dy']
            n_key = str(nx) + ',' + str(ny)
            
            if not is_wall(nx, ny) and n_key not in visited:
                visited.add(n_key)
                queue.append({'x': nx, 'y': ny})
                parent[n_key] = {'key': curr_key, 'dir': move['name']}
                
    return []

# Execute and follow path
path = find_shortest_path()
for move in path:
    if move == 'up': move_up()
    elif move == 'down': move_down()
    elif move == 'left': move_left()
    elif move == 'right': move_right()
`;

const JS_TEMPLATE = `// JavaScript Pathfinding (BFS for Shortest Path)

async function findShortestPath() {
  const start = getPosition();
  const queue = [start];
  const visited = new Set([start.x + ',' + start.y]);
  const parent = new Map(); // tracks path: key -> {parentKey, direction}

  while (queue.length > 0) {
    const current = queue.shift();
    const currentKey = current.x + ',' + current.y;

    if (isEnd(current.x, current.y)) {
      // Reconstruct path
      const path = [];
      let traceKey = currentKey;
      while (parent.has(traceKey)) {
        const info = parent.get(traceKey);
        path.unshift(info.direction);
        traceKey = info.parentKey;
      }
      return path;
    }

    const moves = [
      { dx: 0, dy: -1, dir: 'up' },
      { dx: 0, dy: 1, dir: 'down' },
      { dx: -1, dy: 0, dir: 'left' },
      { dx: 1, dy: 0, dir: 'right' }
    ];

    for (const move of moves) {
      const nx = current.x + move.dx;
      const ny = current.y + move.dy;
      const nextKey = nx + ',' + ny;

      if (!isWall(nx, ny) && !visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push({ x: nx, y: ny });
        parent.set(nextKey, { parentKey: currentKey, direction: move.dir });
      }
    }
  }
  return [];
}

// Execute logic
const path = await findShortestPath();
for (const dir of path) {
  if (dir === 'up') await moveUp();
  else if (dir === 'down') await moveDown();
  else if (dir === 'left') await moveLeft();
  else if (dir === 'right') await moveRight();
}`;

const MazeGame: React.FC = () => {
    const [level, setLevel] = useState(() => parseInt(localStorage.getItem('mazeLevel') || '1'));
    const [mazeSize, setMazeSize] = useState(() => Math.min(10 + (parseInt(localStorage.getItem('mazeLevel') || '1')) * 2, 25));
    const [maze, setMaze] = useState<Cell[][]>(() => generateMaze(Math.min(10 + (parseInt(localStorage.getItem('mazeLevel') || '1')) * 2, 25)));
    const [mousePos, setMousePos] = useState<Position>({ x: 1, y: 1 });
    const [trail, setTrail] = useState<Position[]>([{ x: 1, y: 1 }]);
    const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
    const [code, setCode] = useState(JS_TEMPLATE);
    const [isRunning, setIsRunning] = useState(false);
    const [gameStatus, setGameStatus] = useState<'idle' | 'running' | 'win' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [moves, setMoves] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element for cat meow
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBg1b3');
    }, []);

    const playMeowSound = () => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
    };

    const nextLevel = () => {
        const newLevel = level + 1;
        const newSize = Math.min(10 + newLevel * 2, 25); // Increase size, max 25x25
        setLevel(newLevel);
        setMazeSize(newSize);
        localStorage.setItem('mazeLevel', newLevel.toString());
        const newMaze = generateMaze(newSize);
        setMaze(newMaze);
        resetProgress();
    };

    const resetProgress = () => {
        setMousePos({ x: 1, y: 1 });
        setTrail([{ x: 1, y: 1 }]);
        setGameStatus('idle');
        setErrorMessage('');
        setMoves(0);
    };

    const resetGame = () => {
        resetProgress();
    };

    const newMaze = () => {
        const newMaze = generateMaze(mazeSize);
        setMaze(newMaze);
        resetProgress();
    };

    const switchLanguage = (lang: 'javascript' | 'python') => {
        setLanguage(lang);
        setCode(lang === 'javascript' ? JS_TEMPLATE : PYTHON_TEMPLATE);
    };

    const runCode = async () => {
        resetProgress();
        setIsRunning(true);
        setGameStatus('running');

        let currentPos = { x: 1, y: 1 };
        let moveCount = 0;
        let currentTrail: Position[] = [{ x: 1, y: 1 }];

        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        const updatePosition = async (newPos: Position) => {
            await delay(150); // Smooth animation delay
            currentPos = { ...newPos };
            moveCount++;
            currentTrail.push({ ...newPos });
            setMousePos({ ...currentPos });
            setTrail([...currentTrail]);
            setMoves(moveCount);
        };

        // Movement functions
        const moveUp = async () => {
            if (currentPos.y > 0 && maze[currentPos.y - 1][currentPos.x].type !== 'wall') {
                await updatePosition({ x: currentPos.x, y: currentPos.y - 1 });
            }
        };

        const moveDown = async () => {
            if (currentPos.y < mazeSize - 1 && maze[currentPos.y + 1][currentPos.x].type !== 'wall') {
                await updatePosition({ x: currentPos.x, y: currentPos.y + 1 });
            }
        };

        const moveLeft = async () => {
            if (currentPos.x > 0 && maze[currentPos.y][currentPos.x - 1].type !== 'wall') {
                await updatePosition({ x: currentPos.x - 1, y: currentPos.y });
            }
        };

        const moveRight = async () => {
            if (currentPos.x < mazeSize - 1 && maze[currentPos.y][currentPos.x + 1].type !== 'wall') {
                await updatePosition({ x: currentPos.x + 1, y: currentPos.y });
            }
        };

        const getPosition = () => ({ ...currentPos });
        const isWall = (x: number, y: number) => {
            if (x < 0 || x >= mazeSize || y < 0 || y >= mazeSize) return true;
            return maze[y][x].type === 'wall';
        };
        const isEnd = (x: number, y: number) => x === mazeSize - 2 && y === mazeSize - 2;

        try {
            // Create AsyncFunction constructor
            const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

            if (language === 'javascript') {
                const userFunction = new AsyncFunction(
                    'moveUp', 'moveDown', 'moveLeft', 'moveRight',
                    'getPosition', 'isWall', 'isEnd',
                    code
                );
                await userFunction(moveUp, moveDown, moveLeft, moveRight, getPosition, isWall, isEnd);
            } else {
                // Python to JS - indentation-aware transpiler
                const lines = code.split('\n');
                const jsLines: string[] = [];
                const indentStack: number[] = [0]; // Track indentation levels for closing braces

                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];

                    // Skip empty lines and comments
                    if (line.trim() === '' || line.trim().startsWith('#')) {
                        jsLines.push('');
                        continue;
                    }

                    // Calculate indentation
                    const indent = line.length - line.trimStart().length;
                    const trimmed = line.trimStart();

                    // Close blocks when indentation decreases
                    while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
                        indentStack.pop();
                        const closingIndent = ' '.repeat(indentStack[indentStack.length - 1]);
                        jsLines.push(closingIndent + '}');
                    }

                    const currentIndent = ' '.repeat(indent);
                    let jsLine = trimmed;

                    // --- Transform Python constructs ---

                    // Function def
                    if (/^def\s+/.test(jsLine)) {
                        jsLine = jsLine.replace(/^def\s+(\w+)\s*\(([^)]*)\)\s*:/, 'async function $1($2) {');
                        indentStack.push(indent + 4);
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // For loop: for x in y:
                    if (/^for\s+/.test(jsLine)) {
                        jsLine = jsLine.replace(/^for\s+(\w+)\s+in\s+(.+):$/, 'for (const $1 of $2) {');
                        indentStack.push(indent + 4);
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // While loop
                    if (/^while\s+/.test(jsLine)) {
                        jsLine = jsLine.replace(/^while\s+(.+):$/, 'while ($1) {');
                        indentStack.push(indent + 4);
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // elif
                    if (/^elif\s+/.test(jsLine)) {
                        jsLine = jsLine.replace(/^elif\s+(.+):$/, '} else if ($1) {');
                        // Pop and re-push (same block level)
                        if (indentStack.length > 1 && indentStack[indentStack.length - 1] === indent + 4) {
                            // already at correct level
                        } else {
                            indentStack.push(indent + 4);
                        }
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // if statement (must be after elif check)
                    if (/^if\s+/.test(jsLine)) {
                        jsLine = jsLine.replace(/^if\s+(.+):$/, 'if ($1) {');
                        indentStack.push(indent + 4);
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // else:
                    if (/^else\s*:/.test(jsLine)) {
                        jsLine = '} else {';
                        jsLines.push(currentIndent + jsLine);
                        continue;
                    }

                    // return statement
                    if (/^return\s/.test(jsLine)) {
                        // just keep as-is, transform contents below
                    }

                    // Now do inline replacements on the line
                    // Python API to JS API
                    jsLine = jsLine.replace(/move_up\(\)/g, 'await moveUp()');
                    jsLine = jsLine.replace(/move_down\(\)/g, 'await moveDown()');
                    jsLine = jsLine.replace(/move_left\(\)/g, 'await moveLeft()');
                    jsLine = jsLine.replace(/move_right\(\)/g, 'await moveRight()');
                    jsLine = jsLine.replace(/get_position\(\)/g, 'getPosition()');
                    jsLine = jsLine.replace(/is_wall\b/g, 'isWall');
                    jsLine = jsLine.replace(/is_end\b/g, 'isEnd');

                    // str(x) -> String(x)
                    jsLine = jsLine.replace(/\bstr\(/g, 'String(');

                    // len(x) -> x.length  (simple case)
                    jsLine = jsLine.replace(/\blen\(([^)]+)\)/g, '$1.length');

                    // Python set literal {val} -> new Set([val])
                    // visited = {start_key} -> visited = new Set([start_key])
                    jsLine = jsLine.replace(/^(\w+)\s*=\s*\{(\w+)\}\s*$/, '$1 = new Set([$2])');

                    // Python dict literal {} (empty) -> new Map() or just {}
                    // parent = {} -> parent = {}  (this is fine for JS too)

                    // .add( -> .add(  (Set.add is same in JS)
                    // .append( -> .push(
                    jsLine = jsLine.replace(/\.append\(/g, '.push(');
                    // .insert(0, x) -> .unshift(x)
                    jsLine = jsLine.replace(/\.insert\(0,\s*/g, '.unshift(');
                    // .pop(0) -> .shift()
                    jsLine = jsLine.replace(/\.pop\(0\)/g, '.shift()');

                    // "x not in y" -> !y.has(x) for Sets
                    jsLine = jsLine.replace(/(\w+)\s+not\s+in\s+(\w+)/g, '!$2.has($1)');
                    // Plain "x in y" is left as-is — JS `in` operator works on Objects

                    // Boolean/None
                    jsLine = jsLine.replace(/\bTrue\b/g, 'true');
                    jsLine = jsLine.replace(/\bFalse\b/g, 'false');
                    jsLine = jsLine.replace(/\bNone\b/g, 'null');

                    // Logic operators
                    jsLine = jsLine.replace(/\bnot\s+/g, '!');
                    jsLine = jsLine.replace(/\band\b/g, '&&');
                    jsLine = jsLine.replace(/\bor\b/g, '||');

                    // Variable declarations: simple assignments without let/const
                    // Add let for first assignment (approximate, works for template)
                    if (/^\w+\s*=\s/.test(jsLine) && !/^(let|const|var|return)\s/.test(jsLine)) {
                        jsLine = 'let ' + jsLine;
                    }

                    jsLines.push(currentIndent + jsLine);
                }

                // Close any remaining open blocks
                while (indentStack.length > 1) {
                    indentStack.pop();
                    const closingIndent = ' '.repeat(indentStack[indentStack.length - 1]);
                    jsLines.push(closingIndent + '}');
                }

                const pythonToJs = jsLines.join('\n');

                const userFunction = new AsyncFunction(
                    'moveUp', 'moveDown', 'moveLeft', 'moveRight',
                    'getPosition', 'isWall', 'isEnd',
                    pythonToJs
                );
                await userFunction(moveUp, moveDown, moveLeft, moveRight, getPosition, isWall, isEnd);
            }

            // Check win condition
            if (currentPos.x === mazeSize - 2 && currentPos.y === mazeSize - 2) {
                setGameStatus('win');
                playMeowSound();
            } else {
                setGameStatus('error');
                setErrorMessage('Did not reach the exit!');
            }
        } catch (error: any) {
            setGameStatus('error');
            setErrorMessage(`Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const cellSize = Math.max(20, Math.min(40, 400 / mazeSize));

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Header */}
            <div className="p-4 border-b border-green-900 bg-black">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h2 className="font-orbitron font-bold text-white text-xl flex items-center gap-2">
                        <Target className="text-green-500" size={24} />
                        Advanced Maze Pathfinding
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="bg-black border border-purple-900 rounded px-3 py-1 text-xs">
                            <span className="text-gray-500">Level:</span>
                            <span className="text-purple-400 font-bold ml-2">{level}</span>
                        </div>
                        <div className="bg-black border border-green-900 rounded px-3 py-1 text-xs">
                            <span className="text-gray-500">Size:</span>
                            <span className="text-green-400 font-bold ml-2">{mazeSize}x{mazeSize}</span>
                        </div>
                        <div className="bg-black border border-blue-900 rounded px-3 py-1 text-xs">
                            <span className="text-gray-500">Moves:</span>
                            <span className="text-blue-400 font-bold ml-2">{moves}</span>
                        </div>
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="px-2 py-2 bg-gray-900/30 text-gray-400 border border-gray-900 rounded hover:bg-gray-900/50 transition-colors"
                        >
                            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                        </button>
                        <button
                            onClick={newMaze}
                            className="px-3 py-2 bg-blue-900/30 text-blue-400 border border-blue-900 rounded hover:bg-blue-900/50 transition-colors flex items-center gap-2 text-sm"
                        >
                            <RotateCcw size={14} />
                            New Maze
                        </button>
                        <button
                            onClick={resetGame}
                            className="px-3 py-2 bg-yellow-900/30 text-yellow-400 border border-yellow-900 rounded hover:bg-yellow-900/50 transition-colors flex items-center gap-2 text-sm"
                        >
                            <RotateCcw size={14} />
                            Reset
                        </button>
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className={`px-4 py-2 rounded font-bold text-sm transition-all flex items-center gap-2 ${isRunning
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-black hover:bg-green-500'
                                }`}
                        >
                            <Play size={14} />
                            {isRunning ? 'Running...' : 'Run'}
                        </button>
                    </div>
                </div>

                {gameStatus === 'win' && (
                    <div className="bg-green-900/20 border-2 border-green-500 rounded p-3 flex items-center justify-between animate-pulse">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            <span className="text-green-400 font-bold">🎉 Level {level} Complete! {moves} moves</span>
                        </div>
                        <button
                            onClick={nextLevel}
                            className="px-4 py-2 bg-green-600 text-black rounded font-bold hover:bg-green-500 flex items-center gap-2"
                        >
                            <Zap size={14} />
                            Next Level
                        </button>
                    </div>
                )}

                {gameStatus === 'error' && (
                    <div className="bg-red-900/20 border-2 border-red-500 rounded p-3 flex items-center gap-2">
                        <XCircle className="text-red-500" size={20} />
                        <span className="text-red-400 font-bold">{errorMessage}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden">
                {/* Maze */}
                <div className="flex flex-col gap-3 overflow-auto">
                    <div className="bg-gray-900/50 border border-green-900 rounded p-4">
                        <div className="inline-block bg-black p-4 rounded border border-green-900/30">
                            <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${mazeSize}, ${cellSize}px)` }}>
                                {maze.map((row, y) =>
                                    row.map((cell, x) => {
                                        const isCurrentPos = mousePos.x === x && mousePos.y === y;
                                        const trailIndex = trail.findIndex(t => t.x === x && t.y === y);
                                        const isInTrail = trailIndex !== -1;

                                        return (
                                            <div
                                                key={`${x}-${y}`}
                                                className={`flex items-center justify-center transition-all duration-150 ${cell.type === 'wall'
                                                    ? 'bg-green-900/40 border border-green-500/50 shadow-[0_0_5px_rgba(34,197,94,0.3)]'
                                                    : cell.type === 'start'
                                                        ? 'bg-black border border-blue-900' // Changed start to subtle background
                                                        : cell.type === 'end'
                                                            ? 'bg-yellow-500'
                                                            : isInTrail
                                                                ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]'
                                                                : 'bg-black'
                                                    }`}
                                                style={{
                                                    width: `${cellSize}px`,
                                                    height: `${cellSize}px`,
                                                    opacity: isInTrail ? 1 : cell.type === 'wall' ? 0.8 : 1,
                                                    borderRadius: isInTrail ? '20%' : '0px'
                                                }}
                                            >
                                                {/* Player is now Blue */}
                                                {isCurrentPos && (
                                                    <div className="w-4/5 h-4/5 bg-blue-600 rounded animate-pulse shadow-lg shadow-blue-500/50 border border-blue-400"></div>
                                                )}
                                                {cell.type === 'start' && !isCurrentPos && (
                                                    <div className="w-2 h-2 bg-blue-900/50 rounded-full"></div> // Start marker
                                                )}
                                                {cell.type === 'end' && !isCurrentPos && (
                                                    <Trophy className="text-yellow-400" size={Math.min(16, cellSize * 0.6)} />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-orange-900/20 border border-orange-500 rounded p-3 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertCircle className="text-orange-400" size={14} />
                            <span className="text-orange-400 font-bold">Progressive Challenge</span>
                        </div>
                        <p className="text-orange-300">
                            Each level increases maze complexity. Blue square shows current position, red trail shows path taken.
                        </p>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex flex-col bg-gray-900/50 border border-green-900 rounded overflow-hidden">
                    <div className="p-3 border-b border-green-900 flex items-center justify-between bg-black">
                        <h3 className="text-green-400 font-bold flex items-center gap-2">
                            <Code size={16} />
                            Code Editor
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => switchLanguage('javascript')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'javascript'
                                    ? 'bg-yellow-600 text-black'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                JavaScript
                            </button>
                            <button
                                onClick={() => switchLanguage('python')}
                                className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'python'
                                    ? 'bg-blue-600 text-black'
                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    }`}
                            >
                                Python
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={isRunning}
                        className="flex-1 bg-black text-green-400 font-mono text-xs p-4 focus:outline-none resize-none border-none"
                        style={{ minHeight: '400px' }}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default MazeGame;
