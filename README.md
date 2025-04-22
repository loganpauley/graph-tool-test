# Graph Visualization Tool

I made this graph visualization tool with React and ReactFlow to test out some functioanlity for synthetic edges. This tool allows you to create, edit, and visualize complex networks with ease.

![Graph Tool Screenshot](docs/assets/graph-tool-screenshot.png)

## Features

### Node Management
- **Create Nodes**: Add new nodes with custom names
- **Drag & Drop**: Move nodes freely around the canvas
- **CSV Import**: Import node data from CSV files
- **Visual Customization**: Nodes are styled for optimal visibility

### Edge Management
- **Dynamic Connections**: Create connections by dragging between nodes
- **Edge Labels**: Add and edit descriptive labels for connections
- **Interactive Editing**: Click on edges to modify their labels
- **Visual Feedback**: Hover effects and clear labeling

### Data Import
- **CSV Support**: Import complex network data from spreadsheets
- **Automatic Parsing**: Converts CSV data into nodes and edges
- **Column Mapping**: Uses `source_node_name` and `destination_node_name` for connections
- **Data Preservation**: Maintains all additional CSV data in edge properties

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/loganpauley/graph-tool-test.git
   cd graph-tool-test
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
```

## Usage

### Creating a Graph
1. **Add Nodes**:
   - Click the "Add New Node" button
   - Enter a name for the node
   - Click "Create"

2. **Create Connections**:
   - Click and drag from one node to another
   - The edge will automatically be created
   - Click on the edge to add/edit its label

3. **Import Data**:
   - Click the file upload button
   - Select a CSV file with the following columns:
     - `source_node_name`: Name of the source node
     - `destination_node_name`: Name of the target node
     - Additional columns will be stored in edge data

### CSV Format
Your CSV file should follow this structure:
```csv
source_node_name,destination_node_name,additional_data1,additional_data2
Node A,Node B,value1,value2
Node B,Node C,value3,value4
```

## Technical Details

### Architecture
- Built with React and TypeScript
- Uses ReactFlow for graph visualization
- Implements PapaParse for CSV processing
- Responsive design for all screen sizes

### Key Components
- `App.tsx`: Main application component
- `dataParser.ts`: CSV parsing and data transformation
- `App.css`: Styling and visual customization

### State Management
- Uses React's useState and useCallback hooks
- Implements ReactFlow's useNodesState and useEdgesState
- Manages modal states for node and edge editing

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [ReactFlow](https://reactflow.dev/) for the graph visualization library
- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [Vite](https://vitejs.dev/) for the build tool 
