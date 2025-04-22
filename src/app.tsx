import { useCallback, useState } from 'react';
import ReactFlow, {
  addEdge,
  Connection,
  EdgeChange,
  NodeChange,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  applyNodeChanges,
  applyEdgeChanges,
  NodeTypes,
  EdgeTypes,
  Node,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { parseCSV } from './utils/dataParser';

// Define custom node types
const nodeTypes = {
  default: ({ data }: { data: { label: string } }) => (
    <div style={{ padding: '10px', border: '1px solid #1a192b', borderRadius: '3px', background: 'white' }}>
      {data.label}
    </div>
  ),
};

function App() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { fitView } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        data: { label: 'Click to edit' },
        labelStyle: { fill: '#000', fontWeight: 700 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
        labelBgPadding: [4, 4],
        labelBgBorderRadius: 4,
        type: 'default',
        labelShowBg: true,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const { nodes: newNodes, edges: newEdges } = await parseCSV(file);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNode = () => {
    setIsModalOpen(true);
  };

  const handleCreateNode = () => {
    if (!newNodeName.trim()) return;

    const newNode: Node = {
      id: newNodeName,
      type: 'default',
      data: { label: newNodeName },
      position: { x: Math.random() * 800, y: Math.random() * 600 },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeName('');
    setIsModalOpen(false);
  };

  const handleEdgeClick = (_event: React.MouseEvent, edge: any) => {
    setEditingEdge(edge.id);
    setEdgeLabel(edge.data?.label || '');
  };

  const handleEdgeLabelSubmit = () => {
    if (editingEdge) {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === editingEdge
            ? { 
                ...edge, 
                data: { ...edge.data, label: edgeLabel },
                labelStyle: { fill: '#000', fontWeight: 700 },
                labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
                labelBgPadding: [4, 4],
                labelBgBorderRadius: 4,
                type: 'default',
                labelShowBg: true,
              }
            : edge
        )
      );
      setEditingEdge(null);
      setEdgeLabel('');
    }
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    organizeHierarchy(node.id);
  };

  const organizeHierarchy = (rootNodeId: string) => {
    const visited = new Set<string>();
    const queue: { nodeId: string; level: number }[] = [{ nodeId: rootNodeId, level: 0 }];
    const newPositions: { [key: string]: { x: number; y: number } } = {};

    // Find all nodes connected to the root node
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);

      // Calculate position based on level
      const x = level * 200; // Horizontal spacing
      const y = (visited.size - 1) * 100; // Vertical spacing

      newPositions[nodeId] = { x, y };

      // Find connected nodes
      edges.forEach(edge => {
        if (edge.source === nodeId && !visited.has(edge.target)) {
          queue.push({ nodeId: edge.target, level: level + 1 });
        }
      });
    }

    // Update node positions
    setNodes(nds => 
      nds.map(node => {
        if (newPositions[node.id]) {
          return {
            ...node,
            position: newPositions[node.id],
          };
        }
        return node;
      })
    );

    // Fit view to show all nodes
    setTimeout(() => fitView({ duration: 800 }), 100);
  };

  return (
    <div className="app">
      <div className="upload-container">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ margin: '10px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button 
          onClick={handleAddNode} 
          style={{ 
            margin: '10px', 
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000
          }}
        >
          Add New Node
        </button>
        {isLoading && <div style={{ margin: '10px' }}>Processing file...</div>}
      </div>
      <div className="graph-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          onNodeClick={handleNodeClick}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          style={{ width: '100%', height: '100%' }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          panOnDrag={true}
          zoomOnScroll={true}
          attributionPosition="bottom-right"
          minZoom={0.5}
          maxZoom={2}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            animated: false,
            style: { stroke: '#b1b1b7', strokeWidth: 2 },
            labelStyle: { fill: '#000', fontWeight: 700 },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.7 },
            labelBgPadding: [4, 4],
            labelBgBorderRadius: 4,
            type: 'default',
            labelShowBg: true,
          }}
        >
          <Background />
          <Controls style={{ position: 'absolute', right: 10, top: 10 }} />
          <MiniMap style={{ position: 'absolute', right: 10, bottom: 10 }} />
        </ReactFlow>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Node</h3>
            <input
              type="text"
              value={newNodeName}
              onChange={(e) => setNewNodeName(e.target.value)}
              placeholder="Enter node name"
              style={{ margin: '10px 0', padding: '5px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCreateNode} style={{ padding: '5px 10px' }}>
                Create
              </button>
              <button onClick={() => setIsModalOpen(false)} style={{ padding: '5px 10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingEdge && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Edge Label</h3>
            <input
              type="text"
              value={edgeLabel}
              onChange={(e) => setEdgeLabel(e.target.value)}
              placeholder="Enter edge label"
              style={{ margin: '10px 0', padding: '5px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleEdgeLabelSubmit} style={{ padding: '5px 10px' }}>
                Save
              </button>
              <button onClick={() => setEditingEdge(null)} style={{ padding: '5px 10px' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;