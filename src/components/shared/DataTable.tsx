import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define a flexible interface for your column definitions
interface ColumnDefinition {
  header: string; // The text to display in the table header
  accessorKey?: string; // Optional: A key to directly access a property from the data row
  id?: string; // Optional: A unique identifier for the column (useful for keys)
  // 'cell' provides a custom React component for rendering cell content
  cell?: ({ row }: { row: any }) => React.ReactNode;
  // 'accessorFn' is a function to derive cell content from the row data
  accessorFn?: (row: any) => any; // Can return string, number, or other renderable content
}

// Props for the DataTable component
interface DataTableProps {
  columns: ColumnDefinition[]; // Array of column definitions
  data: any[]; // Array of data objects to display
}

export function DataTable({ columns, data }: DataTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              // Use a stable key for each header column
              // Prioritize 'id', then 'accessorKey', then 'header' text as a fallback
              <TableHead key={column.id || column.accessorKey || column.header}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              // Use a stable key for each row. If your data objects have a unique 'ID' field, use that.
              // Otherwise, 'rowIndex' is a fallback but less stable if data order changes.
              <TableRow key={row.ID || rowIndex}>
                {columns.map((column, colIndex) => {
                  let cellContent: React.ReactNode = null; // Initialize cell content

                  // Determine how to get the content for the cell
                  if (column.cell) {
                    // Option 1: If a custom 'cell' renderer is provided, use it
                    cellContent = column.cell({ row });
                  } else if (column.accessorFn) {
                    // Option 2: If an 'accessorFn' is provided, call it with the current row
                    cellContent = column.accessorFn(row);
                  } else if (column.accessorKey) {
                    // Option 3: If an 'accessorKey' is provided, directly access the property on the row
                    cellContent = row[column.accessorKey];
                  }

                  // Generate a stable key for each table cell
                  // Prioritize 'column.id', then 'column.accessorKey', then a combination for uniqueness
                  const cellKey = column.id || column.accessorKey || `${column.header}-${colIndex}`;

                  return (
                    <TableCell key={cellKey}>
                      {cellContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            // Display a message if there's no data
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}