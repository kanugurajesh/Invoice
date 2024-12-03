import React from 'react';

// Interface for column definitions
interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

// Interface for DataTable component props
interface DataTableProps {
  data: any[];
  columns: Column[];
}

// Component for displaying data in a table
const DataTable: React.FC<DataTableProps> = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(data) &&
            data.map((row) => (
              <tr
                key={row.id || Math.random().toString()}
                className="hover:bg-gray-50"
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${column.key}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(DataTable);
