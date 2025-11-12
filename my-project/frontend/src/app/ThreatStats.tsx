// 'use client';

// import React from 'react';

// type Props = {
//     totalCount: number;
//     byType?: Record<string, number>;
//     lastUpdated: string;
//   };

// export function ThreatStats({ totalCount, byType = {}, lastUpdated }: Props) {
//   return (
//     <div style={{ padding: 12, border: "1px solid #333", borderRadius: 8 }}>
//       <h3 style={{ margin: 0, marginBottom: 8 }}>Threat Stats</h3>
//       <div>Total received: {totalCount}</div>
//       {Object.keys(byType).length > 0 && (
//         <ul style={{ margin: "8px 0 0 0", paddingLeft: 16 }}>
//           {Object.entries(byType).map(([k, v]) => (
//             <li key={k}>{k}: {v}</li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }