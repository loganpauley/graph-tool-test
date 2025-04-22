import Papa from 'papaparse';

export interface Node {
  id: string;
  type?: string;
  data: { label: string; [key: string]: any };
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  data?: { [key: string]: any };
}

export const parseCSV = async (file: File): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const { nodes, edges } = transformData(results.data);
          resolve({ nodes, edges });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => reject(error),
    });
  });
};

const transformData = (data: any[]): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();
  let nodeCount = 0;

  // Process each row in the CSV
  data.forEach((row, index) => {
    // Get source and target node names
    const sourceName = row.source_node_name?.toString();
    const targetName = row.destination_node_name?.toString();

    if (!sourceName || !targetName) {
      console.warn(`Skipping row ${index + 1}: Missing source or destination node name`);
      return;
    }

    // Create nodes if they don't exist
    if (!nodeMap.has(sourceName)) {
      nodes.push({
        id: sourceName,
        data: { label: sourceName },
        position: { x: Math.random() * 800, y: Math.random() * 600 },
      });
      nodeMap.set(sourceName, nodes[nodes.length - 1]);
    }

    if (!nodeMap.has(targetName)) {
      nodes.push({
        id: targetName,
        data: { label: targetName },
        position: { x: Math.random() * 800, y: Math.random() * 600 },
      });
      nodeMap.set(targetName, nodes[nodes.length - 1]);
    }

    // Create edge
    edges.push({
      id: `e${sourceName}-${targetName}-${index}`,
      source: sourceName,
      target: targetName,
      data: { ...row },
    });
  });

  return { nodes, edges };
}; 