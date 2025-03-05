import React, { useRouter } from "next/router";
import {
    Typography,
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
} from "@mui/material";
import ImageCarousel from "@/app/components/generic_components/ImageCarousel";
import StatusChip from "@/app/components/generic_components/StatusChip";
import { formatDate } from "@/app/utils/date";


interface GenericTableProps {
    contents: any;
    headers: {
        [x: string]: string;
    }[];
    withMedia?: boolean;
    onRowClick?: (value?: string) => void;

}

const GenericTable: React.FC<GenericTableProps> = ({ 
    contents,
    headers,
    withMedia,
    onRowClick
}) => {
    const router = useRouter();


        
    // If no contents, return a message
    if (!contents || contents.length === 0) {
        return (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                No data found
            </Typography>
        );
    }

    const sortedStories = [...contents].sort((a, b) => {
        // First, sort by status (ASC)
        const statusComparison = a.status.localeCompare(b.status);
        if (statusComparison !== 0) return statusComparison;
        
        // If statuses are the same, sort by createdAt (DESC)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <TableContainer sx={{ 
            maxHeight: 'calc(100vh - 100px)', 
            overflowY: 'auto',
        }}>
            <Table>
                <TableHead>
                    <TableRow>
                        {headers.map((header) => (
                            <TableCell key={header.key}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {header.label}
                                </Typography>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedStories.map((content) => (
                        <TableRow 
                            key={content.id} 
                            hover 
                            onClick={() => onRowClick?.(content.id)}
                        >
                            <TableCell>
                                <Typography variant="body2">
                                    {formatDate(content.createdAt)}
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer' }}
                            >
                                <Typography variant="h6">
                                    {content.title}
                                </Typography>
                            </TableCell>
                            <TableCell
                                sx={{ cursor: 'pointer' }}
                            >
                                <Typography variant="body2" sx={{ maxWidth: 400 }}>
                                    {content.text}
                                </Typography>
                            </TableCell>
                            {withMedia && 
                            <TableCell sx={{ maxWidth: 500 }}>
                                <ImageCarousel height={200} images={content.media} />
                            </TableCell>}
                            <TableCell>
                                <StatusChip status={content.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};


export default GenericTable