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
  Panel,
  EdgeText,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import { parseCSV } from './utils/dataParser';

function App() {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const [edgeLabel, setEdgeLabel] = useState('');

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

    const newNode = {
      id: newNodeName,
      data: { label: newNodeName },
      position: { x: Math.random() * 800, y: Math.random() * 600 },
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeName('');
    setIsModalOpen(false);
  };

  const handleEdgeClick = (event: React.MouseEvent, edge: any) => {
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
              }
            : edge
        )
      );
      setEditingEdge(null);
      setEdgeLabel('');
    }
  };

  return (
    <div className="app">
      <div className="upload-container">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ margin: '10px' }}
        />
        <button onClick={handleAddNode} style={{ margin: '10px', padding: '5px 10px' }}>
          Add New Node
        </button>
        {isLoading && <div style={{ margin: '10px' }}>Processing file...</div>}
      </div>
      <div className="graph-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          connectionMode="loose"
        >
          <Background />
          <Controls />
          <MiniMap />
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