import React from 'react';
import { Skeleton } from './Skeleton';

interface TableSkeletonProps {
  rows: number;
  columns: number;
}

export default function TableSkeleton({ rows, columns }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, row) => (
        <tr key={row}>
          {Array.from({ length: columns }).map((__, column) => (
            <td key={column}>
              <Skeleton height={14} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
